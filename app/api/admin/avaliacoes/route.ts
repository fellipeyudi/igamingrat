import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const avaliacoes = await sql`
      SELECT 
        a.*,
        m.nome as mentorado_nome,
        m.empresa
      FROM avaliacoes_satisfacao a
      JOIN mentorados m ON a.mentorado_id = m.id
      ORDER BY a.data_avaliacao DESC
    `

    const total = avaliacoes.length

    const media_satisfacao = total > 0 ? avaliacoes.reduce((sum, a) => sum + (a.satisfacao_geral || 0), 0) / total : 0

    const media_nps = total > 0 ? avaliacoes.reduce((sum, a) => sum + (a.recomendaria_mentoria || 0), 0) / total : 0

    const promotores = avaliacoes.filter((a) => a.recomendaria_mentoria >= 9).length
    const neutros = avaliacoes.filter((a) => a.recomendaria_mentoria >= 7 && a.recomendaria_mentoria <= 8).length
    const detratores = avaliacoes.filter((a) => a.recomendaria_mentoria <= 6).length

    const stats = {
      total,
      media_satisfacao,
      media_nps,
      promotores,
      neutros,
      detratores,
    }

    return NextResponse.json({ avaliacoes, stats })
  } catch (error) {
    console.error("Erro ao buscar avaliações:", error)
    return NextResponse.json({ error: "Erro ao buscar avaliações" }, { status: 500 })
  }
}
