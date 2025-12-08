// Configuração da Z-API
const ZAPI_CONFIG = {
  instanceId: "3EB605034006810864C082D554977C76",
  token: "949E614B58871AA0858B975F",
  clientToken: "F4e475885d6ba4f8c9f0f9bd4263bc640S",
  baseUrl: "https://api.z-api.io",
}

export const NOTIFICATION_GROUP_ID = "120363419470266629-group"

export interface WhatsAppMessage {
  phone: string
  message: string
}

export interface WhatsAppResponse {
  success: boolean
  messageId?: string
  error?: string
  response?: any
}

export function formatarDataHora(dataString: string, horario?: string): { data: string; horario: string } {
  try {
    let date: Date

    // Se tem horário separado, combina data + horário
    if (horario) {
      const [year, month, day] = dataString.split("-")
      const [hours, minutes] = horario.split(":")
      date = new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes))
    } else {
      date = new Date(dataString)
    }

    // Verifica se a data é válida
    if (isNaN(date.getTime())) {
      return { data: dataString, horario: horario || "" }
    }

    // Formata data: DD/MM/YYYY
    const dia = String(date.getDate()).padStart(2, "0")
    const mes = String(date.getMonth() + 1).padStart(2, "0")
    const ano = date.getFullYear()
    const dataFormatada = `${dia}/${mes}/${ano}`

    // Formata horário: HH:MM
    const horas = String(date.getHours()).padStart(2, "0")
    const minutos = String(date.getMinutes()).padStart(2, "0")
    const horarioFormatado = `${horas}:${minutos}`

    return { data: dataFormatada, horario: horarioFormatado }
  } catch (error) {
    console.error("[v0] Erro ao formatar data:", error)
    return { data: dataString, horario: horario || "" }
  }
}

export async function sendWhatsAppMessage(phone: string, message: string, tipo = "manual"): Promise<WhatsAppResponse> {
  try {
    console.log("[v0] =================================")
    console.log("[v0] INICIANDO ENVIO DE WHATSAPP")
    console.log("[v0] Destinatário:", phone)
    console.log("[v0] Tipo:", tipo)
    console.log("[v0] Mensagem:", message)

    const url = `${ZAPI_CONFIG.baseUrl}/instances/${ZAPI_CONFIG.instanceId}/token/${ZAPI_CONFIG.token}/send-text`

    const payload = {
      phone: phone,
      message: message,
    }

    console.log("[v0] URL da Z-API:", url)
    console.log("[v0] Payload:", JSON.stringify(payload, null, 2))

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Client-Token": ZAPI_CONFIG.clientToken,
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    console.log("[v0] Resposta da Z-API:")
    console.log("[v0] Status:", response.status)
    console.log("[v0] Data:", JSON.stringify(data, null, 2))
    console.log("[v0] =================================")

    if (!response.ok) {
      console.error("[v0] ERRO na Z-API:", data)
      return {
        success: false,
        error: data.message || "Erro ao enviar mensagem",
        response: data,
      }
    }

    return {
      success: true,
      messageId: data.messageId,
      response: data,
    }
  } catch (error: any) {
    console.error("[v0] EXCEÇÃO ao enviar WhatsApp:", error)
    return {
      success: false,
      error: error.message || "Erro desconhecido",
    }
  }
}

export function formatarMensagemReuniao(dados: {
  mentorado_nome: string
  titulo: string
  data: string
  horario: string
  meet_link?: string
}): string {
  const { mentorado_nome, titulo, data, horario, meet_link } = dados

  let mensagem = `🎯 *Nova Reunião Agendada*\n\n`
  mensagem += `👤 *Mentorado:* ${mentorado_nome}\n`
  mensagem += `📋 *Título:* ${titulo}\n`
  mensagem += `📅 *Data:* ${data}\n`
  mensagem += `⏰ *Horário:* ${horario}\n`

  if (meet_link) {
    mensagem += `\n🔗 *Link da Reunião:*\n${meet_link}`
  }

  return mensagem
}

export function formatarMensagemTask(dados: {
  titulo: string
  descricao?: string
  prioridade: string
  atribuido_para?: string
  mentorado_nome?: string
  data_limite?: string
  horario?: string
  checklist?: Array<{ texto: string; concluido: boolean }>
}): string {
  const { titulo, descricao, prioridade, atribuido_para, mentorado_nome, data_limite, horario, checklist } = dados

  const { data: dataFormatada, horario: horarioFormatado } = data_limite
    ? formatarDataHora(data_limite, horario)
    : { data: "", horario: "" }

  const emojiPrioridade = {
    urgente: "🔴",
    alta: "🟠",
    media: "🟡",
    baixa: "🟢",
  }

  let mensagem = `📋 *Nova Task Criada*\n\n`
  mensagem += `${emojiPrioridade[prioridade as keyof typeof emojiPrioridade] || "⚪"} *Prioridade:* ${prioridade.toUpperCase()}\n`
  mensagem += `📝 *Título:* ${titulo}\n`

  if (descricao) {
    mensagem += `📄 *Descrição:* ${descricao}\n`
  }

  if (atribuido_para) {
    mensagem += `👤 *Atribuído para:* ${atribuido_para}\n`
  }

  if (mentorado_nome) {
    mensagem += `🎯 *Mentorado:* ${mentorado_nome}\n`
  }

  if (dataFormatada) {
    mensagem += `📅 *Prazo:* ${dataFormatada}`
    if (horarioFormatado && horarioFormatado !== "00:00") {
      mensagem += ` às ${horarioFormatado}`
    }
    mensagem += `\n`
  }

  if (checklist && checklist.length > 0) {
    mensagem += `\n✅ *Checklist (${checklist.filter((item) => item.concluido).length}/${checklist.length}):*\n`
    checklist.forEach((item) => {
      const emoji = item.concluido ? "✅" : "⬜"
      mensagem += `${emoji} ${item.texto}\n`
    })
  }

  return mensagem
}

export function formatarMensagemMentorado(dados: {
  nome: string
  email: string
  empresa?: string
  telefone?: string
  fase_atual: string
}): string {
  const { nome, email, empresa, telefone, fase_atual } = dados

  let mensagem = `🎉 *Novo Mentorado Cadastrado*\n\n`
  mensagem += `👤 *Nome:* ${nome}\n`
  mensagem += `📧 *Email:* ${email}\n`

  if (empresa) {
    mensagem += `🏢 *Empresa:* ${empresa}\n`
  }

  if (telefone) {
    mensagem += `📱 *Telefone:* ${telefone}\n`
  }

  mensagem += `📊 *Fase Atual:* ${fase_atual}\n`

  return mensagem
}

export function formatarLembreteReuniao(dados: {
  mentorado_nome: string
  titulo: string
  horario: string
  meet_link?: string
  minutos: number
}): string {
  const { mentorado_nome, titulo, horario, meet_link, minutos } = dados

  let mensagem = `⏰ *Lembrete: Reunião em ${minutos} minutos!*\n\n`
  mensagem += `👤 *Mentorado:* ${mentorado_nome}\n`
  mensagem += `📋 *Título:* ${titulo}\n`
  mensagem += `⏰ *Horário:* ${horario}\n`

  if (meet_link) {
    mensagem += `\n🔗 *Link da Reunião:*\n${meet_link}`
  }

  return mensagem
}

export function formatarLembreteTask(dados: {
  titulo: string
  descricao?: string
  prioridade: string
  atribuido_para?: string
  mentorado_nome?: string
  horario: string
  minutos: number
}): string {
  const { titulo, descricao, prioridade, atribuido_para, mentorado_nome, horario, minutos } = dados
  const { horario: horarioFormatado } = formatarDataHora(horario)

  const emojiPrioridade = {
    urgente: "🔴",
    alta: "🟠",
    media: "🟡",
    baixa: "🟢",
  }

  let mensagem = `⏰ *Lembrete: Task vence em ${minutos} minutos!*\n\n`
  mensagem += `${emojiPrioridade[prioridade as keyof typeof emojiPrioridade] || "⚪"} *Prioridade:* ${prioridade.toUpperCase()}\n`
  mensagem += `📝 *Título:* ${titulo}\n`

  if (descricao) {
    mensagem += `📄 *Descrição:* ${descricao}\n`
  }

  if (atribuido_para) {
    mensagem += `👤 *Atribuído para:* ${atribuido_para}\n`
  }

  if (mentorado_nome) {
    mensagem += `🎯 *Mentorado:* ${mentorado_nome}\n`
  }

  mensagem += `⏰ *Horário limite:* ${horarioFormatado}\n`

  return mensagem
}

export function formatarTaskVencida(dados: {
  titulo: string
  descricao?: string
  prioridade: string
  atribuido_para?: string
  mentorado_nome?: string
  horario: string
}): string {
  const { titulo, descricao, prioridade, atribuido_para, mentorado_nome, horario } = dados
  const { horario: horarioFormatado } = formatarDataHora(horario)

  const emojiPrioridade = {
    urgente: "🔴",
    alta: "🟠",
    media: "🟡",
    baixa: "🟢",
  }

  let mensagem = `🚨 *ALERTA: Task vencendo AGORA!*\n\n`
  mensagem += `${emojiPrioridade[prioridade as keyof typeof emojiPrioridade] || "⚪"} *Prioridade:* ${prioridade.toUpperCase()}\n`
  mensagem += `📝 *Título:* ${titulo}\n`

  if (descricao) {
    mensagem += `📄 *Descrição:* ${descricao}\n`
  }

  if (atribuido_para) {
    mensagem += `👤 *Atribuído para:* ${atribuido_para}\n`
  }

  if (mentorado_nome) {
    mensagem += `🎯 *Mentorado:* ${mentorado_nome}\n`
  }

  mensagem += `⏰ *Horário limite:* ${horarioFormatado}\n`

  return mensagem
}

export function formatarReuniaoAgora(dados: {
  mentorado_nome: string
  titulo: string
  horario: string
  meet_link?: string
}): string {
  const { mentorado_nome, titulo, horario, meet_link } = dados

  let mensagem = `🚨 *AGORA: Reunião começando!*\n\n`
  mensagem += `👤 *Mentorado:* ${mentorado_nome}\n`
  mensagem += `📋 *Título:* ${titulo}\n`
  mensagem += `⏰ *Horário:* ${horario}\n`

  if (meet_link) {
    mensagem += `\n🔗 *Entre na reunião:*\n${meet_link}`
  }

  return mensagem
}

const STATUS_NOMES: Record<string, string> = {
  todo: "A Fazer",
  "em-progresso": "Em Progresso",
  em_progresso: "Em Progresso",
  EM_PROGRESSO: "Em Progresso",
  concluido: "Concluído",
  TODO: "A Fazer",
}

const ADMIN_NOMES: Record<string, string> = {
  "fellipe.otani12@gmail.com": "Fellipe",
  "admin@igamingrat.com": "Admin",
  // Adicione mais mapeamentos conforme necessário
}

export function getAdminNomePorEmail(email: string): string {
  return ADMIN_NOMES[email] || email.split("@")[0] || "Admin"
}

export function formatarComentarioTask(dados: {
  titulo: string
  descricao?: string
  autor: string
  autor_email?: string
  comentario: string
  mentorado_nome?: string
  data_limite?: string
  horario?: string
  checklist?: Array<{ texto: string; concluido: boolean }>
  temAnexos?: boolean
  mencionados?: string[]
}): string {
  const {
    titulo,
    descricao,
    autor,
    autor_email,
    comentario,
    mentorado_nome,
    data_limite,
    horario,
    checklist,
    temAnexos,
    mencionados,
  } = dados
  const nomeAutor = autor_email ? getAdminNomePorEmail(autor_email) : autor

  const { data: dataFormatada, horario: horarioFormatado } = data_limite
    ? formatarDataHora(data_limite, horario)
    : { data: "", horario: "" }

  let mensagem = `💬 *Novo Comentário em Task*\n\n`
  mensagem += `📝 *Task:* ${titulo}\n`

  if (descricao) {
    mensagem += `📄 *Descrição:* ${descricao}\n`
  }

  if (mentorado_nome) {
    mensagem += `🎯 *Mentorado:* ${mentorado_nome}\n`
  }

  if (dataFormatada) {
    mensagem += `📅 *Prazo:* ${dataFormatada}`
    if (horarioFormatado && horarioFormatado !== "00:00") {
      mensagem += ` às ${horarioFormatado}`
    }
    mensagem += `\n`
  }

  if (checklist && checklist.length > 0) {
    mensagem += `\n✅ *Checklist (${checklist.filter((item) => item.concluido).length}/${checklist.length}):*\n`
    checklist.forEach((item) => {
      const emoji = item.concluido ? "✅" : "⬜"
      mensagem += `${emoji} ${item.texto}\n`
    })
    mensagem += `\n`
  }

  mensagem += `👤 *Autor:* ${nomeAutor}\n`
  mensagem += `💭 *Comentário:* ${comentario}\n`

  if (temAnexos) {
    mensagem += `📎 *Contém anexos*\n`
  }

  if (mencionados && mencionados.length > 0) {
    mensagem += `\n🔔 *Mencionados:* ${mencionados.join(", ")}\n`
  }

  return mensagem
}

export function formatarAlteracaoStatusTask(dados: {
  titulo: string
  descricao?: string
  statusAnterior: string
  statusNovo: string
  atribuido_para?: string
  mentorado_nome?: string
  data_limite?: string
  horario?: string
  checklist?: Array<{ texto: string; concluido: boolean }>
}): string {
  const {
    titulo,
    descricao,
    statusAnterior,
    statusNovo,
    atribuido_para,
    mentorado_nome,
    data_limite,
    horario,
    checklist,
  } = dados

  const { data: dataFormatada, horario: horarioFormatado } = data_limite
    ? formatarDataHora(data_limite, horario)
    : { data: "", horario: "" }

  const emojiStatus: Record<string, string> = {
    todo: "📋",
    "a-fazer": "📋",
    "em-progresso": "⚙️",
    em_progresso: "⚙️",
    EM_PROGRESSO: "⚙️",
    concluido: "✅",
  }

  const nomeStatusAnterior = STATUS_NOMES[statusAnterior] || statusAnterior
  const nomeStatusNovo = STATUS_NOMES[statusNovo] || statusNovo

  let mensagem = `🔄 *Task: Alteração de Status*\n\n`
  mensagem += `📝 *Task:* ${titulo}\n`

  if (descricao) {
    mensagem += `📄 *Descrição:* ${descricao}\n`
  }

  if (mentorado_nome) {
    mensagem += `🎯 *Mentorado:* ${mentorado_nome}\n`
  }

  if (atribuido_para) {
    mensagem += `👤 *Atribuído para:* ${atribuido_para}\n`
  }

  if (dataFormatada) {
    mensagem += `📅 *Prazo:* ${dataFormatada}`
    if (horarioFormatado && horarioFormatado !== "00:00") {
      mensagem += ` às ${horarioFormatado}`
    }
    mensagem += `\n`
  }

  if (checklist && checklist.length > 0) {
    mensagem += `\n✅ *Checklist (${checklist.filter((item) => item.concluido).length}/${checklist.length}):*\n`
    checklist.forEach((item) => {
      const emoji = item.concluido ? "✅" : "⬜"
      mensagem += `${emoji} ${item.texto}\n`
    })
    mensagem += `\n`
  }

  mensagem += `\n${emojiStatus[statusAnterior.toLowerCase()] || "📋"} *De:* ${nomeStatusAnterior}\n`
  mensagem += `${emojiStatus[statusNovo.toLowerCase()] || "📋"} *Para:* ${nomeStatusNovo}\n`

  if (statusNovo === "concluido") {
    mensagem += `\n🎉 Parabéns pela conclusão!`
  }

  return mensagem
}

export function formatarEdicaoTask(dados: {
  titulo: string
  descricao?: string
  alteracoes: string[]
  atribuido_para?: string
  mentorado_nome?: string
  data_limite?: string
  horario?: string
  checklist?: Array<{ texto: string; concluido: boolean }>
}): string {
  const { titulo, descricao, alteracoes, atribuido_para, mentorado_nome, data_limite, horario, checklist } = dados

  const { data: dataFormatada, horario: horarioFormatado } = data_limite
    ? formatarDataHora(data_limite, horario)
    : { data: "", horario: "" }

  let mensagem = `✏️ *Task Editada*\n\n`
  mensagem += `📝 *Task:* ${titulo}\n`

  if (descricao) {
    mensagem += `📄 *Descrição:* ${descricao}\n`
  }

  if (mentorado_nome) {
    mensagem += `🎯 *Mentorado:* ${mentorado_nome}\n`
  }

  if (atribuido_para) {
    mensagem += `👤 *Atribuído para:* ${atribuido_para}\n`
  }

  if (dataFormatada) {
    mensagem += `📅 *Prazo:* ${dataFormatada}`
    if (horarioFormatado && horarioFormatado !== "00:00") {
      mensagem += ` às ${horarioFormatado}`
    }
    mensagem += `\n`
  }

  if (checklist && checklist.length > 0) {
    mensagem += `\n✅ *Checklist (${checklist.filter((item) => item.concluido).length}/${checklist.length}):*\n`
    checklist.forEach((item) => {
      const emoji = item.concluido ? "✅" : "⬜"
      mensagem += `${emoji} ${item.texto}\n`
    })
    mensagem += `\n`
  }

  mensagem += `\n*Alterações realizadas:*\n`
  alteracoes.forEach((alt, idx) => {
    mensagem += `${idx + 1}. ${alt}\n`
  })

  return mensagem
}
