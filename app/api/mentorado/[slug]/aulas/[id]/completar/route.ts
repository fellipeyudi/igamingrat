import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(
  "postgresql://neondb_owner:npg_TNMj2X4HrqEw@ep-misty-mode-acoot3dc-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
)

export async function POST(request: Request, { params }: { params: { slug: string; id: string } }) {
  try {
    const aulaId = Number.parseInt(params.id)

    const mentorados = await sql`
      SELECT id FROM mentorados WHERE slug = ${params.slug}
    `

    if (mentorados.length === 0) {
      return NextResponse.json({ error: "Mentorado não encontrado" }, { status: 404 })
    }

    const mentoradoId = mentorados[0].id

    const progressoExistente = await sql`
      SELECT * FROM progresso_aulas 
      WHERE mentorado_id = ${mentoradoId} AND aula_id = ${aulaId}
    `

    if (progressoExistente.length > 0) {
      await sql`
        UPDATE progresso_aulas 
        SET concluida = true, data_conclusao = NOW(), updated_at = NOW()
        WHERE mentorado_id = ${mentoradoId} AND aula_id = ${aulaId}
      `
    } else {
      await sql`
        INSERT INTO progresso_aulas (mentorado_id, aula_id, concluida, data_conclusao)
        VALUES (${mentoradoId}, ${aulaId}, true, NOW())
      `
    }

    const totalAulas = await sql`SELECT COUNT(*) as total FROM aulas WHERE ativa = true`
    const aulasCompletas = await sql`
      SELECT COUNT(*) as completas 
      FROM progresso_aulas 
      WHERE mentorado_id = ${mentoradoId} AND concluida = true
    `

    const progressoPercentual =
      totalAulas[0].total > 0 ? Math.round((aulasCompletas[0].completas / totalAulas[0].total) * 100) : 0

    return NextResponse.json({
      success: true,
      progressoPercentual,
      aulasCompletas: aulasCompletas[0].completas,
      totalAulas: totalAulas[0].total,
    })
  } catch (error: any) {
    console.error("[v0] Erro ao marcar aula como concluída:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { slug: string; id: string } }) {
  try {
    const aulaId = Number.parseInt(params.id)

    const mentorados = await sql`
      SELECT id FROM mentorados WHERE slug = ${params.slug}
    `

    if (mentorados.length === 0) {
      return NextResponse.json({ error: "Mentorado não encontrado" }, { status: 404 })
    }

    const mentoradoId = mentorados[0].id

    await sql`
      UPDATE progresso_aulas 
      SET concluida = false, data_conclusao = NULL, updated_at = NOW()
      WHERE mentorado_id = ${mentoradoId} AND aula_id = ${aulaId}
    `

    const totalAulas = await sql`SELECT COUNT(*) as total FROM aulas WHERE ativa = true`
    const aulasCompletas = await sql`
      SELECT COUNT(*) as completas 
      FROM progresso_aulas 
      WHERE mentorado_id = ${mentoradoId} AND concluida = true
    `

    const progressoPercentual =
      totalAulas[0].total > 0 ? Math.round((aulasCompletas[0].completas / totalAulas[0].total) * 100) : 0

    return NextResponse.json({
      success: true,
      progressoPercentual,
      aulasCompletas: aulasCompletas[0].completas,
      totalAulas: totalAulas[0].total,
    })
  } catch (error: any) {
    console.error("[v0] Erro ao desmarcar aula:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
