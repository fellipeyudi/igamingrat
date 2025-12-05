import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(
  "postgresql://neondb_owner:npg_TNMj2X4HrqEw@ep-misty-mode-acoot3dc-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
)

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const meetingId = params.id
    const data = await request.json()
    const adminEmail = request.headers.get("x-admin-email") || "sistema"

    // Se for apenas para marcar como concluída (comportamento antigo)
    if (data.status === "concluida" && Object.keys(data).length <= 3) {
      const { status, observacoes, data_realizacao } = data

      const meeting = await sql`
        SELECT r.*, m.nome as mentorado_nome 
        FROM reunioes r
        JOIN mentorados m ON r.mentorado_id = m.id
        WHERE r.id = ${meetingId}
      `

      if (meeting.length === 0) {
        return NextResponse.json({ error: "Reunião não encontrada" }, { status: 404 })
      }

      if (meeting[0].status === "concluida") {
        console.log("[v0] Reunião já está concluída, ignorando atualização")
        return NextResponse.json({ success: true, message: "Reunião já estava concluída" })
      }

      const mentoradoId = meeting[0].mentorado_id

      await sql`
        UPDATE reunioes 
        SET status = 'concluida',
            observacoes = ${observacoes || null},
            data_realizacao = ${data_realizacao ? new Date(data_realizacao) : new Date()},
            completed_by = ${adminEmail},
            updated_by = ${adminEmail},
            updated_at = NOW()
        WHERE id = ${meetingId}
      `

      await sql`
        INSERT INTO audit_log (admin_email, action, table_name, record_id, details)
        VALUES (
          ${adminEmail},
          'COMPLETE_MEETING',
          'reunioes',
          ${Number.parseInt(meetingId)},
          ${JSON.stringify({
            mentorado_id: mentoradoId,
            mentorado_nome: meeting[0].mentorado_nome,
            meeting_titulo: meeting[0].titulo,
            observacoes,
            data_realizacao,
          })}::jsonb
        )
      `

      await sql`
        UPDATE mentorados 
        SET calls_realizadas = COALESCE(calls_realizadas, 0) + 1,
            updated_by = ${adminEmail},
            updated_at = NOW()
        WHERE id = ${mentoradoId}
      `

      const ultimasCalls = await sql`
        SELECT data, horario, titulo, data_realizacao, observacoes, meet_link
        FROM reunioes 
        WHERE mentorado_id = ${mentoradoId}
          AND status = 'concluida'
        ORDER BY COALESCE(data_realizacao, updated_at) DESC
        LIMIT 3
      `

      const proximaReuniao = await sql`
        SELECT data, horario, titulo, meet_link
        FROM reunioes 
        WHERE mentorado_id = ${mentoradoId}
          AND status = 'agendada'
          AND (DATE(data) > CURRENT_DATE OR (DATE(data) = CURRENT_DATE AND horario > CURRENT_TIME))
        ORDER BY data, horario
        LIMIT 1
      `

      const ultimasCallsFormatadas = ultimasCalls.map((call) => {
        let dataFormatada = "Data inválida"
        try {
          const dataParaFormatar = call.data_realizacao || call.data
          let dataStr = dataParaFormatar
          if (dataParaFormatar instanceof Date) {
            dataStr = dataParaFormatar.toISOString().split("T")[0]
          } else if (typeof dataParaFormatar === "string") {
            dataStr = dataParaFormatar.split("T")[0]
          }
          const [year, month, day] = dataStr.split("-")
          dataFormatada = `${day}/${month}/${year}`
        } catch (error) {
          console.error("[v0] Erro ao formatar data:", error)
        }

        return {
          data: dataFormatada,
          horario: call.horario?.substring(0, 5) || "",
          titulo: call.titulo,
          observacoes: call.observacoes,
          meet_link: call.meet_link,
        }
      })

      const agendaAtualizada = {
        proxima_call: null,
        ultimas_calls: ultimasCallsFormatadas,
      }

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
        } catch (error) {
          console.error("[v0] Erro ao formatar data:", error)
        }

        agendaAtualizada.proxima_call = {
          data: dataFormatada,
          horario: reuniao.horario.substring(0, 5),
          titulo: reuniao.titulo,
          meet_link: reuniao.meet_link,
        }
      }

      await sql`
        UPDATE mentorados 
        SET agenda_mentoria = ${JSON.stringify(agendaAtualizada)}::jsonb
        WHERE id = ${mentoradoId}
      `

      console.log("[v0] Reunião marcada como concluída por:", adminEmail)
      return NextResponse.json({ success: true })
    }

    // Edição completa da reunião (novo comportamento)
    const {
      mentorado_id,
      data: meetingDate,
      horario,
      duracao,
      titulo,
      meet_link,
      admin_id,
      status,
      planejamento,
    } = data

    // Validar parâmetros obrigatórios
    if (!mentorado_id || !meetingDate || !horario || !titulo || !admin_id) {
      return NextResponse.json({ error: "Parâmetros obrigatórios faltando" }, { status: 400 })
    }

    // Atualizar a reunião
    const updatedMeeting = await sql`
      UPDATE reunioes 
      SET 
        mentorado_id = ${Number.parseInt(mentorado_id)}::integer,
        data = ${meetingDate}::date,
        horario = ${horario}::time,
        duracao = ${Number.parseInt(duracao) || 60}::integer,
        titulo = ${titulo}::text,
        meet_link = ${meet_link || null}::text,
        admin_id = ${Number.parseInt(admin_id)}::integer,
        status = ${status || "agendada"}::text,
        planejamento = ${planejamento || null}::text,
        updated_by = ${adminEmail},
        updated_at = NOW()
      WHERE id = ${Number.parseInt(meetingId)}::integer
      RETURNING *
    `

    if (updatedMeeting.length === 0) {
      return NextResponse.json({ error: "Reunião não encontrada" }, { status: 404 })
    }

    // Buscar nome do mentorado para o log
    const mentorado = await sql`
      SELECT nome FROM mentorados WHERE id = ${Number.parseInt(mentorado_id)}
    `

    // Registrar no audit log
    await sql`
      INSERT INTO audit_log (admin_email, action, table_name, record_id, details)
      VALUES (
        ${adminEmail},
        'UPDATE_MEETING',
        'reunioes',
        ${updatedMeeting[0].id},
        ${JSON.stringify({
          mentorado_id,
          mentorado_nome: mentorado[0]?.nome,
          meeting_titulo: titulo,
          data: meetingDate,
          horario,
          meet_link,
          admin_id,
          status,
        })}::jsonb
      )
    `

    // Atualizar a próxima call no mentorado se esta for a próxima reunião agendada
    const proximaReuniao = await sql`
      SELECT data, horario, titulo, meet_link
      FROM reunioes 
      WHERE mentorado_id = ${Number.parseInt(mentorado_id)}::integer 
        AND DATE(data) >= CURRENT_DATE
        AND status = 'agendada'
      ORDER BY data, horario
      LIMIT 1
    `

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
      } catch (error) {
        console.error("[v0] Erro ao formatar data:", error)
      }

      const horarioFormatado = reuniao.horario.substring(0, 5)

      await sql`
        UPDATE mentorados 
        SET agenda_mentoria = jsonb_set(
          COALESCE(agenda_mentoria, '{}'),
          '{proxima_call}',
          ${JSON.stringify({
            data: dataFormatada,
            horario: horarioFormatado,
            titulo: reuniao.titulo,
            meet_link: reuniao.meet_link || null,
          })}::jsonb
        )
        WHERE id = ${Number.parseInt(mentorado_id)}::integer
      `
    }

    console.log("[v0] Reunião atualizada com sucesso:", updatedMeeting[0])
    return NextResponse.json(updatedMeeting[0])
  } catch (error) {
    console.error("Erro ao atualizar reunião:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const meetingId = params.id
    const { status } = await request.json()

    const adminEmail = request.headers.get("x-admin-email") || "sistema"

    if (status !== "concluida") {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 })
    }

    const meeting = await sql`
      SELECT * FROM reunioes WHERE id = ${meetingId}
    `

    if (meeting.length === 0) {
      return NextResponse.json({ error: "Reunião não encontrada" }, { status: 404 })
    }

    const mentoradoId = meeting[0].mentorado_id

    await sql`
      UPDATE reunioes 
      SET status = 'concluida',
          completed_by = ${adminEmail},
          updated_by = ${adminEmail},
          updated_at = NOW()
      WHERE id = ${meetingId}
    `

    await sql`
      INSERT INTO audit_log (admin_email, action, table_name, record_id, details)
      VALUES (
        ${adminEmail},
        'COMPLETE_MEETING',
        'reunioes',
        ${Number.parseInt(meetingId)},
        ${JSON.stringify({ mentorado_id: mentoradoId })}::jsonb
      )
    `

    await sql`
      UPDATE mentorados 
      SET calls_realizadas = COALESCE(calls_realizadas, 0) + 1,
          updated_by = ${adminEmail},
          updated_at = NOW()
      WHERE id = ${mentoradoId}
    `

    const proximaReuniao = await sql`
      SELECT data, horario, titulo, meet_link
      FROM reunioes 
      WHERE mentorado_id = ${mentoradoId}
        AND status = 'agendada'
        AND (DATE(data) > CURRENT_DATE OR (DATE(data) = CURRENT_DATE AND horario > CURRENT_TIME))
      ORDER BY data, horario
      LIMIT 1
    `

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
      } catch (error) {
        console.error("[v0] Erro ao formatar data:", error)
      }

      const horarioFormatado = reuniao.horario.substring(0, 5)

      await sql`
        UPDATE mentorados 
        SET agenda_mentoria = jsonb_set(
          COALESCE(agenda_mentoria, '{}'),
          '{proxima_call}',
          ${JSON.stringify({
            data: dataFormatada,
            horario: horarioFormatado,
            titulo: reuniao.titulo,
            meet_link: reuniao.meet_link, // Incluindo meet_link na próxima call
          })}::jsonb
        )
        WHERE id = ${mentoradoId}
      `
    } else {
      await sql`
        UPDATE mentorados 
        SET agenda_mentoria = jsonb_set(
          COALESCE(agenda_mentoria, '{}'),
          '{proxima_call}',
          'null'::jsonb
        )
        WHERE id = ${mentoradoId}
      `
    }

    console.log("[v0] Reunião marcada como concluída por:", adminEmail)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao marcar reunião como concluída:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const meetingId = params.id

    const adminEmail = request.headers.get("x-admin-email") || "sistema"

    const meeting = await sql`
      SELECT r.*, m.nome as mentorado_nome
      FROM reunioes r
      JOIN mentorados m ON r.mentorado_id = m.id
      WHERE r.id = ${meetingId}
    `

    if (meeting.length === 0) {
      return NextResponse.json({ error: "Reunião não encontrada" }, { status: 404 })
    }

    const mentoradoId = meeting[0].mentorado_id
    const wasCompleted = meeting[0].status === "concluida"

    await sql`
      INSERT INTO audit_log (admin_email, action, table_name, record_id, details)
      VALUES (
        ${adminEmail},
        'DELETE_MEETING',
        'reunioes',
        ${Number.parseInt(meetingId)},
        ${JSON.stringify({
          mentorado_id: mentoradoId,
          mentorado_nome: meeting[0].mentorado_nome,
          meeting_titulo: meeting[0].titulo,
          data: meeting[0].data,
        })}::jsonb
      )
    `

    // Excluir reunião
    await sql`
      DELETE FROM reunioes WHERE id = ${meetingId}
    `

    if (wasCompleted) {
      await sql`
        UPDATE mentorados 
        SET calls_realizadas = GREATEST(COALESCE(calls_realizadas, 1) - 1, 0),
            updated_by = ${adminEmail},
            updated_at = NOW()
        WHERE id = ${mentoradoId}
      `
    }

    const ultimasCalls = await sql`
      SELECT data, horario, titulo, data_realizacao, observacoes, meet_link
      FROM reunioes 
      WHERE mentorado_id = ${mentoradoId}
        AND status = 'concluida'
      ORDER BY COALESCE(data_realizacao, updated_at) DESC
      LIMIT 3
    `

    const proximaReuniao = await sql`
      SELECT data, horario, titulo, meet_link
      FROM reunioes 
      WHERE mentorado_id = ${mentoradoId}
        AND status = 'agendada'
        AND (DATE(data) > CURRENT_DATE OR (DATE(data) = CURRENT_DATE AND horario > CURRENT_TIME))
      ORDER BY data, horario
      LIMIT 1
    `

    const ultimasCallsFormatadas = ultimasCalls.map((call) => {
      let dataFormatada = "Data inválida"
      try {
        const dataParaFormatar = call.data_realizacao || call.data
        let dataStr = dataParaFormatar
        if (dataParaFormatar instanceof Date) {
          dataStr = dataParaFormatar.toISOString().split("T")[0]
        } else if (typeof dataParaFormatar === "string") {
          dataStr = dataParaFormatar.split("T")[0]
        }
        const [year, month, day] = dataStr.split("-")
        dataFormatada = `${day}/${month}/${year}`
      } catch (error) {
        console.error("[v0] Erro ao formatar data:", error)
      }

      return {
        data: dataFormatada,
        horario: call.horario?.substring(0, 5) || "",
        titulo: call.titulo,
        observacoes: call.observacoes,
        meet_link: call.meet_link,
      }
    })

    const agendaAtualizada = {
      proxima_call: null,
      ultimas_calls: ultimasCallsFormatadas,
    }

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
      } catch (error) {
        console.error("[v0] Erro ao formatar data:", error)
      }

      agendaAtualizada.proxima_call = {
        data: dataFormatada,
        horario: reuniao.horario.substring(0, 5),
        titulo: reuniao.titulo,
        meet_link: reuniao.meet_link,
      }
    }

    await sql`
      UPDATE mentorados 
      SET agenda_mentoria = ${JSON.stringify(agendaAtualizada)}::jsonb,
          updated_by = ${adminEmail},
          updated_at = NOW()
      WHERE id = ${mentoradoId}
    `

    console.log("[v0] Reunião excluída por:", adminEmail)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir reunião:", error)
    return NextResponse.json({ error: "Erro interno do servidor", details: error.message }, { status: 500 })
  }
}
