import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import {
  sendWhatsAppMessage,
  formatarMensagemReuniao,
  formatarLembreteReuniao,
  NOTIFICATION_GROUP_ID,
} from "@/lib/whatsapp"

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
      planejamento,
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
      planejamento,
    })

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
          planejamento,
        })}::jsonb
      )
    `

    try {
      const [year, month, day] = meetingDate.split("-")
      const dataFormatada = `${day}/${month}/${year}`
      const horarioFormatado = horario.substring(0, 5)

      const mensagem = formatarMensagemReuniao({
        mentorado_nome: mentorado[0]?.nome || "Mentorado",
        titulo,
        data: dataFormatada,
        horario: horarioFormatado,
        meet_link,
      })

      console.log("[v0] Preparando envio de WhatsApp:", {
        grupo: NOTIFICATION_GROUP_ID,
        mensagem,
      })

      const logInicial = await sql`
        INSERT INTO whatsapp_logs (telefone, mensagem, tipo, status, reuniao_id, mentorado_id, enviado_por)
        VALUES (
          ${NOTIFICATION_GROUP_ID},
          ${mensagem},
          'reuniao_criada',
          'enviando',
          ${newMeeting[0].id},
          ${Number.parseInt(mentorado_id)},
          ${adminEmail}
        )
        RETURNING id
      `

      const logId = logInicial[0].id

      sendWhatsAppMessage(NOTIFICATION_GROUP_ID, mensagem)
        .then(async (resultado) => {
          await sql`
            UPDATE whatsapp_logs
            SET 
              status = ${resultado.success ? "sucesso" : "erro"},
              response_data = ${JSON.stringify(resultado.response || {})},
              error_message = ${resultado.error || null}
            WHERE id = ${logId}
          `
          console.log("[v0] WhatsApp enviado:", resultado)
        })
        .catch(async (error) => {
          await sql`
            UPDATE whatsapp_logs
            SET 
              status = 'erro',
              error_message = ${error.message}
            WHERE id = ${logId}
          `
          console.error("[v0] Erro ao enviar WhatsApp:", error)
        })

      const agora = new Date()
      const [anoReuniao, mesReuniao, diaReuniao] = meetingDate.split("-")
      const dataReuniao = new Date(Number(anoReuniao), Number(mesReuniao) - 1, Number(diaReuniao))
      const [horaReuniao, minutoReuniao] = horario.split(":")
      dataReuniao.setHours(Number(horaReuniao), Number(minutoReuniao), 0, 0)

      const diferencaMinutos = (dataReuniao.getTime() - agora.getTime()) / 60000

      console.log("[v0] Verificando janela de alerta:", {
        agora: agora.toISOString(),
        dataReuniao: dataReuniao.toISOString(),
        diferencaMinutos,
      })

      if (diferencaMinutos > 0 && diferencaMinutos <= 30) {
        const mensagemLembrete = formatarLembreteReuniao({
          mentorado_nome: mentorado[0]?.nome || "Mentorado",
          titulo,
          horario: horarioFormatado,
          meet_link,
          minutos: Math.floor(diferencaMinutos),
        })

        sendWhatsAppMessage(NOTIFICATION_GROUP_ID, mensagemLembrete, "lembrete_reuniao_imediato")
          .then(async (resultado) => {
            await sql`
              INSERT INTO whatsapp_logs (telefone, mensagem, tipo, status, reuniao_id, mentorado_id, enviado_por)
              VALUES (
                ${NOTIFICATION_GROUP_ID},
                ${mensagemLembrete},
                'lembrete_reuniao_imediato',
                ${resultado.success ? "sucesso" : "erro"},
                ${newMeeting[0].id},
                ${Number.parseInt(mentorado_id)},
                'sistema_automatico'
              )
            `

            await sql`
              UPDATE reunioes
              SET lembrete_30min_enviado = TRUE
              WHERE id = ${newMeeting[0].id}
            `

            console.log("[v0] Lembrete imediato enviado:", resultado)
          })
          .catch((error) => {
            console.error("[v0] Erro ao enviar lembrete imediato:", error)
          })
      }

      console.log("[v0] Notificação WhatsApp iniciada (async)")
    } catch (whatsappError) {
      console.error("[v0] Erro ao processar notificação WhatsApp:", whatsappError)
    }

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
        let dataStr = reuniao.data

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

      const horarioFormatado = reuniao.horario.substring(0, 5)

      const agendaUpdate = {
        proxima_call: {
          data: dataFormatada,
          horario: horarioFormatado,
          titulo: reuniao.titulo,
          meet_link: reuniao.meet_link || null,
        },
      }

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
