import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export const dynamic = "force-dynamic"
export const revalidate = 0

// POST - Reordenar aulas
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { aulas } = body // Array de { id, ordem }

    if (!Array.isArray(aulas)) {
      return NextResponse.json({ error: "Formato inválido" }, { status: 400 })
    }

    // Atualizar ordem de cada aula
    for (const aula of aulas) {
      await sql`
        UPDATE aulas
        SET ordem = ${aula.ordem}, updated_at = NOW()
        WHERE id = ${aula.id}
      `
    }

    return NextResponse.json({ message: "Ordem atualizada com sucesso" })
  } catch (error) {
    console.error("Erro ao reordenar aulas:", error)
    return NextResponse.json({ error: "Erro ao reordenar aulas" }, { status: 500 })
  }
}
