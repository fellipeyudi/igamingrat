import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const admins = await sql`
      SELECT id, nome, email, status
      FROM admins
      ORDER BY nome ASC
    `

    return NextResponse.json({ admins })
  } catch (error) {
    console.error("Erro ao buscar admins:", error)
    return NextResponse.json({ error: "Erro ao buscar admins" }, { status: 500 })
  }
}
