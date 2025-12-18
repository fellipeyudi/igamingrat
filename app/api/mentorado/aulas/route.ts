import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export const dynamic = "force-dynamic"
export const revalidate = 0

// GET - Listar aulas ativas para mentorados
export async function GET() {
  try {
    const aulas = await sql`
      SELECT id, titulo, descricao, video_url, ordem, duracao, thumbnail_url
      FROM aulas 
      WHERE ativa = TRUE
      ORDER BY ordem ASC, created_at ASC
    `

    return NextResponse.json(aulas)
  } catch (error) {
    console.error("Erro ao buscar aulas:", error)
    return NextResponse.json({ error: "Erro ao buscar aulas" }, { status: 500 })
  }
}
