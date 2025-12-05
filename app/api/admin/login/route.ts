import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(
  "postgresql://neondb_owner:npg_TNMj2X4HrqEw@ep-misty-mode-acoot3dc-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
)

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] ==> POST /api/admin/login iniciado")
    const { email } = await request.json()
    console.log("[v0] Email recebido:", email)

    if (!email) {
      console.log("[v0] Erro: Email não fornecido")
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    console.log("[v0] Email normalizado:", normalizedEmail)

    // Verificar se o email existe na tabela admins
    console.log("[v0] Verificando admin no banco...")
    const result = await sql`
      SELECT id, email, nome FROM admins WHERE email = ${normalizedEmail}
    `
    console.log("[v0] Resultado da query:", result)

    if (result.length === 0) {
      console.log("[v0] Email não encontrado na tabela admins")
      return NextResponse.json({ error: "Email não autorizado" }, { status: 401 })
    }

    console.log("[v0] Admin encontrado:", result[0])

    // Gerar token simples (em produção, use JWT)
    const token = Buffer.from(`${normalizedEmail}:${Date.now()}`).toString("base64")
    console.log("[v0] Token gerado com sucesso")

    return NextResponse.json({
      success: true,
      token,
      user: result[0],
    })
  } catch (error) {
    console.error("[v0] Erro no login:", error)
    return NextResponse.json(
      {
        error: "Erro ao verificar credenciais",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
