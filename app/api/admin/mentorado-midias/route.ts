import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export const dynamic = "force-dynamic"
export const revalidate = 0

// GET - Listar mídias de um mentorado
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const mentoradoId = searchParams.get("mentorado_id")

    if (!mentoradoId) {
      return NextResponse.json({ error: "mentorado_id obrigatório" }, { status: 400 })
    }

    const midias = await sql`
      SELECT 
        m.*,
        r.titulo as reuniao_titulo,
        r.data as reuniao_data
      FROM mentorado_midias m
      LEFT JOIN reunioes r ON m.reuniao_id = r.id
      WHERE m.mentorado_id = ${mentoradoId}
      ORDER BY m.data_midia DESC NULLS LAST, m.created_at DESC
    `

    return NextResponse.json(midias)
  } catch (error) {
    console.error("[v0] Erro ao buscar mídias:", error)
    return NextResponse.json({ error: "Erro ao buscar mídias" }, { status: 500 })
  }
}

// POST - Criar nova mídia
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      mentorado_id,
      tipo,
      categoria,
      titulo,
      descricao,
      nome_arquivo,
      url,
      tamanho,
      data_midia,
      horario_midia,
      reuniao_id,
      metricas,
      uploaded_by,
    } = body

    if (!mentorado_id || !tipo || !titulo || !url) {
      return NextResponse.json(
        {
          error: "mentorado_id, tipo, titulo e url são obrigatórios",
        },
        { status: 400 },
      )
    }

    const result = await sql`
      INSERT INTO mentorado_midias (
        mentorado_id, tipo, categoria, titulo, descricao, 
        nome_arquivo, url, tamanho, data_midia, horario_midia,
        reuniao_id, metricas, uploaded_by
      )
      VALUES (
        ${mentorado_id}, ${tipo}, ${categoria || "campanha"}, ${titulo}, ${descricao},
        ${nome_arquivo}, ${url}, ${tamanho}, ${data_midia}::date, ${horario_midia}::time,
        ${reuniao_id}, ${metricas ? JSON.stringify(metricas) : null}, ${uploaded_by}
      )
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("[v0] Erro ao criar mídia:", error)
    return NextResponse.json({ error: "Erro ao criar mídia" }, { status: 500 })
  }
}
