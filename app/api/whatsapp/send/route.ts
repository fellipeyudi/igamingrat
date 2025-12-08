import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { sendWhatsAppMessage } from "@/lib/whatsapp"

const sql = neon(
  "postgresql://neondb_owner:npg_TNMj2X4HrqEw@ep-misty-mode-acoot3dc-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
)

export async function POST(request: NextRequest) {
  try {
    const { telefone, mensagem, tipo, reuniao_id, mentorado_id } = await request.json()

    if (!telefone || !mensagem) {
      return NextResponse.json({ error: "Telefone e mensagem são obrigatórios" }, { status: 400 })
    }

    const adminEmail = request.headers.get("x-admin-email") || "sistema"

    console.log("[v0] Enviando mensagem WhatsApp:", {
      telefone,
      tipo,
      reuniao_id,
      mentorado_id,
      adminEmail,
    })

    // Criar log inicial
    const logInicial = await sql`
      INSERT INTO whatsapp_logs (telefone, mensagem, tipo, status, reuniao_id, mentorado_id, enviado_por)
      VALUES (
        ${telefone},
        ${mensagem},
        ${tipo || "manual"},
        'enviando',
        ${reuniao_id || null},
        ${mentorado_id || null},
        ${adminEmail}
      )
      RETURNING id
    `

    const logId = logInicial[0].id

    // Enviar mensagem via Z-API
    const resultado = await sendWhatsAppMessage(telefone, mensagem)

    // Atualizar log com resultado
    await sql`
      UPDATE whatsapp_logs
      SET 
        status = ${resultado.success ? "sucesso" : "erro"},
        response_data = ${JSON.stringify(resultado.response || {})},
        error_message = ${resultado.error || null}
      WHERE id = ${logId}
    `

    console.log("[v0] Mensagem WhatsApp processada:", {
      logId,
      success: resultado.success,
      messageId: resultado.messageId,
    })

    if (!resultado.success) {
      return NextResponse.json(
        {
          error: resultado.error,
          logId,
          details: resultado.response,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      messageId: resultado.messageId,
      logId,
      message: "Mensagem enviada com sucesso",
    })
  } catch (error: any) {
    console.error("[v0] Erro ao processar envio de mensagem:", error)
    return NextResponse.json({ error: error.message || "Erro interno do servidor" }, { status: 500 })
  }
}
