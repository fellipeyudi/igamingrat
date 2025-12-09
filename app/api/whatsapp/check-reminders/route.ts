import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import {
  sendWhatsAppMessage,
  formatarLembreteReuniao,
  formatarReuniaoAgora,
  formatarLembreteTask,
  formatarTaskVencida,
  NOTIFICATION_GROUP_ID,
} from "@/lib/whatsapp"

export const dynamic = "force-dynamic"
export const revalidate = 0

const sql = neon(
  "postgresql://neondb_owner:npg_TNMj2X4HrqEw@ep-misty-mode-acoot3dc-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
)

export async function GET() {
  try {
    console.log("[v0] Iniciando verificação de lembretes...")
    console.log(
      "[v0] Hora atual do servidor (São Paulo):",
      new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
    )

    const resultados = {
      reunioes_30min: [] as any[],
      reunioes_agora: [] as any[],
      tasks_10min: [] as any[],
      tasks_vencidas: [] as any[],
    }

    try {
      console.log("[v0] Buscando reuniões 30min...")

      const reunioes30min = await sql`
        SELECT 
          r.id,
          r.titulo,
          r.horario,
          r.data,
          r.meet_link,
          r.lembrete_30min_enviado,
          m.nome as mentorado_nome,
          r.mentorado_id,
          (NOW() AT TIME ZONE 'America/Sao_Paulo')::time as hora_atual,
          ((NOW() AT TIME ZONE 'America/Sao_Paulo')::time + INTERVAL '25 minutes')::time as janela_inicio,
          ((NOW() AT TIME ZONE 'America/Sao_Paulo')::time + INTERVAL '35 minutes')::time as janela_fim
        FROM reunioes r
        JOIN mentorados m ON r.mentorado_id = m.id
        WHERE 
          r.status = 'agendada'
          AND DATE(r.data) = CURRENT_DATE
          AND r.lembrete_30min_enviado = FALSE
          AND r.horario::time BETWEEN 
            ((NOW() AT TIME ZONE 'America/Sao_Paulo')::time + INTERVAL '25 minutes') 
            AND 
            ((NOW() AT TIME ZONE 'America/Sao_Paulo')::time + INTERVAL '35 minutes')
      `

      console.log(`[v0] Encontradas ${reunioes30min.length} reuniões na janela de 30min`)
      if (reunioes30min.length > 0) {
        console.log("[v0] Detalhes da primeira reunião:", {
          id: reunioes30min[0].id,
          horario: reunioes30min[0].horario,
          hora_atual: reunioes30min[0].hora_atual,
          janela_inicio: reunioes30min[0].janela_inicio,
          janela_fim: reunioes30min[0].janela_fim,
          lembrete_enviado: reunioes30min[0].lembrete_30min_enviado,
        })
      }

      for (const reuniao of reunioes30min) {
        try {
          const horarioFormatado = reuniao.horario.substring(0, 5)
          const mensagem = formatarLembreteReuniao({
            mentorado_nome: reuniao.mentorado_nome,
            titulo: reuniao.titulo,
            horario: horarioFormatado,
            meet_link: reuniao.meet_link,
            minutos: 30,
          })

          console.log(`[v0] Enviando lembrete 30min para reunião ${reuniao.id}...`)
          const resultado = await sendWhatsAppMessage(NOTIFICATION_GROUP_ID, mensagem, "lembrete_reuniao_30min")
          console.log(`[v0] Resultado do envio: ${resultado.success ? "sucesso" : "erro"}`)

          await sql`
            INSERT INTO whatsapp_logs (telefone, mensagem, tipo, status, reuniao_id, mentorado_id, enviado_por)
            VALUES (
              ${NOTIFICATION_GROUP_ID},
              ${mensagem},
              'lembrete_reuniao_30min',
              ${resultado.success ? "sucesso" : "erro"},
              ${reuniao.id},
              ${reuniao.mentorado_id},
              'sistema_automatico'
            )
          `

          await sql`
            UPDATE reunioes
            SET lembrete_30min_enviado = TRUE
            WHERE id = ${reuniao.id}
          `

          resultados.reunioes_30min.push({
            id: reuniao.id,
            titulo: reuniao.titulo,
            sucesso: resultado.success,
          })
        } catch (error: any) {
          resultados.reunioes_30min.push({
            id: reuniao.id,
            titulo: reuniao.titulo,
            sucesso: false,
            erro: error.message,
          })
        }
      }
    } catch (error: any) {
      console.error("[v0] Erro ao buscar reuniões 30min:", error.message)
    }

    try {
      console.log("[v0] Buscando reuniões agora...")

      const reunioesAgora = await sql`
        SELECT 
          r.id,
          r.titulo,
          r.horario,
          r.data,
          r.meet_link,
          r.lembrete_inicio_enviado,
          m.nome as mentorado_nome,
          r.mentorado_id,
          (NOW() AT TIME ZONE 'America/Sao_Paulo')::time as hora_atual,
          ((NOW() AT TIME ZONE 'America/Sao_Paulo')::time - INTERVAL '2 minutes')::time as janela_inicio,
          ((NOW() AT TIME ZONE 'America/Sao_Paulo')::time + INTERVAL '2 minutes')::time as janela_fim
        FROM reunioes r
        JOIN mentorados m ON r.mentorado_id = m.id
        WHERE 
          r.status = 'agendada'
          AND DATE(r.data) = CURRENT_DATE
          AND r.lembrete_inicio_enviado = FALSE
          AND r.horario::time BETWEEN 
            ((NOW() AT TIME ZONE 'America/Sao_Paulo')::time - INTERVAL '2 minutes') 
            AND 
            ((NOW() AT TIME ZONE 'America/Sao_Paulo')::time + INTERVAL '2 minutes')
      `

      console.log(`[v0] Encontradas ${reunioesAgora.length} reuniões na janela de agora`)
      if (reunioesAgora.length > 0) {
        console.log("[v0] Detalhes da primeira reunião:", {
          id: reunioesAgora[0].id,
          horario: reunioesAgora[0].horario,
          hora_atual: reunioesAgora[0].hora_atual,
          janela_inicio: reunioesAgora[0].janela_inicio,
          janela_fim: reunioesAgora[0].janela_fim,
          lembrete_enviado: reunioesAgora[0].lembrete_inicio_enviado,
        })
      }

      for (const reuniao of reunioesAgora) {
        try {
          const horarioFormatado = reuniao.horario.substring(0, 5)
          const mensagem = formatarReuniaoAgora({
            mentorado_nome: reuniao.mentorado_nome,
            titulo: reuniao.titulo,
            horario: horarioFormatado,
            meet_link: reuniao.meet_link,
          })

          console.log(`[v0] Enviando lembrete agora para reunião ${reuniao.id}...`)
          const resultado = await sendWhatsAppMessage(NOTIFICATION_GROUP_ID, mensagem, "lembrete_reuniao_agora")
          console.log(`[v0] Resultado do envio: ${resultado.success ? "sucesso" : "erro"}`)

          await sql`
            INSERT INTO whatsapp_logs (telefone, mensagem, tipo, status, reuniao_id, mentorado_id, enviado_por)
            VALUES (
              ${NOTIFICATION_GROUP_ID},
              ${mensagem},
              'lembrete_reuniao_agora',
              ${resultado.success ? "sucesso" : "erro"},
              ${reuniao.id},
              ${reuniao.mentorado_id},
              'sistema_automatico'
            )
          `

          await sql`
            UPDATE reunioes
            SET lembrete_inicio_enviado = TRUE
            WHERE id = ${reuniao.id}
          `

          resultados.reunioes_agora.push({
            id: reuniao.id,
            titulo: reuniao.titulo,
            sucesso: resultado.success,
          })
        } catch (error: any) {
          resultados.reunioes_agora.push({
            id: reuniao.id,
            titulo: reuniao.titulo,
            sucesso: false,
            erro: error.message,
          })
        }
      }
    } catch (error: any) {
      console.error("[v0] Erro ao buscar reuniões agora:", error.message)
    }

    try {
      console.log("[v0] Buscando tasks 10min...")

      const tasks10min = await sql`
        SELECT 
          t.id,
          t.titulo,
          t.descricao,
          t.prioridade,
          t.atribuido_para,
          t.horario_limite,
          t.lembrete_10min_enviado,
          m.nome as mentorado_nome,
          t.mentorado_id,
          (NOW() AT TIME ZONE 'America/Sao_Paulo')::time as hora_atual,
          ((NOW() AT TIME ZONE 'America/Sao_Paulo')::time + INTERVAL '5 minutes')::time as janela_inicio,
          ((NOW() AT TIME ZONE 'America/Sao_Paulo')::time + INTERVAL '15 minutes')::time as janela_fim
        FROM tasks t
        LEFT JOIN mentorados m ON t.mentorado_id = m.id
        WHERE 
          t.status != 'concluido'
          AND t.status != 'cancelado'
          AND t.data_limite = CURRENT_DATE
          AND t.horario_limite IS NOT NULL
          AND t.lembrete_10min_enviado = FALSE
          AND t.horario_limite BETWEEN 
            ((NOW() AT TIME ZONE 'America/Sao_Paulo')::time + INTERVAL '5 minutes') 
            AND 
            ((NOW() AT TIME ZONE 'America/Sao_Paulo')::time + INTERVAL '15 minutes')
      `

      console.log(`[v0] Encontradas ${tasks10min.length} tasks na janela de 10min`)
      if (tasks10min.length > 0) {
        console.log("[v0] Detalhes da primeira task:", {
          id: tasks10min[0].id,
          horario_limite: tasks10min[0].horario_limite,
          hora_atual: tasks10min[0].hora_atual,
          janela_inicio: tasks10min[0].janela_inicio,
          janela_fim: tasks10min[0].janela_fim,
          lembrete_enviado: tasks10min[0].lembrete_10min_enviado,
        })
      }

      for (const task of tasks10min) {
        try {
          const horarioFormatado = task.horario_limite.substring(0, 5)
          const mensagem = formatarLembreteTask({
            titulo: task.titulo,
            descricao: task.descricao,
            prioridade: task.prioridade,
            atribuido_para: task.atribuido_para,
            mentorado_nome: task.mentorado_nome,
            horario: horarioFormatado,
            minutos: 10,
          })

          console.log(`[v0] Enviando lembrete 10min para task ${task.id}...`)
          const resultado = await sendWhatsAppMessage(NOTIFICATION_GROUP_ID, mensagem, "lembrete_task_10min")
          console.log(`[v0] Resultado do envio: ${resultado.success ? "sucesso" : "erro"}`)

          await sql`
            INSERT INTO whatsapp_logs (telefone, mensagem, tipo, status, mentorado_id, enviado_por)
            VALUES (
              ${NOTIFICATION_GROUP_ID},
              ${mensagem},
              'lembrete_task_10min',
              ${resultado.success ? "sucesso" : "erro"},
              ${task.mentorado_id || null},
              'sistema_automatico'
            )
          `

          await sql`
            UPDATE tasks
            SET lembrete_10min_enviado = TRUE
            WHERE id = ${task.id}
          `

          resultados.tasks_10min.push({
            id: task.id,
            titulo: task.titulo,
            sucesso: resultado.success,
          })
        } catch (error: any) {
          resultados.tasks_10min.push({
            id: task.id,
            titulo: task.titulo,
            sucesso: false,
            erro: error.message,
          })
        }
      }
    } catch (error: any) {
      console.error("[v0] Erro ao buscar tasks 10min:", error.message)
    }

    try {
      console.log("[v0] Buscando tasks vencidas...")

      const tasksVencidas = await sql`
        SELECT 
          t.id,
          t.titulo,
          t.descricao,
          t.prioridade,
          t.atribuido_para,
          t.horario_limite,
          t.lembrete_vencimento_enviado,
          m.nome as mentorado_nome,
          t.mentorado_id,
          (NOW() AT TIME ZONE 'America/Sao_Paulo')::time as hora_atual,
          ((NOW() AT TIME ZONE 'America/Sao_Paulo')::time - INTERVAL '2 minutes')::time as janela_inicio,
          ((NOW() AT TIME ZONE 'America/Sao_Paulo')::time + INTERVAL '2 minutes')::time as janela_fim
        FROM tasks t
        LEFT JOIN mentorados m ON t.mentorado_id = m.id
        WHERE 
          t.status != 'concluido'
          AND t.status != 'cancelado'
          AND t.data_limite = CURRENT_DATE
          AND t.horario_limite IS NOT NULL
          AND t.lembrete_vencimento_enviado = FALSE
          AND t.horario_limite BETWEEN 
            ((NOW() AT TIME ZONE 'America/Sao_Paulo')::time - INTERVAL '2 minutes') 
            AND 
            ((NOW() AT TIME ZONE 'America/Sao_Paulo')::time + INTERVAL '2 minutes')
      `

      console.log(`[v0] Encontradas ${tasksVencidas.length} tasks vencidas`)
      if (tasksVencidas.length > 0) {
        console.log("[v0] Detalhes da primeira task vencida:", {
          id: tasksVencidas[0].id,
          horario_limite: tasksVencidas[0].horario_limite,
          hora_atual: tasksVencidas[0].hora_atual,
          janela_inicio: tasksVencidas[0].janela_inicio,
          janela_fim: tasksVencidas[0].janela_fim,
          lembrete_enviado: tasksVencidas[0].lembrete_vencimento_enviado,
        })
      }

      for (const task of tasksVencidas) {
        try {
          const horarioFormatado = task.horario_limite.substring(0, 5)
          const mensagem = formatarTaskVencida({
            titulo: task.titulo,
            descricao: task.descricao,
            prioridade: task.prioridade,
            atribuido_para: task.atribuido_para,
            mentorado_nome: task.mentorado_nome,
            horario: horarioFormatado,
          })

          console.log(`[v0] Enviando lembrete vencimento para task ${task.id}...`)
          const resultado = await sendWhatsAppMessage(NOTIFICATION_GROUP_ID, mensagem, "lembrete_task_vencida")
          console.log(`[v0] Resultado do envio: ${resultado.success ? "sucesso" : "erro"}`)

          await sql`
            INSERT INTO whatsapp_logs (telefone, mensagem, tipo, status, mentorado_id, enviado_por)
            VALUES (
              ${NOTIFICATION_GROUP_ID},
              ${mensagem},
              'lembrete_task_vencida',
              ${resultado.success ? "sucesso" : "erro"},
              ${task.mentorado_id || null},
              'sistema_automatico'
            )
          `

          await sql`
            UPDATE tasks
            SET lembrete_vencimento_enviado = TRUE
            WHERE id = ${task.id}
          `

          resultados.tasks_vencidas.push({
            id: task.id,
            titulo: task.titulo,
            sucesso: resultado.success,
          })
        } catch (error: any) {
          resultados.tasks_vencidas.push({
            id: task.id,
            titulo: task.titulo,
            sucesso: false,
            erro: error.message,
          })
        }
      }
    } catch (error: any) {
      console.error("[v0] Erro ao buscar tasks vencidas:", error.message)
    }

    const total =
      resultados.reunioes_30min.length +
      resultados.reunioes_agora.length +
      resultados.tasks_10min.length +
      resultados.tasks_vencidas.length

    return NextResponse.json({
      message: `Verificação concluída. ${total} lembretes processados.`,
      resultados,
    })
  } catch (error: any) {
    console.error("[v0] Erro ao verificar lembretes:", error.message)
    return NextResponse.json(
      {
        error: "Erro ao verificar lembretes",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
