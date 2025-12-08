import { neon } from "@neondatabase/serverless"
import { sendWhatsAppMessage, formatarComentarioTask, NOTIFICATION_GROUP_ID } from "@/lib/whatsapp"

const sql = neon(
  "postgresql://neondb_owner:npg_TNMj2X4HrqEw@ep-misty-mode-acoot3dc-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
)

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { id } = params
    const { autor, autor_email, comentario, mencoes, anexos } = body

    console.log("[v0] Recebendo comentário:", { taskId: id, autor, comentario })

    const [comment] = await sql`
      INSERT INTO task_comments (task_id, autor, autor_email, comentario, mencoes, anexos)
      VALUES (${id}, ${autor}, ${autor_email || ""}, ${comentario}, ${mencoes || []}, ${JSON.stringify(anexos || [])})
      RETURNING *
    `

    console.log("[v0] Comentário salvo:", comment)

    try {
      const [task] = await sql`
        SELECT t.*, m.nome as mentorado_nome
        FROM tasks t
        LEFT JOIN mentorados m ON t.mentorado_id = m.id
        WHERE t.id = ${id}
      `

      const checklist = await sql`
        SELECT texto, concluido
        FROM task_checklist_items
        WHERE task_id = ${id}
        ORDER BY ordem
      `

      if (task) {
        const mensagem = formatarComentarioTask({
          titulo: task.titulo,
          descricao: task.descricao,
          autor: autor,
          autor_email: autor_email,
          comentario: comentario,
          mentorado_nome: task.mentorado_nome,
          data_limite: task.data_limite,
          horario: task.horario,
          checklist: checklist.length > 0 ? checklist : undefined,
          temAnexos: anexos && anexos.length > 0,
          mencionados: mencoes,
        })

        await sendWhatsAppMessage(NOTIFICATION_GROUP_ID, mensagem, "comentario_task")
        console.log("[v0] Notificação de comentário enviada via WhatsApp")
      }
    } catch (whatsappError) {
      console.error("[v0] Erro ao enviar notificação WhatsApp:", whatsappError)
    }

    return Response.json({ comment })
  } catch (error) {
    console.error("[v0] Erro ao adicionar comentário:", error)
    return Response.json({ error: "Erro ao adicionar comentário: " + error }, { status: 500 })
  }
}
