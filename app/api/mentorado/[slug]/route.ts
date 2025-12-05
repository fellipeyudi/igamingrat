import type { NextRequest } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(
  "postgresql://neondb_owner:npg_TNMj2X4HrqEw@ep-misty-mode-acoot3dc-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
)

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  console.log("[v0] ==> GET mentorado API iniciada")
  console.log("[v0] Request URL:", request.url)
  console.log("[v0] Params recebidos:", params)
  console.log("[v0] Slug extraído:", params?.slug)

  try {
    const { slug } = params

    if (!slug) {
      console.log("[v0] Erro: Slug não fornecido")
      return new Response(JSON.stringify({ error: "Slug é obrigatório" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    console.log("[v0] Iniciando busca do mentorado com slug:", slug)

    console.log("[v0] Executando query para buscar mentorado...")
    const result = await sql`
      SELECT * FROM mentorados WHERE slug = ${slug}
    `

    console.log("[v0] Query executada. Resultados encontrados:", result.length)
    if (result.length > 0) {
      console.log("[v0] Nome do mentorado:", result[0].nome)
      console.log("[v0] Fase atual no banco:", result[0].fase_atual)
      console.log("[v0] Todos os campos retornados:", Object.keys(result[0]))
      console.log("[v0] Dados completos do mentorado:", JSON.stringify(result[0], null, 2))
    }

    if (result.length === 0) {
      console.log("[v0] Mentorado não encontrado para slug:", slug)
      return new Response(JSON.stringify({ error: "Mentorado não encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    const mentorado = result[0]
    console.log("[v0] Mentorado encontrado:", mentorado.nome)
    if (mentorado.fase_atual) {
      console.log("[v0] Fase atual sendo retornada:", mentorado.fase_atual)
    } else {
      console.log("[v0] Fase atual não está presente nos dados do mentorado")
    }
    console.log("[v0] Retornando dados do mentorado com sucesso")

    return new Response(JSON.stringify(mentorado), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("[v0] ERRO CRÍTICO na API de busca:", error)
    console.error("[v0] Stack trace:", error.stack)
    console.error("[v0] Mensagem do erro:", error.message)

    if (error.message?.includes("password authentication failed")) {
      console.error("[v0] Erro de autenticação - verificar credenciais do banco")
    }

    return new Response(
      JSON.stringify({
        error: "Erro interno do servidor",
        details: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
