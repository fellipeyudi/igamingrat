import { neon } from "@neondatabase/serverless"
import { sendWhatsAppMessage, formatarMensagemTask, formatarLembreteTask, NOTIFICATION_GROUP_ID } from "@/lib/whatsapp"

const sql = neon(
  "postgresql://neondb_owner:npg_TNMj2X4HrqEw@ep-misty-mode-acoot3dc-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
)

export async function GET() {
  try {
    // Buscar todas as tasks com tags e checklist
    const tasks = await sql`
      SELECT 
        t.*,
        m.nome as mentorado_nome,
        m.slug as mentorado_slug,
        json_agg(
          DISTINCT jsonb_build_object(
            'id', tt.id,
            'nome', tt.nome,
            'cor', tt.cor
          )
        ) FILTER (WHERE tt.id IS NOT NULL) as tags,
        (
          SELECT json_agg(
            jsonb_build_object(
              'id', ci.id,
              'texto', ci.texto,
              'concluido', ci.concluido,
              'ordem', ci.ordem
            ) ORDER BY ci.ordem
          )
          FROM task_checklist_items ci
          WHERE ci.task_id = t.id
        ) as checklist,
        (
          SELECT COUNT(*)::int
          FROM task_checklist_items ci
          WHERE ci.task_id = t.id
        ) as total_checklist,
        (
          SELECT COUNT(*)::int
          FROM task_checklist_items ci
          WHERE ci.task_id = t.id AND ci.concluido = true
        ) as checklist_concluidos,
        (
          SELECT json_agg(
            jsonb_build_object(
              'id', tc.id,
              'autor', tc.autor,
              'comentario', tc.comentario,
              'created_at', tc.created_at
            ) ORDER BY tc.created_at DESC
          )
          FROM task_comments tc
          WHERE tc.task_id = t.id
        ) as comentarios
      FROM tasks t
      LEFT JOIN mentorados m ON t.mentorado_id = m.id
      LEFT JOIN task_tag_relations ttr ON t.id = ttr.task_id
      LEFT JOIN task_tags tt ON ttr.tag_id = tt.id
      GROUP BY t.id, m.nome, m.slug
      ORDER BY 
        CASE t.prioridade
          WHEN 'urgente' THEN 1
          WHEN 'alta' THEN 2
          WHEN 'media' THEN 3
          WHEN 'baixa' THEN 4
        END,
        t.data_limite ASC NULLS LAST,
        t.created_at DESC
    `

    // Buscar todas as tags disponíveis
    const tags = await sql`
      SELECT * FROM task_tags ORDER BY nome
    `

    // Buscar todos os mentorados para o dropdown
    const mentorados = await sql`
      SELECT id, nome, slug FROM mentorados ORDER BY nome
    `

    return Response.json({
      tasks,
      tags,
      mentorados,
    })
  } catch (error) {
    console.error("Erro ao buscar tasks:", error)
    return Response.json({ error: "Erro ao buscar tasks" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      titulo,
      descricao,
      status,
      prioridade,
      atribuido_para,
      mentorado_id,
      data_limite,
      criado_por,
      tags,
      checklist,
      anexos,
      horario,
    } = body

    const [task] = await sql`
      INSERT INTO tasks (
        titulo, descricao, status, prioridade, atribuido_para,
        mentorado_id, data_limite, criado_por, anexos, horario_limite
      )
      VALUES (
        ${titulo}, ${descricao}, ${status || "todo"}, ${prioridade || "media"},
        ${atribuido_para}, ${mentorado_id || null}, ${data_limite || null}, ${criado_por},
        ${anexos ? JSON.stringify(anexos) : "[]"}::jsonb, ${horario || null}
      )
      RETURNING *
    `

    if (tags && tags.length > 0) {
      for (const tagId of tags) {
        await sql`
          INSERT INTO task_tag_relations (task_id, tag_id)
          VALUES (${task.id}, ${tagId})
          ON CONFLICT DO NOTHING
        `
      }
    }

    if (checklist && checklist.length > 0) {
      for (let i = 0; i < checklist.length; i++) {
        const item = checklist[i]
        await sql`
          INSERT INTO task_checklist_items (task_id, texto, concluido, ordem)
          VALUES (
            ${task.id}, 
            ${typeof item === "string" ? item : item.texto}, 
            ${typeof item === "string" ? false : item.concluido || false},
            ${i}
          )
        `
      }
    }

    try {
      let mentorado_nome = null
      if (mentorado_id) {
        const mentorado = await sql`
          SELECT nome FROM mentorados WHERE id = ${mentorado_id}
        `
        mentorado_nome = mentorado[0]?.nome
      }

      let dataFormatada = null
      if (data_limite) {
        const [year, month, day] = data_limite.split("-")
        dataFormatada = `${day}/${month}/${year}`
      }

      const mensagem = formatarMensagemTask({
        titulo,
        descricao,
        prioridade: prioridade || "media",
        atribuido_para,
        mentorado_nome,
        data_limite: dataFormatada,
        horario,
      })

      const logInicial = await sql`
        INSERT INTO whatsapp_logs (telefone, mensagem, tipo, status, mentorado_id, enviado_por)
        VALUES (
          ${NOTIFICATION_GROUP_ID},
          ${mensagem},
          'task_criada',
          'enviando',
          ${mentorado_id || null},
          ${criado_por || "sistema"}
        )
        RETURNING id
      `

      const logId = logInicial[0].id

      sendWhatsAppMessage(NOTIFICATION_GROUP_ID, mensagem)
        .then(async (resultado) => {
          await sql`
            UPDATE whatsapp_logs
            SET 
              status = ${resultado.success ? "sucesso" : "erro"},
              response_data = ${JSON.stringify(resultado.response || {})},
              error_message = ${resultado.error || null}
            WHERE id = ${logId}
          `
          console.log("[v0] WhatsApp notificação de task enviada:", resultado)
        })
        .catch(async (error) => {
          await sql`
            UPDATE whatsapp_logs
            SET 
              status = 'erro',
              error_message = ${error.message}
            WHERE id = ${logId}
          `
          console.error("[v0] Erro ao enviar WhatsApp de task:", error)
        })

      if (data_limite && horario) {
        const agora = new Date()
        const [anoTask, mesTask, diaTask] = data_limite.split("-")
        const dataTask = new Date(Number(anoTask), Number(mesTask) - 1, Number(diaTask))
        const [horaTask, minutoTask] = horario.split(":")
        dataTask.setHours(Number(horaTask), Number(minutoTask), 0, 0)

        const diferencaMinutos = (dataTask.getTime() - agora.getTime()) / 60000

        console.log("[v0] Verificando janela de alerta da task:", {
          agora: agora.toISOString(),
          dataTask: dataTask.toISOString(),
          diferencaMinutos,
        })

        // Se falta 10 minutos ou menos, envia o lembrete de 10min
        if (diferencaMinutos > 0 && diferencaMinutos <= 10) {
          const horarioFormatado = horario.substring(0, 5)
          const mensagemLembrete = formatarLembreteTask({
            titulo,
            descricao,
            prioridade: prioridade || "media",
            atribuido_para,
            mentorado_nome,
            horario: horarioFormatado,
            minutos: Math.floor(diferencaMinutos),
          })

          sendWhatsAppMessage(NOTIFICATION_GROUP_ID, mensagemLembrete, "lembrete_task_imediato")
            .then(async (resultado) => {
              await sql`
                INSERT INTO whatsapp_logs (telefone, mensagem, tipo, status, mentorado_id, enviado_por)
                VALUES (
                  ${NOTIFICATION_GROUP_ID},
                  ${mensagemLembrete},
                  'lembrete_task_imediato',
                  ${resultado.success ? "sucesso" : "erro"},
                  ${mentorado_id || null},
                  'sistema_automatico'
                )
              `

              await sql`
                UPDATE tasks
                SET lembrete_10min_enviado = TRUE
                WHERE id = ${task.id}
              `

              console.log("[v0] Lembrete imediato de task enviado:", resultado)
            })
            .catch((error) => {
              console.error("[v0] Erro ao enviar lembrete imediato de task:", error)
            })
        }
      }
    } catch (whatsappError) {
      console.error("[v0] Erro ao processar notificação WhatsApp de task:", whatsappError)
    }

    return Response.json({ task })
  } catch (error) {
    console.error("Erro ao criar task:", error)
    return Response.json({ error: "Erro ao criar task" }, { status: 500 })
  }
}
