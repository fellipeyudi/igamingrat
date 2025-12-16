"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, CheckSquare, User, Video, ExternalLink, AlertCircle } from "lucide-react"

interface Task {
  id: number
  titulo: string
  descricao?: string
  prioridade: string
  status: string
  data_limite?: string
  horario_limite?: string
  mentorado_nome?: string
  total_checklist?: number
  checklist_concluidos?: number
  admin_responsavel?: string
}

interface Meeting {
  id: number
  titulo: string
  mentorado_nome: string
  data: string
  horario: string
  status: string
  meet_link?: string
  admin_responsavel?: string
}

export default function MinhasDemandas({ adminEmail }: { adminEmail: string }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDemandas()
  }, [adminEmail])

  const loadDemandas = async () => {
    try {
      setError(null)
      const [tasksRes, meetingsRes] = await Promise.all([fetch("/api/admin/tasks"), fetch("/api/admin/meetings")])

      let minhasTasks: Task[] = []
      let minhasReunioes: Meeting[] = []

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json()
        const allTasks = tasksData.tasks || tasksData || []
        const adminNome = getAdminNome(adminEmail)

        minhasTasks = allTasks.filter(
          (task: Task) =>
            task.admin_responsavel === adminNome && task.status !== "concluido" && task.status !== "concluída",
        )
      }

      if (meetingsRes.ok) {
        const meetingsData = await meetingsRes.json()
        const allMeetings = meetingsData.meetings || meetingsData || []
        const adminNome = getAdminNome(adminEmail)

        minhasReunioes = allMeetings.filter(
          (meeting: Meeting) =>
            meeting.admin_responsavel === adminNome &&
            meeting.status !== "concluida" &&
            meeting.status !== "cancelada" &&
            new Date(meeting.data) >= new Date(new Date().setHours(0, 0, 0, 0)),
        )
      }

      setTasks(minhasTasks)
      setMeetings(minhasReunioes)
    } catch (error) {
      console.error("Erro ao carregar demandas:", error)
      setError("Erro ao carregar suas demandas. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const getAdminNome = (email: string): string => {
    const mapa: Record<string, string> = {
      "fellipe.otani12@gmail.com": "Fellipe Yudi",
      "admin@igamingrat.com": "Admin",
      "marcos@igamingrat.com": "Marcos Andrade",
    }
    return mapa[email] || email.split("@")[0]
  }

  const getPriorityColor = (prioridade: string) => {
    const cores: Record<string, string> = {
      urgente: "bg-red-500 text-white",
      alta: "bg-orange-500 text-white",
      media: "bg-yellow-500 text-white",
      baixa: "bg-green-500 text-white",
    }
    return cores[prioridade?.toLowerCase()] || "bg-gray-500 text-white"
  }

  const formatarData = (data: string, horario?: string) => {
    const dataObj = new Date(data)
    const hoje = new Date()
    const amanha = new Date(hoje)
    amanha.setDate(amanha.getDate() + 1)

    const dataFormatada = dataObj.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })

    if (dataObj.toDateString() === hoje.toDateString()) {
      return `Hoje${horario ? ` às ${horario.slice(0, 5)}` : ""}`
    } else if (dataObj.toDateString() === amanha.toDateString()) {
      return `Amanhã${horario ? ` às ${horario.slice(0, 5)}` : ""}`
    }

    return `${dataFormatada}${horario ? ` às ${horario.slice(0, 5)}` : ""}`
  }

  const isUrgente = (data?: string, horario?: string) => {
    if (!data) return false
    const agora = new Date()
    const prazo = new Date(data)

    if (horario) {
      const [h, m] = horario.split(":")
      prazo.setHours(Number.parseInt(h), Number.parseInt(m))
    }

    const diffHoras = (prazo.getTime() - agora.getTime()) / (1000 * 60 * 60)
    return diffHoras <= 24 && diffHoras > 0
  }

  const isAtrasado = (data?: string, horario?: string) => {
    if (!data) return false
    const agora = new Date()
    const prazo = new Date(data)

    if (horario) {
      const [h, m] = horario.split(":")
      prazo.setHours(Number.parseInt(h), Number.parseInt(m))
    }

    return prazo < agora
  }

  const tasksUrgentes = tasks.filter((t) => isAtrasado(t.data_limite, t.horario_limite))
  const tasksProximas = tasks.filter(
    (t) => !isAtrasado(t.data_limite, t.horario_limite) && isUrgente(t.data_limite, t.horario_limite),
  )
  const tasksNormais = tasks.filter(
    (t) => !isAtrasado(t.data_limite, t.horario_limite) && !isUrgente(t.data_limite, t.horario_limite),
  )

  const reunioesHoje = meetings
    .filter((m) => {
      const dataReuniao = new Date(m.data)
      const hoje = new Date()
      return dataReuniao.toDateString() === hoje.toDateString()
    })
    .sort((a, b) => a.horario.localeCompare(b.horario))

  const reunioesProximas = meetings
    .filter((m) => {
      const dataReuniao = new Date(m.data)
      const hoje = new Date()
      const dias7 = new Date(hoje)
      dias7.setDate(dias7.getDate() + 7)
      return dataReuniao > hoje && dataReuniao <= dias7 && dataReuniao.toDateString() !== hoje.toDateString()
    })
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())

  const reunioesFuturas = meetings
    .filter((m) => {
      const dataReuniao = new Date(m.data)
      const dias7 = new Date()
      dias7.setDate(dias7.getDate() + 7)
      return dataReuniao > dias7
    })
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Carregando suas demandas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
        <p className="text-red-800">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* TASKS */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <CheckSquare className="h-6 w-6" />
          Minhas Tasks
        </h3>

        {/* Tasks Atrasadas */}
        {tasksUrgentes.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-1 flex-1 bg-red-200 rounded" />
              <span className="text-sm font-semibold text-red-600">ATRASADAS ({tasksUrgentes.length})</span>
              <div className="h-1 flex-1 bg-red-200 rounded" />
            </div>
            {tasksUrgentes.map((task) => (
              <Card key={task.id} className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start gap-2">
                        <h4 className="font-semibold text-gray-900">{task.titulo}</h4>
                        <Badge className={getPriorityColor(task.prioridade)}>{task.prioridade}</Badge>
                      </div>
                      {task.descricao && <p className="text-sm text-gray-600 line-clamp-2">{task.descricao}</p>}
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        {task.mentorado_nome && (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {task.mentorado_nome}
                          </div>
                        )}
                        {task.data_limite && (
                          <div className="flex items-center gap-1 text-red-600 font-medium">
                            <Clock className="h-4 w-4" />
                            {formatarData(task.data_limite, task.horario_limite)}
                          </div>
                        )}
                        {task.total_checklist && task.total_checklist > 0 && (
                          <div className="flex items-center gap-2">
                            <CheckSquare className="h-4 w-4" />
                            <span>
                              {task.checklist_concluidos || 0}/{task.total_checklist}
                            </span>
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${((task.checklist_concluidos || 0) / task.total_checklist) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tasks Próximas do Prazo */}
        {tasksProximas.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-1 flex-1 bg-orange-200 rounded" />
              <span className="text-sm font-semibold text-orange-600">
                URGENTES - Próximo 24h ({tasksProximas.length})
              </span>
              <div className="h-1 flex-1 bg-orange-200 rounded" />
            </div>
            {tasksProximas.map((task) => (
              <Card
                key={task.id}
                className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start gap-2">
                        <h4 className="font-semibold text-gray-900">{task.titulo}</h4>
                        <Badge className={getPriorityColor(task.prioridade)}>{task.prioridade}</Badge>
                      </div>
                      {task.descricao && <p className="text-sm text-gray-600 line-clamp-2">{task.descricao}</p>}
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        {task.mentorado_nome && (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {task.mentorado_nome}
                          </div>
                        )}
                        {task.data_limite && (
                          <div className="flex items-center gap-1 text-orange-600 font-medium">
                            <Clock className="h-4 w-4" />
                            {formatarData(task.data_limite, task.horario_limite)}
                          </div>
                        )}
                        {task.total_checklist && task.total_checklist > 0 && (
                          <div className="flex items-center gap-2">
                            <CheckSquare className="h-4 w-4" />
                            <span>
                              {task.checklist_concluidos || 0}/{task.total_checklist}
                            </span>
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${((task.checklist_concluidos || 0) / task.total_checklist) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tasks Normais */}
        {tasksNormais.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-1 flex-1 bg-blue-200 rounded" />
              <span className="text-sm font-semibold text-blue-600">PENDENTES ({tasksNormais.length})</span>
              <div className="h-1 flex-1 bg-blue-200 rounded" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tasksNormais.map((task) => (
                <Card
                  key={task.id}
                  className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <h4 className="font-semibold text-gray-900 flex-1">{task.titulo}</h4>
                        <Badge className={getPriorityColor(task.prioridade)} className="text-xs">
                          {task.prioridade}
                        </Badge>
                      </div>
                      {task.descricao && <p className="text-sm text-gray-600 line-clamp-1">{task.descricao}</p>}
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        {task.mentorado_nome && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="text-xs">{task.mentorado_nome}</span>
                          </div>
                        )}
                        {task.data_limite && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span className="text-xs">{formatarData(task.data_limite, task.horario_limite)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {tasks.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              Nenhuma task atribuída a você no momento
            </CardContent>
          </Card>
        )}
      </div>

      {/* REUNIÕES */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Video className="h-6 w-6" />
          Minhas Reuniões
        </h3>

        {/* Reuniões Hoje */}
        {reunioesHoje.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-1 flex-1 bg-purple-200 rounded" />
              <span className="text-sm font-semibold text-purple-600">HOJE ({reunioesHoje.length})</span>
              <div className="h-1 flex-1 bg-purple-200 rounded" />
            </div>
            {reunioesHoje.map((meeting) => (
              <Card
                key={meeting.id}
                className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <h4 className="font-semibold text-gray-900">{meeting.titulo}</h4>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {meeting.mentorado_nome}
                        </div>
                        <div className="flex items-center gap-1 text-purple-600 font-medium">
                          <Clock className="h-4 w-4" />
                          {meeting.horario.slice(0, 5)}
                        </div>
                      </div>
                    </div>
                    {meeting.meet_link && (
                      <a
                        href={`https://${meeting.meet_link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Entrar
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Reuniões Próximas (7 dias) */}
        {reunioesProximas.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-1 flex-1 bg-indigo-200 rounded" />
              <span className="text-sm font-semibold text-indigo-600">PRÓXIMOS 7 DIAS ({reunioesProximas.length})</span>
              <div className="h-1 flex-1 bg-indigo-200 rounded" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {reunioesProximas.map((meeting) => (
                <Card
                  key={meeting.id}
                  className="border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900 text-sm">{meeting.titulo}</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span className="text-xs">{meeting.mentorado_nome}</span>
                        </div>
                        <div className="flex items-center gap-1 text-indigo-600 font-medium">
                          <Calendar className="h-3 w-3" />
                          <span className="text-xs">{formatarData(meeting.data, meeting.horario)}</span>
                        </div>
                      </div>
                      {meeting.meet_link && (
                        <a
                          href={`https://${meeting.meet_link}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-xs font-medium mt-2"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Link da reunião
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Reuniões Futuras */}
        {reunioesFuturas.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-1 flex-1 bg-gray-200 rounded" />
              <span className="text-sm font-semibold text-gray-600">FUTURAS ({reunioesFuturas.length})</span>
              <div className="h-1 flex-1 bg-gray-200 rounded" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {reunioesFuturas.map((meeting) => (
                <Card key={meeting.id} className="border shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-gray-900 text-xs line-clamp-2">{meeting.titulo}</h4>
                      <div className="space-y-0.5 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span className="truncate">{meeting.mentorado_nome}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatarData(meeting.data, meeting.horario)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {meetings.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">Nenhuma reunião agendada</CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
