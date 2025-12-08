import { neon } from "@neondatabase/serverless"

const sql = neon(
  "postgresql://neondb_owner:npg_TNMj2X4HrqEw@ep-misty-mode-acoot3dc-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
)

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { id } = params
    const { autor, comentario } = body

    const [comment] = await sql`
      INSERT INTO task_comments (task_id, autor, comentario)
      VALUES (${id}, ${autor}, ${comentario})
      RETURNING *
    `

    return Response.json({ comment })
  } catch (error) {
    console.error("Erro ao adicionar comentário:", error)
    return Response.json({ error: "Erro ao adicionar comentário" }, { status: 500 })
  }
}
