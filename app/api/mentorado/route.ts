import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(
  "postgresql://neondb_owner:npg_TNMj2X4HrqEw@ep-misty-mode-acoot3dc-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
)

function getDefaultTextsByPhase(fase) {
  const textosPorFase = {
    Alinhamento: {
      cards_status: {
        concluido: {
          titulo: "Concluído recentemente",
          texto: "Definição de objetivos e metas iniciais",
        },
        trabalhando: {
          titulo: "Trabalhando agora",
          texto: "Análise do modelo de negócio atual",
        },
      },
      status_empresa: {
        estagio_atual: "Alinhamento",
        proxima_fase: "Planejamento",
        acao_prioritaria: "Definir objetivos claros e entender o modelo de negócio",
      },
    },
    Planejamento: {
      cards_status: {
        concluido: {
          titulo: "Concluído recentemente",
          texto: "Análise de mercado e definição de estratégias",
        },
        trabalhando: {
          titulo: "Trabalhando agora",
          texto: "Criação do roadmap detalhado e planejamento de recursos",
        },
      },
      status_empresa: {
        estagio_atual: "Planejamento",
        proxima_fase: "Estruturação",
        acao_prioritaria: "Criar roadmap detalhado e definir recursos necessários",
      },
    },
    Estruturação: {
      cards_status: {
        concluido: {
          titulo: "Concluído recentemente",
          texto: "Processos internos organizados",
        },
        trabalhando: {
          titulo: "Trabalhando agora",
          texto: "Implementação de sistemas e ferramentas",
        },
      },
      status_empresa: {
        estagio_atual: "Estruturação",
        proxima_fase: "Otimização",
        acao_prioritaria: "Organizar processos e implementar sistemas eficientes",
      },
    },
    Otimização: {
      cards_status: {
        concluido: {
          titulo: "Concluído recentemente",
          texto: "Métricas de performance implementadas",
        },
        trabalhando: {
          titulo: "Trabalhando agora",
          texto: "Análise e melhoria contínua dos processos",
        },
      },
      status_empresa: {
        estagio_atual: "Otimização",
        proxima_fase: "Escala",
        acao_prioritaria: "Melhorar eficiência e maximizar resultados",
      },
    },
    Escala: {
      cards_status: {
        concluido: {
          titulo: "Concluído recentemente",
          texto: "Estratégias de expansão validadas",
        },
        trabalhando: {
          titulo: "Trabalhando agora",
          texto: "Execução do plano de crescimento acelerado",
        },
      },
      status_empresa: {
        estagio_atual: "Escala",
        proxima_fase: "Consolidação",
        acao_prioritaria: "Expandir operações e aumentar market share",
      },
    },
  }

  return textosPorFase[fase] || textosPorFase["Alinhamento"]
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const adminEmail = request.headers.get("x-admin-email") || "sistema"

    console.log("[v0] Creating mentorado with data:", data, "by admin:", adminEmail)

    const {
      nome,
      email,
      slug,
      empresa,
      telefone,
      comentarios,
      fase_atual = "Alinhamento",
      progresso = 1,
      calls_realizadas = 0,
    } = data

    // Validações básicas
    if (!nome || !email || !slug) {
      return NextResponse.json({ error: "Nome, email e slug são obrigatórios" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Verificar se slug já existe
    const existingSlug = await sql`
      SELECT id FROM mentorados WHERE slug = ${slug}
    `

    if (existingSlug.length > 0) {
      return NextResponse.json({ error: "Slug já existe. Escolha outro." }, { status: 409 })
    }

    // Verificar se email já existe (agora case-insensitive)
    const existingEmail = await sql`
      SELECT id FROM mentorados WHERE email = ${normalizedEmail}
    `

    if (existingEmail.length > 0) {
      return NextResponse.json({ error: "Email já cadastrado." }, { status: 409 })
    }

    const textosDefault = getDefaultTextsByPhase(fase_atual)

    const result = await sql`
      INSERT INTO mentorados (
        nome, email, slug, empresa, telefone, fase_atual, progresso, calls_realizadas,
        cards_status, status_empresa, agenda_mentoria, call_pendente, comentarios,
        created_by, updated_by
      ) VALUES (
        ${nome}, ${normalizedEmail}, ${slug}, ${empresa}, ${telefone || null}, ${fase_atual}, ${progresso}, ${calls_realizadas},
        ${JSON.stringify(textosDefault.cards_status)},
        ${JSON.stringify(textosDefault.status_empresa)},
        ${JSON.stringify({ proxima_call: null, calls_realizadas: 0 })},
        NULL, ${comentarios || null},
        ${adminEmail}, ${adminEmail}
      ) RETURNING *
    `

    await sql`
      INSERT INTO audit_log (admin_email, action, table_name, record_id, details)
      VALUES (
        ${adminEmail},
        'CREATE_MENTORADO',
        'mentorados',
        ${result[0].id},
        ${JSON.stringify({ nome, email: normalizedEmail, slug, empresa, telefone, fase_atual, comentarios })}::jsonb
      )
    `

    console.log("[v0] Mentorado created successfully by:", adminEmail)

    return NextResponse.json({
      success: true,
      mentorado: result[0],
    })
  } catch (error) {
    console.error("[v0] Erro ao criar mentorado:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const result = await sql`
      SELECT * FROM mentorados ORDER BY created_at DESC
    `

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Erro ao buscar mentorados:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
