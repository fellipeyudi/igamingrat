import { neon } from "@neondatabase/serverless"
import {
  sendWhatsAppMessage,
  formatarAlteracaoStatusTask,
  formatarEdicaoTask,
  NOTIFICATION_GROUP_ID,
} from "@/lib/whatsapp"

const sql = neon(
  "postgresql://neondb_owner:npg_TNMj2X4HrqEw@ep-misty-mode-acoot3dc-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
)

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { id } = params
    const {
      titulo,
      descricao,
      status,
      prioridade,
      atribuido_para,
      mentorado_id,
      data_limite,
      tags,
      checklist,
      anexos,
      horario,
      arquivado,
    } = body

    const [taskAnterior] = await sql`
      SELECT t.*, m.nome as mentorado_nome
      FROM tasks t
      LEFT JOIN mentorados m ON t.mentorado_id = m.id
      WHERE t.id = ${id}
    `

    const checklistAnterior = await sql`
      SELECT texto, concluido
      FROM task_checklist_items
      WHERE task_id = ${id}
      ORDER BY ordem
    `

    // Atualizar a task
    await sql`
      UPDATE tasks
      SET 
        titulo = COALESCE(${titulo}, titulo),
        descricao = COALESCE(${descricao}, descricao),
        status = COALESCE(${status}, status),
        prioridade = COALESCE(${prioridade}, prioridade),
        atribuido_para = COALESCE(${atribuido_para}, atribuido_para),
        mentorado_id = COALESCE(${mentorado_id}, mentorado_id),
        data_limite = COALESCE(${data_limite}, data_limite),
        horario = COALESCE(${horario}, horario),
        anexos = COALESCE(${anexos ? JSON.stringify(anexos) : null}::jsonb, anexos),
        arquivado = COALESCE(${arquivado}, arquivado),
        data_conclusao = CASE 
          WHEN ${status} = 'concluido' AND data_conclusao IS NULL 
          THEN CURRENT_TIMESTAMP 
          ELSE data_conclusao 
        END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `

    // Atualizar tags se fornecidas
    if (tags !== undefined) {
      await sql`DELETE FROM task_tag_relations WHERE task_id = ${id}`

      if (tags.length > 0) {
        for (const tagId of tags) {
          await sql`
            INSERT INTO task_tag_relations (task_id, tag_id)
            VALUES (${id}, ${tagId})
            ON CONFLICT DO NOTHING
          `
        }
      }
    }

    // Atualizar checklist se fornecida
    if (checklist !== undefined) {
      await sql`DELETE FROM task_checklist_items WHERE task_id = ${id}`

      if (checklist.length > 0) {
        for (let i = 0; i < checklist.length; i++) {
          await sql`
            INSERT INTO task_checklist_items (task_id, texto, concluido, ordem)
            VALUES (${id}, ${checklist[i].texto}, ${checklist[i].concluido || false}, ${i})
          `
        }
      }
    }

    if (taskAnterior) {
      try {
        // Alteração de status
        if (status && status !== taskAnterior.status) {
          const mensagem = formatarAlteracaoStatusTask({
            titulo: taskAnterior.titulo,
            descricao: taskAnterior.descricao,
            statusAnterior: taskAnterior.status,
            statusNovo: status,
            atribuido_para: atribuido_para || taskAnterior.atribuido_para,
            mentorado_nome: taskAnterior.mentorado_nome,
            data_limite: taskAnterior.data_limite,
            horario: horario || taskAnterior.horario,
            checklist: checklistAnterior,
          })

          await sendWhatsAppMessage(NOTIFICATION_GROUP_ID, mensagem, "alteracao_status_task")
          console.log("[v0] Notificação de alteração de status enviada via WhatsApp")
        }
        // Outras alterações (título, descrição, prioridade, etc)
        else {
          const alteracoes: string[] = []

          if (titulo && titulo !== taskAnterior.titulo) {
            alteracoes.push(`Título alterado`)
          }
          if (descricao && descricao !== taskAnterior.descricao) {
            alteracoes.push(`Descrição atualizada`)
          }
          if (prioridade && prioridade !== taskAnterior.prioridade) {
            alteracoes.push(`Prioridade alterada para ${prioridade}`)
          }
          if (atribuido_para && atribuido_para !== taskAnterior.atribuido_para) {
            alteracoes.push(`Reatribuída para ${atribuido_para}`)
          }
          if (data_limite && data_limite !== taskAnterior.data_limite) {
            alteracoes.push(`Data limite alterada`)
          }
          if (anexos && JSON.stringify(anexos) !== JSON.stringify(taskAnterior.anexos)) {
            alteracoes.push(`Anexos atualizados`)
          }
          if (checklist && checklist.length > 0) {
            alteracoes.push(`Checklist atualizado`)
          }

          if (alteracoes.length > 0) {
            const mensagem = formatarEdicaoTask({
              titulo: titulo || taskAnterior.titulo,
              descricao: descricao || taskAnterior.descricao,
              alteracoes,
              atribuido_para: atribuido_para || taskAnterior.atribuido_para,
              mentorado_nome: taskAnterior.mentorado_nome,
              data_limite: data_limite || taskAnterior.data_limite,
              horario: horario || taskAnterior.horario,
              checklist: checklist || checklistAnterior,
            })

            await sendWhatsAppMessage(NOTIFICATION_GROUP_ID, mensagem, "edicao_task")
            console.log("[v0] Notificação de edição enviada via WhatsApp")
          }
        }
      } catch (whatsappError) {
        console.error("[v0] Erro ao enviar notificação WhatsApp:", whatsappError)
      }
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error("Erro ao atualizar task:", error)
    return Response.json({ error: "Erro ao atualizar task" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    await sql`DELETE FROM tasks WHERE id = ${id}`

    return Response.json({ success: true })
  } catch (error) {
    console.error("Erro ao deletar task:", error)
    return Response.json({ error: "Erro ao deletar task" }, { status: 500 })
  }
}
