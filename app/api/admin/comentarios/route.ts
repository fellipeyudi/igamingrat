import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(
  "postgresql://neondb_owner:npg_TNMj2X4HrqEw@ep-misty-mode-acoot3dc-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
)

// GET - Buscar todos os comentários agrupados por aula (Admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const aulaId = searchParams.get("aulaId")

    let comentarios

    if (aulaId) {
      // Buscar comentários de uma aula específica
      comentarios = await sql`
        SELECT 
          c.id,
          c.comentario,
          c.created_at,
          m.nome as mentorado_nome,
          m.slug as mentorado_slug,
          m.email as mentorado_email,
          a.titulo as aula_titulo,
          a.id as aula_id
        FROM comentarios_aulas c
        JOIN mentorados m ON c.mentorado_id = m.id
        JOIN aulas a ON c.aula_id = a.id
        WHERE c.aula_id = ${aulaId}
        ORDER BY c.created_at DESC
      `
    } else {
      // Buscar todos os comentários com informações da aula e mentorado
      comentarios = await sql`
        SELECT 
          c.id,
          c.comentario,
          c.created_at,
          m.nome as mentorado_nome,
          m.slug as mentorado_slug,
          m.email as mentorado_email,
          a.titulo as aula_titulo,
          a.id as aula_id,
          a.modulo
        FROM comentarios_aulas c
        JOIN mentorados m ON c.mentorado_id = m.id
        JOIN aulas a ON c.aula_id = a.id
        ORDER BY c.created_at DESC
      `
    }

    // Agrupar comentários por aula
    const comentariosPorAula = comentarios.reduce((acc: any, comentario: any) => {
      const aulaId = comentario.aula_id
      if (!acc[aulaId]) {
        acc[aulaId] = {
          aula_id: aulaId,
          aula_titulo: comentario.aula_titulo,
          modulo: comentario.modulo,
          total_comentarios: 0,
          comentarios: [],
        }
      }
      acc[aulaId].total_comentarios++
      acc[aulaId].comentarios.push({
        id: comentario.id,
        comentario: comentario.comentario,
        created_at: comentario.created_at,
        mentorado_nome: comentario.mentorado_nome,
        mentorado_slug: comentario.mentorado_slug,
        mentorado_email: comentario.mentorado_email,
      })
      return acc
    }, {})

    return NextResponse.json({
      comentarios,
      comentariosPorAula: Object.values(comentariosPorAula),
      total: comentarios.length,
    })
  } catch (error: any) {
    console.error("[v0] Erro ao buscar comentários do admin:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
