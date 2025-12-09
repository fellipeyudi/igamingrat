import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export const dynamic = "force-dynamic"
export const revalidate = 0

// GET - Buscar mídia específica
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const result = await sql`
      SELECT 
        m.*,
        r.titulo as reuniao_titulo,
        r.data as reuniao_data,
        mt.nome as mentorado_nome
      FROM mentorado_midias m
      LEFT JOIN reunioes r ON m.reuniao_id = r.id
      LEFT JOIN mentorados mt ON m.mentorado_id = mt.id
      WHERE m.id = ${params.id}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Mídia não encontrada" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("[v0] Erro ao buscar mídia:", error)
    return NextResponse.json({ error: "Erro ao buscar mídia" }, { status: 500 })
  }
}

// PUT - Atualizar mídia
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { titulo, descricao, categoria, data_midia, horario_midia, reuniao_id, metricas } = body

    const result = await sql`
      UPDATE mentorado_midias
      SET 
        titulo = COALESCE(${titulo}, titulo),
        descricao = COALESCE(${descricao}, descricao),
        categoria = COALESCE(${categoria}, categoria),
        data_midia = COALESCE(${data_midia}::date, data_midia),
        horario_midia = COALESCE(${horario_midia}::time, horario_midia),
        reuniao_id = COALESCE(${reuniao_id}, reuniao_id),
        metricas = COALESCE(${metricas ? JSON.stringify(metricas) : null}, metricas),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${params.id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Mídia não encontrada" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("[v0] Erro ao atualizar mídia:", error)
    return NextResponse.json({ error: "Erro ao atualizar mídia" }, { status: 500 })
  }
}

// DELETE - Remover mídia
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const result = await sql`
      DELETE FROM mentorado_midias
      WHERE id = ${params.id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Mídia não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ success: true, midia: result[0] })
  } catch (error) {
    console.error("[v0] Erro ao deletar mídia:", error)
    return NextResponse.json({ error: "Erro ao deletar mídia" }, { status: 500 })
  }
}
