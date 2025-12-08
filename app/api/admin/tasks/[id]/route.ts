import { neon } from "@neondatabase/serverless"

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
      arquivado, // Added arquivado field support
    } = body

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
      // Remover tags antigas
      await sql`DELETE FROM task_tag_relations WHERE task_id = ${id}`

      // Adicionar novas tags
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
      // Remover items antigos
      await sql`DELETE FROM task_checklist_items WHERE task_id = ${id}`

      // Adicionar novos items
      if (checklist.length > 0) {
        for (let i = 0; i < checklist.length; i++) {
          await sql`
            INSERT INTO task_checklist_items (task_id, texto, concluido, ordem)
            VALUES (${id}, ${checklist[i].texto}, ${checklist[i].concluido || false}, ${i})
          `
        }
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
