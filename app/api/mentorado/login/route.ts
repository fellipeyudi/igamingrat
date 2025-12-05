import type { NextRequest } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(
  "postgresql://neondb_owner:npg_TNMj2X4HrqEw@ep-misty-mode-acoot3dc-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
)

export async function POST(request: NextRequest) {
  console.log("[v0] ==> LOGIN API iniciada")
  console.log("[v0] Request method:", request.method)
  console.log("[v0] Request URL:", request.url)

  try {
    const body = await request.json()
    const { email, slug } = body

    console.log("[v0] Body recebido:", body)
    console.log("[v0] Login attempt - Email:", email, "Slug:", slug)

    if (!email || !slug) {
      console.log("[v0] Missing email or slug")
      return new Response(JSON.stringify({ error: "Email e slug são obrigatórios" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      })
    }

    const normalizedEmail = email.toLowerCase().trim()
    console.log("[v0] Email normalizado:", normalizedEmail)

    console.log("[v0] Testing database connection...")

    // Verificar se o email corresponde ao mentorado da slug
    const result = await sql`
      SELECT * FROM mentorados 
      WHERE slug = ${slug} AND email = ${normalizedEmail}
    `

    console.log("[v0] Query result:", result)
    console.log("[v0] Result length:", result.length)

    if (result.length === 0) {
      const slugCheck = await sql`SELECT * FROM mentorados WHERE slug = ${slug}`
      console.log("[v0] Slug check result:", slugCheck)

      return new Response(JSON.stringify({ error: "Email não autorizado para este mentorado" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      })
    }

    const mentorado = result[0]
    console.log("[v0] Mentorado found:", mentorado.nome)

    // Criar token simples (em produção, usar JWT)
    const token = Buffer.from(`${mentorado.id}:${mentorado.email}:${Date.now()}`).toString("base64")

    const response = {
      success: true,
      token,
      mentorado: {
        id: mentorado.id,
        nome: mentorado.nome,
        email: mentorado.email,
        slug: mentorado.slug,
      },
    }

    console.log("[v0] Retornando sucesso para:", mentorado.nome)

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    console.error("[v0] Erro no login do mentorado:", error)
    console.error("[v0] Error details:", error?.message)

    return new Response(
      JSON.stringify({
        error: "Erro interno do servidor",
        details: error?.message || "Erro desconhecido",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      },
    )
  }
}
