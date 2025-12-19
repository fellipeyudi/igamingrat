import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(
  "postgresql://neondb_owner:npg_TNMj2X4HrqEw@ep-misty-mode-acoot3dc-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
)

// GET - Buscar comentários privados do mentorado
export async function GET(request: NextRequest, { params }: { params: { slug: string; id: string } }) {
  try {
    const aulaId = params.id

    const mentoradoResult = await sql`
      SELECT id, nome FROM mentorados WHERE slug = ${params.slug}
    `

    if (mentoradoResult.length === 0) {
      return NextResponse.json({ error: "Mentorado não encontrado" }, { status: 404 })
    }

    const mentoradoId = mentoradoResult[0].id

    const comentarios = await sql`
      SELECT 
        c.id,
        c.comentario,
        c.created_at,
        m.nome as autor_nome,
        m.slug as autor_slug
      FROM comentarios_aulas c
      JOIN mentorados m ON c.mentorado_id = m.id
      WHERE c.aula_id = ${aulaId} AND c.mentorado_id = ${mentoradoId}
      ORDER BY c.created_at DESC
    `

    return NextResponse.json({ comentarios })
  } catch (error: any) {
    console.error("[v0] Erro ao buscar comentários:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Criar novo comentário
export async function POST(request: NextRequest, { params }: { params: { slug: string; id: string } }) {
  try {
    const aulaId = params.id
    const { comentario } = await request.json()

    if (!comentario || comentario.trim().length === 0) {
      return NextResponse.json({ error: "Comentário não pode estar vazio" }, { status: 400 })
    }

    const mentoradoResult = await sql`
      SELECT id, nome FROM mentorados WHERE slug = ${params.slug}
    `

    if (mentoradoResult.length === 0) {
      return NextResponse.json({ error: "Mentorado não encontrado" }, { status: 404 })
    }

    const mentoradoId = mentoradoResult[0].id

    const resultado = await sql`
      INSERT INTO comentarios_aulas (aula_id, mentorado_id, comentario)
      VALUES (${aulaId}, ${mentoradoId}, ${comentario.trim()})
      RETURNING id, comentario, created_at
    `

    const novoComentario = {
      ...resultado[0],
      autor_nome: mentoradoResult[0].nome || "Mentorado",
      autor_slug: params.slug,
    }

    return NextResponse.json({
      success: true,
      comentario: novoComentario,
      message: "Comentário publicado com sucesso!",
    })
  } catch (error: any) {
    console.error("[v0] Erro ao criar comentário:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
