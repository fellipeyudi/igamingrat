import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(
  "postgresql://neondb_owner:npg_GQRWbXBqIXbA@ep-silent-violet-a5kujfqw.us-east-2.aws.neon.tech/neondb?sslmode=require",
)

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    console.log("[v0] Recebendo avaliação para slug:", params.slug)
    const body = await request.json()
    console.log("[v0] Dados recebidos da avaliação:", JSON.stringify(body, null, 2))

    const {
      mentorado_id,
      faturamento_atual,
      meta_faturamento,
      satisfacao_geral,
      qualidade_calls,
      qualidade_suporte,
      qualidade_entregaveis,
      clareza_comunicacao,
      utilidade_conteudo,
      principal_desafio,
      maior_conquista,
      expectativas_atendidas,
      sugestoes_melhoria,
      proximo_objetivo,
      feedback_adicional,
      tempo_resposta_suporte,
      frequencia_calls_ideal,
      recomendaria_mentoria,
    } = body

    // Validar campos obrigatórios
    console.log("[v0] Validando campos obrigatórios...")
    console.log("[v0] mentorado_id:", mentorado_id)
    console.log("[v0] faturamento_atual:", faturamento_atual)
    console.log("[v0] meta_faturamento:", meta_faturamento)

    if (!mentorado_id || !faturamento_atual || !meta_faturamento) {
      console.error("[v0] Campos obrigatórios faltando!")
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 })
    }

    console.log("[v0] Iniciando inserção no banco de dados...")

    // Inserir avaliação
    const result = await sql`
      INSERT INTO avaliacoes_satisfacao (
        mentorado_id,
        faturamento_atual,
        meta_faturamento,
        satisfacao_geral,
        qualidade_calls,
        qualidade_suporte,
        qualidade_entregaveis,
        clareza_comunicacao,
        utilidade_conteudo,
        principal_desafio,
        maior_conquista,
        expectativas_atendidas,
        sugestoes_melhoria,
        proximo_objetivo,
        feedback_adicional,
        tempo_resposta_suporte,
        frequencia_calls_ideal,
        recomendaria_mentoria
      ) VALUES (
        ${mentorado_id},
        ${faturamento_atual},
        ${meta_faturamento},
        ${satisfacao_geral},
        ${qualidade_calls},
        ${qualidade_suporte},
        ${qualidade_entregaveis},
        ${clareza_comunicacao},
        ${utilidade_conteudo},
        ${principal_desafio},
        ${maior_conquista},
        ${expectativas_atendidas},
        ${sugestoes_melhoria},
        ${proximo_objetivo},
        ${feedback_adicional || null},
        ${tempo_resposta_suporte},
        ${frequencia_calls_ideal},
        ${recomendaria_mentoria}
      )
      RETURNING *
    `

    console.log("[v0] Avaliação inserida com sucesso:", result[0])

    // Registrar no audit log
    await sql`
      INSERT INTO audit_log (acao, detalhes)
      VALUES (
        'avaliacao_criada',
        ${JSON.stringify({
          mentorado_id,
          satisfacao_geral,
          recomendaria_mentoria,
        })}
      )
    `

    console.log("[v0] Audit log registrado com sucesso")

    return NextResponse.json({ success: true, avaliacao: result[0] })
  } catch (error) {
    console.error("[v0] Erro ao criar avaliação:", error)
    console.error("[v0] Stack trace:", error instanceof Error ? error.stack : "Sem stack trace")
    console.error("[v0] Mensagem de erro:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Erro ao criar avaliação" }, { status: 500 })
  }
}
