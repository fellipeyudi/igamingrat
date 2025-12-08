import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(
  "postgresql://neondb_owner:npg_TNMj2X4HrqEw@ep-misty-mode-acoot3dc-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const tipo = searchParams.get("tipo")

    let logs

    if (tipo) {
      logs = await sql`
        SELECT 
          w.*,
          r.titulo as reuniao_titulo,
          r.data as reuniao_data,
          m.nome as mentorado_nome
        FROM whatsapp_logs w
        LEFT JOIN reunioes r ON w.reuniao_id = r.id
        LEFT JOIN mentorados m ON w.mentorado_id = m.id
        WHERE w.tipo = ${tipo}
        ORDER BY w.created_at DESC
        LIMIT ${limit}
      `
    } else {
      logs = await sql`
        SELECT 
          w.*,
          r.titulo as reuniao_titulo,
          r.data as reuniao_data,
          m.nome as mentorado_nome
        FROM whatsapp_logs w
        LEFT JOIN reunioes r ON w.reuniao_id = r.id
        LEFT JOIN mentorados m ON w.mentorado_id = m.id
        ORDER BY w.created_at DESC
        LIMIT ${limit}
      `
    }

    return NextResponse.json(logs)
  } catch (error: any) {
    console.error("[v0] Erro ao buscar logs:", error)
    return NextResponse.json({ error: error.message || "Erro interno do servidor" }, { status: 500 })
  }
}
