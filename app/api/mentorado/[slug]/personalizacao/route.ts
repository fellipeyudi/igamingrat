import { neon } from "@neondatabase/serverless"

const sql = neon(
  "postgresql://neondb_owner:npg_TNMj2X4HrqEw@ep-misty-mode-acoot3dc-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
)

export async function PUT(request: Request, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params
    const data = await request.json()

    const adminEmail = request.headers.get("x-admin-email") || "sistema"

    console.log("[v0] Atualizando personalização para slug:", slug)
    console.log("[v0] Dados recebidos:", data)
    console.log("[v0] Admin realizando ação:", adminEmail)

    const callPendenteToSave =
      data.callPendente && data.callPendente.titulo && data.callPendente.titulo.trim() ? data.callPendente : null

    console.log("[v0] Call pendente a ser salva:", callPendenteToSave)

    const result = await sql`
      UPDATE mentorados 
      SET 
        conquistas_recentes = ${JSON.stringify(data.conquistasRecentes || [])},
        proximos_marcos = ${JSON.stringify(data.proximosMarcos || [])},
        anotacoes_mentoria = ${JSON.stringify(data.anotacoesMentoria || [])},
        status_empresa = ${JSON.stringify(data.statusEmpresa || {})},
        agenda_mentoria = ${JSON.stringify(data.agendaMentoria || {})},
        card_concluido = ${JSON.stringify(data.cardConcluido || {})},
        card_trabalhando = ${JSON.stringify(data.cardTrabalhando || {})},
        stepper_config = ${JSON.stringify(data.stepperConfig || [])},
        call_pendente = ${callPendenteToSave ? JSON.stringify(callPendenteToSave) : null},
        saudacao = ${data.saudacao || "👋 Olá!"},
        subtitulo = ${data.subtitulo || "Acompanhe seu progresso na mentoria empresarial"},
        fase_atual = ${data.faseAtual || "Estruturação"},
        progresso = ${data.progresso ?? 1},
        calls_realizadas = ${data.callsRealizadas || 0},
        modulos_concluidos = ${data.modulosConcluidos || 0},
        dias_mentoria = ${data.diasMentoria || 0},
        updated_by = ${adminEmail},
        updated_at = NOW()
      WHERE slug = ${slug}
      RETURNING *
    `

    if (result.length === 0) {
      return Response.json({ error: "Mentorado não encontrado" }, { status: 404 })
    }

    await sql`
      INSERT INTO audit_log (admin_email, action, table_name, record_id, details)
      VALUES (
        ${adminEmail},
        'UPDATE_MENTORADO',
        'mentorados',
        ${result[0].id},
        ${JSON.stringify({
          slug,
          fase_atual: data.faseAtual,
          progresso: data.progresso,
          mentorado_nome: result[0].nome,
        })}::jsonb
      )
    `

    console.log("[v0] Personalização atualizada com sucesso por:", adminEmail)
    return Response.json({ success: true, mentorado: result[0] })
  } catch (error) {
    console.error("[v0] Erro ao atualizar personalização:", error)
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
