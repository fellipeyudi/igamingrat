"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, CheckSquare, User, AlertTriangle } from "lucide-react"

interface Task {
  id: number
  titulo: string
  descricao?: string
  prioridade: string
  status: string
  data_limite?: string
  horario?: string
  mentorado_nome?: string
  total_checklist: number
  checklist_concluidos: number
}

interface Meeting {
  id: number
  titulo: string
  mentorado_nome: string
  data: string
  horario: string
  status: string
}

export default function MinhasDemandas({ adminEmail }: { adminEmail: string }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDemandas()
  }, [adminEmail])

  const loadDemandas = async () => {
    try {
      const [tasksRes, meetingsRes] = await Promise.all([fetch("/api/admin/tasks"), fetch("/api/admin/meetings")])

      if (tasksRes.ok && meetingsRes.ok) {
        const tasksData = await tasksRes.json()
        const meetingsData = await meetingsRes.json()

        // Filtrar tasks atribuídas ao admin logado
        const minhasTasks = tasksData.tasks.filter((task: Task) => task.atribuido_para === getAdminNome(adminEmail))

        setTasks(minhasTasks)
        setMeetings(meetingsData.meetings || [])
      }
    } catch (error) {
      console.error("Erro ao carregar demandas:", error)
    } finally {
      setLoading(false)
    }
  }

  const getAdminNome = (email: string): string => {
    const mapa: Record<string, string> = {
      "fellipe.otani12@gmail.com": "Fellipe Yudi",
      "admin@igamingrat.com": "Admin",
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
    return cores[prioridade] || "bg-gray-500 text-white"
  }

  const isVencendo = (data_limite?: string, horario?: string) => {
    if (!data_limite) return false
    const agora = new Date()
    const [year, month, day] = data_limite.split("-")
    const dataLimite = new Date(Number(year), Number(month) - 1, Number(day))

    if (horario) {
      const [hours, minutes] = horario.split(":")
      dataLimite.setHours(Number(hours), Number(minutes))
    }

    const diferencaHoras = (dataLimite.getTime() - agora.getTime()) / (1000 * 60 * 60)
    return diferencaHoras > 0 && diferencaHoras <= 24
  }

  const isVencida = (data_limite?: string, horario?: string) => {
    if (!data_limite) return false
    const agora = new Date()
    const [year, month, day] = data_limite.split("-")
    const dataLimite = new Date(Number(year), Number(month) - 1, Number(day))

    if (horario) {
      const [hours, minutes] = horario.split(":")
      dataLimite.setHours(Number(hours), Number(minutes))
    }

    return dataLimite < agora
  }

  const tasksVencendo = tasks.filter(
    (task) => task.status !== "concluido" && isVencendo(task.data_limite, task.horario),
  )
  const tasksVencidas = tasks.filter((task) => task.status !== "concluido" && isVencida(task.data_limite, task.horario))
  const tasksEmAndamento = tasks.filter((task) => task.status === "em_progresso" || task.status === "em-progresso")

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Alertas */}
      {tasksVencidas.length > 0 && (
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Tasks Vencidas ({tasksVencidas.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tasksVencidas.map((task) => (
              <div key={task.id} className="p-3 bg-red-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{task.titulo}</h4>
                    {task.descricao && <p className="text-sm text-gray-600 mt-1">{task.descricao}</p>}
                  </div>
                  <Badge className={getPriorityColor(task.prioridade)}>{task.prioridade}</Badge>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                  {task.mentorado_nome && (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {task.mentorado_nome}
                    </span>
                  )}
                  {task.data_limite && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(task.data_limite).toLocaleDateString()}
                      {task.horario && ` às ${task.horario}`}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {tasksVencendo.length > 0 && (
        <Card className="border-orange-500">
          <CardHeader>
            <CardTitle className="text-orange-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Tasks Vencendo (próximas 24h) ({tasksVencendo.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tasksVencendo.map((task) => (
              <div key={task.id} className="p-3 bg-orange-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{task.titulo}</h4>
                    {task.descricao && <p className="text-sm text-gray-600 mt-1">{task.descricao}</p>}
                  </div>
                  <Badge className={getPriorityColor(task.prioridade)}>{task.prioridade}</Badge>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                  {task.mentorado_nome && (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {task.mentorado_nome}
                    </span>
                  )}
                  {task.data_limite && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(task.data_limite).toLocaleDateString()}
                      {task.horario && ` às ${task.horario}`}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Tasks em Andamento */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks em Andamento ({tasksEmAndamento.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {tasksEmAndamento.length === 0 ? (
            <p className="text-gray-500 text-sm">Nenhuma task em andamento</p>
          ) : (
            tasksEmAndamento.map((task) => (
              <div key={task.id} className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{task.titulo}</h4>
                    {task.descricao && <p className="text-sm text-gray-600 mt-1">{task.descricao}</p>}
                  </div>
                  <Badge className={getPriorityColor(task.prioridade)}>{task.prioridade}</Badge>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                  {task.mentorado_nome && (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {task.mentorado_nome}
                    </span>
                  )}
                  {task.total_checklist > 0 && (
                    <span className="flex items-center gap-1">
                      <CheckSquare className="h-3 w-3" />
                      {task.checklist_concluidos}/{task.total_checklist}
                    </span>
                  )}
                  {task.data_limite && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(task.data_limite).toLocaleDateString()}
                      {task.horario && ` às ${task.horario}`}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Minhas Reuniões */}
      <Card>
        <CardHeader>
          <CardTitle>Minhas Próximas Reuniões ({meetings.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {meetings.length === 0 ? (
            <p className="text-gray-500 text-sm">Nenhuma reunião agendada</p>
          ) : (
            meetings.slice(0, 5).map((meeting) => (
              <div key={meeting.id} className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900">{meeting.titulo}</h4>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {meeting.mentorado_nome}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(meeting.data).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {meeting.horario}
                  </span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Todas as Minhas Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Minhas Tasks ({tasks.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {tasks.length === 0 ? (
            <p className="text-gray-500 text-sm">Nenhuma task atribuída a você</p>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{task.titulo}</h4>
                    {task.descricao && <p className="text-sm text-gray-600 mt-1">{task.descricao}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(task.prioridade)}>{task.prioridade}</Badge>
                    <Badge variant="outline">{task.status}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                  {task.mentorado_nome && (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {task.mentorado_nome}
                    </span>
                  )}
                  {task.data_limite && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(task.data_limite).toLocaleDateString()}
                      {task.horario && ` às ${task.horario}`}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
