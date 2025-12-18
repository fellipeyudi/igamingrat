import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export const dynamic = "force-dynamic"
export const revalidate = 0

// PUT - Atualizar aula
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { titulo, descricao, video_url, ordem, duracao, thumbnail_url, ativa } = body

    const aula = await sql`
      UPDATE aulas
      SET 
        titulo = COALESCE(${titulo}, titulo),
        descricao = COALESCE(${descricao}, descricao),
        video_url = COALESCE(${video_url}, video_url),
        ordem = COALESCE(${ordem}, ordem),
        duracao = COALESCE(${duracao}, duracao),
        thumbnail_url = COALESCE(${thumbnail_url}, thumbnail_url),
        ativa = COALESCE(${ativa}, ativa),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    if (aula.length === 0) {
      return NextResponse.json({ error: "Aula não encontrada" }, { status: 404 })
    }

    return NextResponse.json(aula[0])
  } catch (error) {
    console.error("Erro ao atualizar aula:", error)
    return NextResponse.json({ error: "Erro ao atualizar aula" }, { status: 500 })
  }
}

// DELETE - Deletar aula
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const result = await sql`
      DELETE FROM aulas
      WHERE id = ${id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Aula não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ message: "Aula deletada com sucesso" })
  } catch (error) {
    console.error("Erro ao deletar aula:", error)
    return NextResponse.json({ error: "Erro ao deletar aula" }, { status: 500 })
  }
}
