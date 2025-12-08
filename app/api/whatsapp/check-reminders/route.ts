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

const sql = neon(
  "postgresql://neondb_owner:npg_TNMj2X4HrqEw@ep-misty-mode-acoot3dc-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
)

export async function GET() {
  try {
    console.log("[v0] ==========================================")
    console.log("[v0] VERIFICANDO LEMBRETES DE CALLS E TASKS")
    console.log("[v0] ==========================================")

    const now = new Date()
    const brasiliaTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }))
    console.log("[v0] Hora atual UTC:", now.toISOString())
    console.log("[v0] Hora atual Brasília:", brasiliaTime.toISOString())

    const resultados = {
      reunioes_30min: [] as any[],
      reunioes_agora: [] as any[],
      tasks_10min: [] as any[],
      tasks_vencidas: [] as any[],
    }

    // Verificar reuniões 30min antes
    try {
      console.log("[v0] Buscando reuniões para lembrete de 30 minutos...")
      const reunioes30min = await sql`
        SELECT 
          r.id,
          r.titulo,
          r.horario,
          r.data,
          r.meet_link,
          m.nome as mentorado_nome,
          r.mentorado_id
        FROM reunioes r
        JOIN mentorados m ON r.mentorado_id = m.id
        WHERE 
          r.status = 'agendada'
          AND DATE(r.data) = CURRENT_DATE
          AND r.lembrete_30min_enviado = FALSE
          AND r.horario::time BETWEEN 
            ((CURRENT_TIME AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') + INTERVAL '25 minutes') 
            AND 
            ((CURRENT_TIME AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') + INTERVAL '35 minutes')
      `

      console.log(`[v0] Reuniões para lembrete 30min encontradas: ${reunioes30min.length}`)
      console.log(`[v0] Hora atual do servidor (UTC): ${new Date().toISOString()}`)
      console.log(`[v0] CURRENT_TIME no banco: será usado para comparação`)

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

          const resultado = await sendWhatsAppMessage(NOTIFICATION_GROUP_ID, mensagem, "lembrete_reuniao_30min")

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

          console.log(`[v0] Lembrete 30min enviado para reunião ${reuniao.id}:`, resultado.success)
        } catch (error: any) {
          console.error(`[v0] Erro ao enviar lembrete 30min reunião ${reuniao.id}:`, error.message)
          resultados.reunioes_30min.push({
            id: reuniao.id,
            titulo: reuniao.titulo,
            sucesso: false,
            erro: error.message,
          })
        }
      }
    } catch (error: any) {
      console.error("[v0] Erro ao buscar reuniões 30min:", error.message, error.stack)
    }

    // Verificar reuniões começando agora
    try {
      console.log("[v0] Buscando reuniões começando agora...")
      const reunioesAgora = await sql`
        SELECT 
          r.id,
          r.titulo,
          r.horario,
          r.data,
          r.meet_link,
          m.nome as mentorado_nome,
          r.mentorado_id
        FROM reunioes r
        JOIN mentorados m ON r.mentorado_id = m.id
        WHERE 
          r.status = 'agendada'
          AND DATE(r.data) = CURRENT_DATE
          AND r.lembrete_inicio_enviado = FALSE
          AND r.horario::time BETWEEN 
            ((CURRENT_TIME AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') - INTERVAL '2 minutes') 
            AND 
            ((CURRENT_TIME AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') + INTERVAL '2 minutes')
      `

      console.log(`[v0] Reuniões começando agora: ${reunioesAgora.length}`)

      for (const reuniao of reunioesAgora) {
        try {
          const horarioFormatado = reuniao.horario.substring(0, 5)
          const mensagem = formatarReuniaoAgora({
            mentorado_nome: reuniao.mentorado_nome,
            titulo: reuniao.titulo,
            horario: horarioFormatado,
            meet_link: reuniao.meet_link,
          })

          const resultado = await sendWhatsAppMessage(NOTIFICATION_GROUP_ID, mensagem, "lembrete_reuniao_agora")

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

          console.log(`[v0] Lembrete AGORA enviado para reunião ${reuniao.id}:`, resultado.success)
        } catch (error: any) {
          console.error(`[v0] Erro ao enviar lembrete AGORA reunião ${reuniao.id}:`, error.message)
          resultados.reunioes_agora.push({
            id: reuniao.id,
            titulo: reuniao.titulo,
            sucesso: false,
            erro: error.message,
          })
        }
      }
    } catch (error: any) {
      console.error("[v0] Erro ao buscar reuniões agora:", error.message, error.stack)
    }

    // Verificar tasks 10min antes
    try {
      console.log("[v0] Buscando tasks para lembrete de 10 minutos...")
      const tasks10min = await sql`
        SELECT 
          t.id,
          t.titulo,
          t.descricao,
          t.prioridade,
          t.atribuido_para,
          t.horario_limite,
          m.nome as mentorado_nome,
          t.mentorado_id
        FROM tasks t
        LEFT JOIN mentorados m ON t.mentorado_id = m.id
        WHERE 
          t.status != 'concluido'
          AND t.status != 'cancelado'
          AND t.data_limite = CURRENT_DATE
          AND t.horario_limite IS NOT NULL
          AND t.lembrete_10min_enviado = FALSE
          AND t.horario_limite BETWEEN 
            ((CURRENT_TIME AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') + INTERVAL '5 minutes') 
            AND 
            ((CURRENT_TIME AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') + INTERVAL '15 minutes')
      `

      console.log(`[v0] Tasks para lembrete 10min: ${tasks10min.length}`)

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

          const resultado = await sendWhatsAppMessage(NOTIFICATION_GROUP_ID, mensagem, "lembrete_task_10min")

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

          console.log(`[v0] Lembrete 10min enviado para task ${task.id}:`, resultado.success)
        } catch (error: any) {
          console.error(`[v0] Erro ao enviar lembrete 10min task ${task.id}:`, error.message)
          resultados.tasks_10min.push({
            id: task.id,
            titulo: task.titulo,
            sucesso: false,
            erro: error.message,
          })
        }
      }
    } catch (error: any) {
      console.error("[v0] Erro ao buscar tasks 10min:", error.message, error.stack)
    }

    // Verificar tasks vencidas
    try {
      console.log("[v0] Buscando tasks vencendo agora...")
      const tasksVencidas = await sql`
        SELECT 
          t.id,
          t.titulo,
          t.descricao,
          t.prioridade,
          t.atribuido_para,
          t.horario_limite,
          m.nome as mentorado_nome,
          t.mentorado_id
        FROM tasks t
        LEFT JOIN mentorados m ON t.mentorado_id = m.id
        WHERE 
          t.status != 'concluido'
          AND t.status != 'cancelado'
          AND t.data_limite = CURRENT_DATE
          AND t.horario_limite IS NOT NULL
          AND t.lembrete_vencimento_enviado = FALSE
          AND t.horario_limite BETWEEN 
            ((CURRENT_TIME AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') - INTERVAL '2 minutes') 
            AND 
            ((CURRENT_TIME AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') + INTERVAL '2 minutes')
      `

      console.log(`[v0] Tasks vencendo agora: ${tasksVencidas.length}`)

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

          const resultado = await sendWhatsAppMessage(NOTIFICATION_GROUP_ID, mensagem, "lembrete_task_vencida")

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

          console.log(`[v0] Alerta de vencimento enviado para task ${task.id}:`, resultado.success)
        } catch (error: any) {
          console.error(`[v0] Erro ao enviar alerta de vencimento task ${task.id}:`, error.message)
          resultados.tasks_vencidas.push({
            id: task.id,
            titulo: task.titulo,
            sucesso: false,
            erro: error.message,
          })
        }
      }
    } catch (error: any) {
      console.error("[v0] Erro ao buscar tasks vencidas:", error.message, error.stack)
    }

    console.log("[v0] ==========================================")
    console.log("[v0] VERIFICAÇÃO DE LEMBRETES CONCLUÍDA")
    console.log("[v0] ==========================================")

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
    console.error("[v0] Erro CRÍTICO ao verificar lembretes:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    })
    return NextResponse.json(
      {
        error: "Erro ao verificar lembretes",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
