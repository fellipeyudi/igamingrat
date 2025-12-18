import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export const dynamic = "force-dynamic"
export const revalidate = 0

// GET - Listar todas as aulas
export async function GET() {
  try {
    const aulas = await sql`
      SELECT * FROM aulas 
      ORDER BY ordem ASC, created_at ASC
    `

    return NextResponse.json(aulas)
  } catch (error) {
    console.error("Erro ao buscar aulas:", error)
    return NextResponse.json({ error: "Erro ao buscar aulas" }, { status: 500 })
  }
}

// POST - Criar nova aula
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { titulo, descricao, video_url, ordem, duracao, thumbnail_url } = body

    if (!titulo || !video_url) {
      return NextResponse.json({ error: "Título e URL do vídeo são obrigatórios" }, { status: 400 })
    }

    // Se não forneceu ordem, pegar a próxima disponível
    let ordemFinal = ordem
    if (!ordemFinal) {
      const result = await sql`SELECT COALESCE(MAX(ordem), 0) + 1 as proxima_ordem FROM aulas`
      ordemFinal = result[0].proxima_ordem
    }

    const aula = await sql`
      INSERT INTO aulas (titulo, descricao, video_url, ordem, duracao, thumbnail_url)
      VALUES (${titulo}, ${descricao || null}, ${video_url}, ${ordemFinal}, ${duracao || null}, ${thumbnail_url || null})
      RETURNING *
    `

    return NextResponse.json(aula[0], { status: 201 })
  } catch (error) {
    console.error("Erro ao criar aula:", error)
    return NextResponse.json({ error: "Erro ao criar aula" }, { status: 500 })
  }
}
