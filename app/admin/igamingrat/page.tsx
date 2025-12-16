"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { loadAdmins, loadTasks } from "@/utils/admin-utils" // Import loadAdmins and loadTasks

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const [adminEmail, setAdminEmail] = useState<string>("")

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showCreateMeetingModal, setShowCreateMeetingModal] = useState(false)
  const [showEditMeetingModal, setShowEditMeetingModal] = useState(false)
  const [editingMentorado, setEditingMentorado] = useState<number | null>(null)
  const [expandedMentorado, setExpandedMentorado] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)

  const [mentorados, setMentorados] = useState([])
  const [meetings, setMeetings] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(false)
  const [loadingDate, setLoadingDate] = useState(false)
  const [logs, setLogs] = useState([])
  const [totalMeetings, setTotalMeetings] = useState(0)
  const [upcomingMeetings, setUpcomingMeetings] = useState(0)
  const [callsToday, setCallsToday] = useState(0)

  const [admins, setAdmins] = useState<any[]>([])

  const [completingMeeting, setCompletingMeeting] = useState<{
    id: number
    titulo: string
    data: string
    horario: string
  } | null>(null)
  const [completionData, setCompletionData] = useState({
    observacoes: "",
    data_realizacao: "",
    horario_realizacao: "",
  })

  const [editingMeeting, setEditingMeeting] = useState<any>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const [newMeeting, setNewMeeting] = useState({
    mentorado_id: "",
    data: "",
    horario: "",
    duracao: 30,
    titulo: "",
    meet_link: "",
    admin_id: "1",
    createCallPendente: false,
    callPendenteTitulo: "",
    callPendenteStatus: "A definir",
    status: "agendada",
    tipo: "mentoria",
    planejamento: "",
  })

  const [newMentorado, setNewMentorado] = useState({
    nome: "",
    empresa: "",
    email: "",
    telefone: "",
    fase: "Planejamento",
    progresso: 0,
    diasMentoria: 0,
    callsRealizadas: 0,
    modulosConcluidos: 0,
    anotacoes: "",
    proximosMarcos: [],
    conquistasRecentes: [],
  })

  const [editingData, setEditingData] = useState<any>({})
  const [activeTab, setActiveTab] = useState("geral")
  const [saving, setSaving] = useState(false)

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const [showInfo, setShowInfo] = useState<number | null>(null)

  // Mock data for time slots (replace with actual generation)
  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2)
    const minute = i % 2 === 0 ? "00" : "30"
    return `${String(hour).padStart(2, "0")}:${minute}`
  })

  const [mentoradoSearchTerm, setMentoradoSearchTerm] = useState("")

  const [avaliacoes, setAvaliacoes] = useState<any[]>([])
  const [loadingAvaliacoes, setLoadingAvaliacoes] = useState(true)

  const [tasks, setTasks] = useState<any[]>([])
  const [taskTags, setTaskTags] = useState<any[]>([])
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [showNewTaskModal, setShowNewTaskModal] = useState(false)
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [taskFilter, setTaskFilter] = useState("todas")
  const [taskSearchTerm, setTaskSearchTerm] = useState("")
  const [draggedTask, setDraggedTask] = useState<any>(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [newChecklistItem, setNewChecklistItem] = useState("")
  const [checklistItems, setChecklistItems] = useState<string[]>([])

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; task: any } | null>(null)
  const [showArchivedTasks, setShowArchivedTasks] = useState(false)

  const [commentModalOpen, setCommentModalOpen] = useState(false)
  const [selectedTaskForComment, setSelectedTaskForComment] = useState<any>(null)
  const [newComment, setNewComment] = useState("")
  const [commentFiles, setCommentFiles] = useState<File[]>([])
  const [mentionedAdmins, setMentionedAdmins] = useState<string[]>([])

  const [selectedTags, setSelectedTags] = useState<number[]>([]) // Added for task tag selection

  const [newTask, setNewTask] = useState({
    titulo: "",
    descricao: "",
    status: "todo",
    prioridade: "media",
    atribuido_para: "", // Changed to string to match the new select value
    admin_id: null as number | null, // Changed to admin_id
    mentorado_id: null as number | null,
    data_limite: "",
    tags: [] as number[],
    checklist: [] as { texto: string; concluido: boolean }[],
    comentarios: [] as { autor: string; comentario: string; created_at: string }[],
    total_checklist: 0,
    checklist_concluidos: 0,
    anexos: [] as { nome: string; data: string; tamanho: number }[],
    horario: "",
    arquivado: false, // Add archived status
  })

  const getDefaultTextsByPhase = (phase: string, nome = "mentorado") => {
    const phaseTexts = {
      Alinhamento: {
        cardConcluido: {
          titulo: "Concluído recentemente",
          texto: "Início da operação – definição de objetivos e alinhamento inicial.",
        },
        cardTrabalhando: {
          titulo: "Trabalhando agora",
          texto: "Alinhamento de expectativas, objetivos e início do processo de estruturação da operação.",
        },
        statusEmpresa: {
          estagio_atual: "Sua empresa está na fase de alinhamento estratégico.",
          proxima_fase: "Planejamento",
          proxima_fase_texto: "Definir claramente as ações e estratégicas para estruturar os primeiros passos.",
          acao_prioritaria: "Garantir clareza total dos objetivos e alinhar todas as expectativas.",
        },
        conquistasRecentes: [{ titulo: "Início da operação – definição de objetivos e alinhamento inicial." }],
        proximosMarcos: [{ titulo: "Planejamento" }],
      },
      Planejamento: {
        cardConcluido: {
          titulo: "Concluído recentemente",
          texto: "Alinhamento finalizado – expectativas e estratégias totalmente definidas.",
        },
        cardTrabalhando: {
          titulo: "Trabalhando agora",
          texto: "Planejamento operacional – o que deve ser feito e como deve ser feito.",
        },
        statusEmpresa: {
          estagio_atual: "Sua empresa está realizando o planejamento da operação.",
          proxima_fase: "Estruturação",
          proxima_fase_texto: "Estruturar toda a contingência, a base da operação e iniciar as campanhas.",
          acao_prioritaria: "Planejar toda a operação com 100% dos interesses alinhados ao cliente.",
        },
        conquistasRecentes: [{ titulo: "Alinhamento finalizado – expectativas e estratégias totalmente definidas." }],
        proximosMarcos: [{ titulo: "Estruturação" }],
      },
      Estruturação: {
        cardConcluido: {
          titulo: "Concluído recentemente",
          texto: "Planejamento concluído com objetivos e rotas definidos.",
        },
        cardTrabalhando: {
          titulo: "Trabalhando agora",
          texto: "Estruturação da operação – construção de processos, sistemas e fluxos de execução.",
        },
        statusEmpresa: {
          estagio_atual: "Sua empresa está estruturando a operação e criando uma base sólida para crescimento.",
          proxima_fase: "Otimização",
          proxima_fase_texto: "Ajustar e refinar processos, corrigindo gargalos e aumentando eficiência.",
          acao_prioritaria: "Colocar em prática toda a estrutura definida, garantindo funcionalidade em cada etapa.",
        },
        conquistasRecentes: [{ titulo: "Planejamento concluído com objetivos e rotas definidos." }],
        proximosMarcos: [{ titulo: "Otimização" }],
      },
      Otimização: {
        cardConcluido: {
          titulo: "Concluído recentemente",
          texto: "Estruturação concluída – processos e sistemas já implementados.",
        },
        cardTrabalhando: {
          titulo: "Trabalhando agora",
          texto: "Otimização dos processos – ajustes finos, análise de métricas e melhorias constantes.",
        },
        statusEmpresa: {
          estagio_atual: "Sua empresa está otimizando fluxos para reduzir erros e maximizar resultados.",
          proxima_fase: "Escala",
          proxima_fase_texto: "Expandir a operação para atingir novos patamares de resultado.",
          acao_prioritaria: "Monitorar métricas e implementar melhorias contínuas com foco em performance.",
        },
        conquistasRecentes: [{ titulo: "Estruturação concluída – processos e sistemas já implementados." }],
        proximosMarcos: [{ titulo: "Escala" }],
      },
      Escala: {
        cardConcluido: {
          titulo: "Concluído recentemente",
          texto: "Otimização finalizada com processos refinados e operando em alta eficiência.",
        },
        cardTrabalhando: {
          titulo: "Trabalhando agora",
          texto: "Escalando a operação – expansão de mercado, aumento de investimentos e alavancagem de resultados.",
        },
        statusEmpresa: {
          estagio_atual: "Sua empresa está em fase de escala, ampliando alcance e potencial de faturamento.",
          proxima_fase: "Consolidação",
          proxima_fase_texto: "Fortalecer a marca, solidificar processos e criar bases de longo prazo.",
          acao_prioritaria: "Expandir de forma estratégica e sustentável, garantindo consistência no crescimento.",
        },
        conquistasRecentes: [
          { titulo: "Otimização finalizada com processos refinados e operando em alta eficiência." },
        ],
        proximosMarcos: [{ titulo: "Consolidação" }],
      },
    }

    return phaseTexts[phase] || phaseTexts["Alinhamento"]
  }

  const loadMentorados = async () => {
    try {
      const response = await fetch("/api/mentorado")
      if (response.ok) {
        const data = await response.json()
        const formattedData = data.map((m: any) => ({
          id: m.id,
          slug: m.slug,
          nome: m.nome,
          empresa: m.empresa || "Empresa não informada",
          fase_atual: m.fase_atual || "Estruturação", // Changed from fase to fase_atual
          progresso: m.progresso || 65,
          proximaCall: "A definir",
          status: "ativo",
          diasMentoria: m.dias_mentoria || 0,
          callsRealizadas: m.calls_realizadas || 0,
          modulosConcluidos: m.modulos_concluidos || 0,
          avatar: m.nome
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase(),
          email: m.email,
          telefone: m.telefone || "Não informado",
          comentarios: m.comentarios || "Mentorado cadastrado no sistema", // Changed from anotacoes to comentarios
          proximosMarcos: ["Definir objetivos", "Primeira call"],
          conquistasRecentes: ["Cadastro realizado"],
          saudacao: `👋 Olá, ${m.nome}!`,
          subtitulo: "Acompanhe seu progresso na mentoria empresarial",
          created_at: m.created_at,
        }))
        setMentorados(formattedData)
      }
    } catch (error) {
      console.error("[v0] Erro ao carregar mentorados:", error)
    }
  }

  const loadPersonalizacao = async (slug: string) => {
    try {
      const response = await fetch(`/api/mentorado/${slug}`)
      if (response.ok) {
        const data = await response.json()
        setEditingData({
          conquistasRecentes: data.conquistas_recentes || [],
          proximosMarcos: data.proximos_marcos || [],
          anotacoesMentoria: data.anotacoes_mentoria || [],
          statusEmpresa: data.status_empresa || {},
          agendaMentoria: data.agenda_mentoria || {},
          cardConcluido: data.card_concluido || { titulo: "Concluído recentemente", texto: "" },
          cardTrabalhando: data.card_trabalhando || { titulo: "Trabalhando agora", texto: "" },
          stepperConfig: data.stepper_config || [],
          callPendente: data.call_pendente || { titulo: "", status: "A definir" },
          saudacao: data.saudacao || `👋 Olá, ${data.nome}!`,
          subtitulo: data.subtitulo || "Acompanhe seu progresso na mentoria",
          faseAtual: data.fase_atual || "Estruturação",
          progresso: data.progresso || 65,
          callsRealizadas: data.calls_realizadas || 0,
          modulosConcluidos: data.modulos_concluidos || 0,
          diasMentoria: data.dias_mentoria || 0,
        })
      }
    } catch (error) {
      console.error("[v0] Erro ao carregar personalização:", error)
    }
  }

  const handleSavePersonalizacao = async (mentorado: any) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/mentorado/${mentorado.slug}/personalizacao`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingData),
      })

      if (response.ok) {
        alert("Personalização salva com sucesso!")
        await loadMentorados()
        setEditingMentorado(null)
      } else {
        alert("Erro ao salvar personalização")
      }
    } catch (error) {
      console.error("[v0] Erro ao salvar:", error)
      alert("Erro ao salvar personalização")
    } finally {
      setSaving(false)
    }
  }

  const handleEditMentorado = (mentorado: any) => {
    if (editingMentorado === mentorado.id) {
      setEditingMentorado(null)
      setEditingData({})
    } else {
      setEditingMentorado(mentorado.id)
      loadPersonalizacao(mentorado.slug)
      setActiveTab("geral")
    }
  }

  const filteredMentorados = mentorados.filter((mentorado) => {
    const searchLower = mentoradoSearchTerm.toLowerCase()
    return mentorado.nome.toLowerCase().includes(searchLower) || mentorado.empresa.toLowerCase().includes(searchLower)
  })

  const getStatusColor = (fase: string) => {
    switch (fase) {
      case "Planejamento":
        return "bg-gray-100 text-gray-800"
      case "Análise":
        return "bg-blue-100 text-blue-800"
      case "Estruturação":
        return "bg-yellow-100 text-yellow-800"
      case "Operação":
        return "bg-green-100 text-green-800"
      case "Crescimento":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getProgressColor = (progresso: number) => {
    if (progresso >= 80) return "bg-green-600"
    if (progresso >= 60) return "bg-blue-600"
    if (progresso >= 40) return "bg-yellow-600"
    return "bg-gray-400"
  }

  useEffect(() => {
    const email = localStorage.getItem("admin_email") || "fellipe.otani12@gmail.com"
    setAdminEmail(email)

    const token = localStorage.getItem("admin_token")
    // const adminEmail = localStorage.getItem("admin_email") // REMOVED: already fetched and set above

    if (!token || !email) {
      // Changed from !adminEmail to !email
      router.push("/admin/igamingrat/login")
      return
    }

    setIsAuthenticated(true)
    // REMOVED: loadMentorados() and loadMeetings() from here, they are now called in the main useEffect below
    // loadMeetingsMetrics() // Load metrics on initial load
    setLoading(false)
  }, [router])

  // Combined fetch function for mentorados and meetings
  const fetchMentoradosAndMeetings = async () => {
    if (isAuthenticated) {
      await loadMentorados()
      await loadMeetings()
    }
  }

  // Fetch logs when the logs section is active
  const fetchLogs = async () => {
    try {
      const response = await fetch("/api/admin/logs")
      const data = await response.json()
      setLogs(data.logs || [])
    } catch (error) {
      console.error("[v0] Erro ao buscar logs:", error)
    }
  }

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null)
    if (contextMenu) {
      document.addEventListener("click", handleClickOutside)
      return () => document.removeEventListener("click", handleClickOutside)
    }
  }, [contextMenu])

  useEffect(() => {
    const fetchAdmins = async () => {
      const adminsList = await loadAdmins()
      setAdmins(adminsList)
    }

    const fetchTasks = async () => {
      if (activeSection === "tasks") {
        const tasksList = await loadTasks()
        setTasks(tasksList.tasks || [])
        setTaskTags(tasksList.tags || [])
      }
    }

    fetchAdmins()
    loadMentorados()
    loadMeetings()
    loadMeetingsMetrics()
    fetchTasks()
  }, [activeSection])

  useEffect(() => {
    if (activeSection === "logs" && isAuthenticated) {
      fetchLogs() // Fetch logs when the logs tab is active
    }
  }, [activeSection, isAuthenticated])

  useEffect(() => {
    if (activeSection === "avaliacoes" && isAuthenticated) {
      const fetchAvaliacoes = async () => {
        try {
          setLoadingAvaliacoes(true)
          const response = await fetch("/api/admin/avaliacoes")
          if (response.ok) {
            const data = await response.json()
            setAvaliacoes(data.avaliacoes || [])
          }
        } catch (error) {
          console.error("Erro ao carregar avaliações:", error)
        } finally {
          setLoadingAvaliacoes(false)
        }
      }
      fetchAvaliacoes()
    }
  }, [activeSection, isAuthenticated])

  useEffect(() => {
    if (activeSection === "agenda") {
      loadMeetingsMetrics()
    }
  }, [activeSection, selectedDate])

  const loadMeetingsMetrics = async () => {
    try {
      const response = await fetch("/api/admin/meetings")
      if (response.ok) {
        const allMeetings = await response.json()

        // Total de todas as reuniões
        setTotalMeetings(allMeetings.length)

        const year = selectedDate.getFullYear()
        const month = selectedDate.getMonth()
        const day = selectedDate.getDate()

        const selectedDateMeetings = allMeetings.filter((meeting: any) => {
          if (!meeting.data) return false
          const meetingDate = new Date(meeting.data + "T00:00:00")
          return meetingDate.getFullYear() === year && meetingDate.getMonth() === month && meetingDate.getDate() === day
        })
        setCallsToday(selectedDateMeetings.length)

        const today = new Date()
        const todayYear = today.getFullYear()
        const todayMonth = today.getMonth()
        const todayDay = today.getDate()
        const currentTime = today.getHours() * 60 + today.getMinutes() // Current time in minutes

        const upcomingTodayMeetings = allMeetings.filter((meeting: any) => {
          if (!meeting.data || !meeting.horario) return false

          const meetingDate = new Date(meeting.data + "T00:00:00")
          const isToday =
            meetingDate.getFullYear() === todayYear &&
            meetingDate.getMonth() === todayMonth &&
            meetingDate.getDate() === todayDay

          if (!isToday) return false

          // Check if status is not completed or cancelled
          if (meeting.status === "concluida" || meeting.status === "cancelada") return false

          // Parse meeting time (format: "HH:MM:SS" or "HH:MM")
          const [hours, minutes] = meeting.horario.split(":").map(Number)
          const meetingTimeInMinutes = hours * 60 + minutes

          // Only include meetings that haven't started yet or are happening now
          return meetingTimeInMinutes >= currentTime
        })
        setUpcomingMeetings(upcomingTodayMeetings.length)
      }
    } catch (error) {
      console.error("Erro ao carregar métricas:", error)
    }
  }

  useEffect(() => {
    if (isAuthenticated && activeSection === "agenda") {
      loadMeetings()
      loadMeetingsMetrics() // Also load metrics when agenda section becomes active
    }
  }, [selectedDate, isAuthenticated, activeSection])

  useEffect(() => {
    const loadMeetingsForDate = async () => {
      setIsLoadingMeetings(true)
      await loadMeetings()
      setTimeout(() => setIsLoadingMeetings(false), 300)
    }
    loadMeetingsForDate()
  }, [selectedDate])

  const loadMeetings = async () => {
    try {
      setLoadingDate(true)
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0")
      const day = String(selectedDate.getDate()).padStart(2, "0")
      const dateStr = `${year}-${month}-${day}`

      console.log("[v0] Data selecionada no admin:", selectedDate)
      console.log("[v0] String de data enviada para API:", dateStr)

      const response = await fetch(`/api/admin/meetings?date=${dateStr}`)
      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Reuniões recebidas da API:", data)
        console.log("[v0] Primeira reunião - data:", data[0]?.data, "horário:", data[0]?.horario)

        // Fetch admin names to enrich meeting data
        const adminsResponse = await fetch("/api/admin/list")
        const adminsData = await adminsResponse.json()
        const adminMap = new Map(adminsData.map((admin: any) => [admin.id, admin.nome]))

        const enrichedMeetings = data.map((meeting: any) => ({
          ...meeting,
          mentorado_nome: mentorados.find((m: any) => m.id === meeting.mentorado_id)?.nome || "Mentorado desconhecido",
          admin_nome: adminMap.get(meeting.admin_id) || "Admin desconhecido",
          link_meet: meeting.meet_link || null, // Ensure link_meet is present and non-null if available
        }))

        setMeetings(enrichedMeetings)
        console.log("[v0] Estado meetings após setMeetings:", enrichedMeetings.length, "reuniões")

        // CHANGED: removed setTodayMeetings, callsToday is updated in loadMeetingsMetrics
        // setTodayMeetings(data.length)
      }
    } catch (error) {
      console.error("Erro ao carregar reuniões:", error)
    } finally {
      setLoadingDate(false)
    }
  }

  const getMeetingSlotSpan = (meeting: any) => {
    const durationMinutes = meeting.duracao || 60
    return Math.ceil(durationMinutes / 30)
  }

  const isSlotOccupiedByPreviousMeeting = (timeSlot: string, meetings: any[]) => {
    return meetings.some((meeting) => {
      const meetingStart = meeting.horario.substring(0, 5)
      const [startHour, startMin] = meetingStart.split(":").map(Number)
      const startInMinutes = startHour * 60 + startMin
      const endInMinutes = startInMinutes + (meeting.duracao || 60)

      const [currentHour, currentMin] = timeSlot.split(":").map(Number)
      const currentInMinutes = currentHour * 60 + currentMin

      // Este slot está ocupado se estiver entre o início e fim da reunião (mas não é o início)
      return currentInMinutes > startInMinutes && currentInMinutes < endInMinutes
    })
  }

  const handleCreateMeeting = async () => {
    try {
      setCreating(true)
      const response = await fetch("/api/admin/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMeeting),
      })

      if (response.ok) {
        setShowCreateMeetingModal(false)
        setNewMeeting({
          mentorado_id: "",
          data: "",
          horario: "",
          duracao: 30,
          titulo: "",
          meet_link: "",
          admin_id: "1", // Reset admin_id to default
          createCallPendente: false,
          callPendenteTitulo: "",
          callPendenteStatus: "A definir",
          status: "agendada",
          tipo: "mentoria",
          planejamento: "", // Reset planejamento field
        })
        loadMeetings()
        loadMentorados()
        loadMeetingsMetrics() // Update metrics after creating a meeting
      } else {
        const error = await response.text()
        alert(`Erro ao criar reunião: ${error}`)
      }
    } catch (error) {
      console.error("Erro ao criar reunião:", error)
      alert("Erro ao criar reunião")
    } finally {
      setCreating(false)
    }
  }

  const handleUpdateMeeting = async () => {
    if (!editingMeeting) return
    try {
      setSaving(true) // Use saving state for consistency
      const response = await fetch(`/api/admin/meetings/${editingMeeting.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingMeeting),
      })

      if (response.ok) {
        setShowEditMeetingModal(false)
        setEditingMeeting(null)
        loadMeetings()
        loadMentorados()
        loadMeetingsMetrics()
      } else {
        alert("Erro ao atualizar reunião")
      }
    } catch (error) {
      console.error("Erro ao atualizar reunião:", error)
      alert("Erro ao atualizar reunião")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteMeeting = async (meetingId: number) => {
    if (!confirm("Tem certeza que deseja excluir esta reunião?")) return

    try {
      const response = await fetch(`/api/admin/meetings/${meetingId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        loadMeetings()
        loadMentorados()
        loadMeetingsMetrics() // Update metrics after deleting a meeting
      } else {
        alert("Erro ao excluir reunião")
      }
    } catch (error) {
      console.error("Erro ao excluir reunião:", error)
      alert("Erro ao excluir reunião")
    }
  }

  const handleCompleteMeeting = async (meeting: any) => {
    // Abre o modal com os dados da reunião
    setCompletingMeeting({
      id: meeting.id,
      titulo: meeting.titulo,
      data: meeting.data,
      horario: meeting.horario,
    })

    // Pré-preenche com data/horário agendado
    setCompletionData({
      observacoes: meeting.observacoes || "", // Pre-fill observations if any
      data_realizacao: meeting.data_realizacao ? meeting.data_realizacao.split("T")[0] : meeting.data, // Handle potential ISO format
      horario_realizacao: meeting.data_realizacao
        ? meeting.data_realizacao.split("T")[1].substring(0, 5)
        : meeting.horario, // Handle potential ISO format
    })
  }

  const handleSaveCompletion = async () => {
    if (!completingMeeting) return

    try {
      const response = await fetch(`/api/admin/meetings/${completingMeeting.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "concluida",
          observacoes: completionData.observacoes,
          data_realizacao: `${completionData.data_realizacao} ${completionData.horario_realizacao}`,
          admin_id: 1, // Enviar ID do admin logado (placeholder)
        }),
      })

      if (response.ok) {
        setCompletingMeeting(null)
        setCompletionData({ observacoes: "", data_realizacao: "", horario_realizacao: "" })
        await loadMeetings()
        await loadMentorados()
        await loadMeetingsMetrics()
      } else {
        alert("Erro ao marcar reunião como concluída")
      }
    } catch (error) {
      console.error("Erro ao marcar reunião como concluída:", error)
      alert("Erro ao marcar reunião como concluída")
    }
  }

  // Function to mark a meeting as completed with observations
  const handleMarkAsCompleted = async (meetingId: number) => {
    const meetingToComplete = meetings.find((m: any) => m.id === meetingId)
    if (!meetingToComplete) return

    setCompletingMeeting({
      id: meetingToComplete.id,
      titulo: meetingToComplete.titulo,
      data: meetingToComplete.data,
      horario: meetingToComplete.horario,
    })

    // Pre-fill with scheduled date and time if not already set, or use actual completion data if available
    setCompletionData({
      observacoes: meetingToComplete.observacoes || "",
      data_realizacao: meetingToComplete.data_realizacao
        ? meetingToComplete.data_realizacao.split("T")[0]
        : meetingToComplete.data,
      horario_realizacao: meetingToComplete.data_realizacao
        ? meetingToComplete.data_realizacao.split("T")[1].substring(0, 5)
        : meetingToComplete.horario,
    })
  }

  // Function to get meetings for a specific slot, considering duration
  const getMeetingsForSlot = (slot: string) => {
    const slotStartMinutes = Number.parseInt(slot.split(":")[0]) * 60 + Number.parseInt(slot.split(":")[1])
    return meetings.filter((meeting) => {
      const meetingStart = meeting.horario.substring(0, 5)
      const [startHour, startMin] = meetingStart.split(":").map(Number)
      const startInMinutes = startHour * 60 + startMin
      const endInMinutes = startInMinutes + (meeting.duracao || 60)

      return slotStartMinutes >= startInMinutes && slotStartMinutes < endInMinutes
    })
  }

  const loggedInAdmin = { id: 1, nome: "Admin Name" } // Placeholder for loggedInAdmin

  return <div>{/* Dashboard content here */}</div>
}
