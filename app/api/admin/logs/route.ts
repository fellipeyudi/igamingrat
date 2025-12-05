import { neon } from "@neondatabase/serverless"

export async function GET(request: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    const logs = await sql`
      SELECT 
        l.*,
        COALESCE(a.nome, l.admin_email) as admin_display_name
      FROM audit_log l
      LEFT JOIN admins a ON l.admin_email = a.email
      ORDER BY l.created_at DESC
      LIMIT 500
    `

    return Response.json({ logs })
  } catch (error) {
    console.error("[v0] Erro ao buscar logs:", error)
    return Response.json({ error: "Erro ao buscar logs" }, { status: 500 })
  }
}
