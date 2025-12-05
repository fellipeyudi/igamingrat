import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const body = await request.json()
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
    if (!mentorado_id || !faturamento_atual || !meta_faturamento) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 })
    }

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

    return NextResponse.json({ success: true, avaliacao: result[0] })
  } catch (error) {
    console.error("Erro ao criar avaliação:", error)
    return NextResponse.json({ error: "Erro ao criar avaliação" }, { status: 500 })
  }
}
