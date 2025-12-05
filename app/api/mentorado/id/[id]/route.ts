import type { NextRequest } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(
  "postgresql://neondb_owner:npg_TNMj2X4HrqEw@ep-misty-mode-acoot3dc-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
)

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("[v0] DELETE API - Iniciando exclusão do mentorado ID:", params.id)

    const adminEmail = request.headers.get("x-admin-email") || "sistema"

    if (!/^\d+$/.test(params.id)) {
      console.log("[v0] DELETE API - ID inválido (não numérico):", params.id)
      return new Response(JSON.stringify({ error: "ID deve ser numérico" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const existingMentorado = await sql`
      SELECT id, nome, email, empresa FROM mentorados WHERE id = ${params.id}
    `

    if (existingMentorado.length === 0) {
      console.log("[v0] DELETE API - Mentorado não encontrado:", params.id)
      return new Response(JSON.stringify({ error: "Mentorado não encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    console.log("[v0] DELETE API - Mentorado encontrado:", existingMentorado[0].nome)

    await sql`
      INSERT INTO audit_log (admin_email, action, table_name, record_id, details)
      VALUES (
        ${adminEmail},
        'DELETE_MENTORADO',
        'mentorados',
        ${Number.parseInt(params.id)},
        ${JSON.stringify({
          mentorado_nome: existingMentorado[0].nome,
          email: existingMentorado[0].email,
          empresa: existingMentorado[0].empresa,
        })}::jsonb
      )
    `

    const result = await sql`
      DELETE FROM mentorados WHERE id = ${params.id}
    `

    console.log("[v0] DELETE API - Mentorado excluído com sucesso por:", adminEmail)

    return new Response(
      JSON.stringify({
        success: true,
        message: "Mentorado excluído com sucesso",
        id: params.id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("[v0] DELETE API - Erro ao excluir mentorado:", error)
    return new Response(
      JSON.stringify({
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
