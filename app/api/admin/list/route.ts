import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(
  "postgresql://neondb_owner:npg_TNMj2X4HrqEw@ep-misty-mode-acoot3dc-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
)

export async function GET(request: NextRequest) {
  try {
    const admins = await sql`
      SELECT id, nome, email, criado_em
      FROM admins
      ORDER BY id
    `

    return NextResponse.json(admins)
  } catch (error) {
    console.error("Erro ao buscar admins:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
