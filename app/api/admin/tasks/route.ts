import { neon } from "@neondatabase/serverless"

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

    // Criar a task
    const [task] = await sql`
      INSERT INTO tasks (
        titulo, descricao, status, prioridade, atribuido_para,
        mentorado_id, data_limite, criado_por, anexos, horario
      )
      VALUES (
        ${titulo}, ${descricao}, ${status || "todo"}, ${prioridade || "media"},
        ${atribuido_para}, ${mentorado_id || null}, ${data_limite || null}, ${criado_por},
        ${anexos ? JSON.stringify(anexos) : "[]"}::jsonb, ${horario || null}
      )
      RETURNING *
    `

    // Adicionar tags
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

    return Response.json({ task })
  } catch (error) {
    console.error("Erro ao criar task:", error)
    return Response.json({ error: "Erro ao criar task" }, { status: 500 })
  }
}
