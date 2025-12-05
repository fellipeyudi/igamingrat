import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(
  "postgresql://neondb_owner:npg_TNMj2X4HrqEw@ep-misty-mode-acoot3dc-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    let meetings
    if (date) {
      meetings = await sql`
        SELECT 
          r.*,
          m.nome as mentorado_nome,
          m.empresa as mentorado_empresa,
          a.nome as admin_nome,
          a.email as admin_email
        FROM reunioes r
        JOIN mentorados m ON r.mentorado_id = m.id
        LEFT JOIN admins a ON r.admin_id = a.id
        WHERE r.data = ${date}
        ORDER BY r.data, r.horario
      `
    } else {
      meetings = await sql`
        SELECT 
          r.*,
          m.nome as mentorado_nome,
          m.empresa as mentorado_empresa,
          a.nome as admin_nome,
          a.email as admin_email
        FROM reunioes r
        JOIN mentorados m ON r.mentorado_id = m.id
        LEFT JOIN admins a ON r.admin_id = a.id
        ORDER BY r.data, r.horario
      `
    }

    const formattedMeetings = meetings.map((meeting) => {
      let dataFormatada = meeting.data

      try {
        // Extrair apenas a parte da data (YYYY-MM-DD) sem timezone
        let dataStr = meeting.data

        if (meeting.data instanceof Date) {
          dataStr = meeting.data.toISOString().split("T")[0]
        } else if (typeof meeting.data === "string") {
          dataStr = meeting.data.split("T")[0]
        }

        // Manter no formato ISO para compatibilidade com o frontend
        dataFormatada = dataStr
      } catch (error) {
        console.error("[v0] Erro ao formatar data da reunião:", error, meeting.data)
      }

      return {
        ...meeting,
        data: dataFormatada,
      }
    })

    return NextResponse.json(formattedMeetings)
  } catch (error) {
    console.error("Erro ao buscar reuniões:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const {
      mentorado_id,
      data: meetingDate,
      horario,
      duracao,
      titulo,
      meet_link,
      admin_id,
      createCallPendente,
      callPendenteTitulo,
      callPendenteStatus,
      planejamento, // Adicionar campo planejamento
    } = data

    const adminEmail = request.headers.get("x-admin-email") || "sistema"

    console.log("[v0] Dados recebidos:", {
      mentorado_id,
      meetingDate,
      horario,
      duracao,
      titulo,
      meet_link,
      admin_id,
      createCallPendente,
      callPendenteTitulo,
      callPendenteStatus,
      adminEmail,
      planejamento, // Log do planejamento
    })

    // Validar parâmetros obrigatórios
    if (!mentorado_id || !meetingDate || !horario || !titulo || !admin_id) {
      return NextResponse.json({ error: "Parâmetros obrigatórios faltando" }, { status: 400 })
    }

    const newMeeting = await sql`
      INSERT INTO reunioes (mentorado_id, data, horario, duracao, titulo, meet_link, admin_id, status, planejamento, created_by, created_at)
      VALUES (
        ${Number.parseInt(mentorado_id)}::integer,
        ${meetingDate}::date,
        ${horario}::time,
        ${Number.parseInt(duracao) || 60}::integer,
        ${titulo}::text,
        ${meet_link || null}::text,
        ${Number.parseInt(admin_id)}::integer,
        'agendada'::text,
        ${planejamento || null}::text,
        ${adminEmail}::text,
        NOW()
      )
      RETURNING *
    `

    console.log("[v0] Reunião criada:", newMeeting[0])

    const mentorado = await sql`
      SELECT nome FROM mentorados WHERE id = ${Number.parseInt(mentorado_id)}
    `

    await sql`
      INSERT INTO audit_log (admin_email, action, table_name, record_id, details)
      VALUES (
        ${adminEmail},
        'CREATE_MEETING',
        'reunioes',
        ${newMeeting[0].id},
        ${JSON.stringify({
          mentorado_id,
          mentorado_nome: mentorado[0]?.nome,
          meeting_titulo: titulo,
          data: meetingDate,
          horario,
          meet_link,
          admin_id,
          planejamento, // Incluir planejamento nos detalhes do log
        })}::jsonb
      )
    `

    console.log("[v0] Buscando próxima reunião para mentorado_id:", mentorado_id)

    const proximaReuniao = await sql`
      SELECT data, horario, titulo, meet_link
      FROM reunioes 
      WHERE mentorado_id = ${Number.parseInt(mentorado_id)}::integer 
        AND status = 'agendada'
        AND (
          DATE(data) > CURRENT_DATE AT TIME ZONE 'America/Sao_Paulo'
          OR (
            DATE(data) = CURRENT_DATE AT TIME ZONE 'America/Sao_Paulo' 
            AND horario > (CURRENT_TIME AT TIME ZONE 'America/Sao_Paulo')::time
          )
        )
      ORDER BY data, horario
      LIMIT 1
    `

    console.log("[v0] Próxima reunião encontrada:", proximaReuniao)

    if (proximaReuniao.length > 0) {
      const reuniao = proximaReuniao[0]

      let dataFormatada = "Data inválida"
      try {
        // Extrair apenas a parte da data (YYYY-MM-DD) e formatar manualmente
        let dataStr = reuniao.data

        // Se a data vier como objeto Date, converter para string
        if (reuniao.data instanceof Date) {
          dataStr = reuniao.data.toISOString().split("T")[0]
        } else if (typeof reuniao.data === "string") {
          dataStr = reuniao.data.split("T")[0]
        }

        const [year, month, day] = dataStr.split("-")
        dataFormatada = `${day}/${month}/${year}`

        console.log("[v0] Data original:", reuniao.data, "Data formatada:", dataFormatada)
      } catch (error) {
        console.error("[v0] Erro ao formatar data:", error, reuniao.data)
        try {
          const date = new Date(reuniao.data)
          if (!isNaN(date.getTime())) {
            dataFormatada = date.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })
          }
        } catch (fallbackError) {
          console.error("[v0] Erro no fallback de formatação:", fallbackError)
        }
      }

      // Formatar horário (HH:MM)
      const horarioFormatado = reuniao.horario.substring(0, 5)

      const agendaUpdate = {
        proxima_call: {
          data: dataFormatada,
          horario: horarioFormatado,
          titulo: reuniao.titulo,
          meet_link: reuniao.meet_link || null,
        },
      }

      // Se foi solicitado criar call pendente, adicionar aos dados
      if (createCallPendente && callPendenteTitulo) {
        agendaUpdate.call_pendente = {
          titulo: callPendenteTitulo,
          status: callPendenteStatus || "A definir",
        }

        await sql`
          UPDATE mentorados 
          SET call_pendente = ${JSON.stringify(agendaUpdate.call_pendente)}::jsonb
          WHERE id = ${Number.parseInt(mentorado_id)}::integer
        `
        console.log("[v0] Call pendente criada:", agendaUpdate.call_pendente)
      }

      const updateResult = await sql`
        UPDATE mentorados 
        SET agenda_mentoria = jsonb_set(
          COALESCE(agenda_mentoria, '{}'),
          '{proxima_call}',
          ${JSON.stringify(agendaUpdate.proxima_call)}::jsonb
        )
        WHERE id = ${Number.parseInt(mentorado_id)}::integer
        RETURNING agenda_mentoria
      `

      console.log("[v0] Agenda do mentorado atualizada com próxima call:", {
        mentorado_id: mentorado_id,
        agenda_atualizada: updateResult[0]?.agenda_mentoria,
        proxima_call: agendaUpdate.proxima_call,
      })
    } else {
      console.log("[v0] Nenhuma reunião futura encontrada para o mentorado")
    }

    console.log("[v0] Reunião criada com sucesso:", newMeeting[0])
    return NextResponse.json(newMeeting[0])
  } catch (error) {
    console.error("Erro ao criar reunião:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
