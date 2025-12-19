"use client"

import { DialogFooter } from "@/components/ui/dialog"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Users,
  Plus,
  Search,
  Calendar,
  MessageSquare,
  Eye,
  X,
  Edit,
  ChevronDown,
  Trash2,
  Copy,
  Clock,
  Home,
  ChevronLeft,
  ChevronRight,
  Menu,
  TrendingUp,
  Phone,
  Mail,
  FileText,
  Loader2,
  Info,
  Pencil,
  Check,
  Star,
  CheckSquare,
  Tag,
  AlertCircle,
  CheckCircle,
  User,
  UserCheck,
  Upload,
  Paperclip,
  Download,
  Send,
  Archive,
  Edit2,
  BookOpen,
  ArrowUp,
  ArrowDown,
  Play,
  ArrowLeft,
  Bell,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card" // Added CardTitle
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns" // Added date-fns for formatting
import { ptBR } from "date-fns/locale" // Added ptBR locale for date-fns
import { Badge } from "@/components/ui/badge" // Added Badge for Avaliações
import { Label } from "@/components/ui/label" // Added Label for Task form
import WhatsAppTest from "@/components/whatsapp-test"
import MinhasDemandas from "@/components/minhas-demandas"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription, // Added DialogDescription
} from "@/components/ui/dialog" // Import Dialog components

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
    anotacoes: "",
  })

  const [editingData, setEditingData] = useState<any>({})
  const [activeTab, setActiveTab] = useState("geral")
  const [saving, setSaving] = useState(false)

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const [aulas, setAulas] = useState<any[]>([])
  const [loadingAulas, setLoadingAulas] = useState(false)
  const [showCreateAulaModal, setShowCreateAulaModal] = useState(false)
  const [editingAula, setEditingAula] = useState<any>(null)
  const [showEditAulaModal, setShowEditAulaModal] = useState(false)
  const [newAula, setNewAula] = useState({
    titulo: "",
    descricao: "",
    duracao: "60",
    modulo: "",
    ordem: "1",
    videoUrl: "",
    capaUrl: "",
    objetivosAprendizado: [],
    sobreAula: "",
    materiaisComplementares: [],
    status: "rascunho",
  })
  const [materialInput, setMaterialInput] = useState("")
  const [objetivoInput, setObjetivoInput] = useState("")

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

  const [comentarios, setComentarios] = useState<any[]>([])
  const [loadingComentarios, setLoadingComentarios] = useState(false)
  const [selectedAulaComentarios, setSelectedAulaComentarios] = useState<any>(null)

  useEffect(() => {
    if (activeSection === "comentarios") {
      loadComentarios()
    }
  }, [activeSection])

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
          status: m.status || "ativo", // Usando o status do backend
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
    loadAdmins()
    if (activeSection === "tasks") {
      loadTasks()
    }
    if (activeSection === "aulas") {
      loadAulas()
    }
  }, [activeSection])

  useEffect(() => {
    fetchMentoradosAndMeetings()
  }, [isAuthenticated])

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
    if (activeSection === "agenda") {
      loadMeetingsMetrics()
    }
  }, [activeSection, selectedDate])

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
      const meetingStartMinutes =
        Number.parseInt(meeting.horario.split(":")[0]) * 60 + Number.parseInt(meeting.horario.split(":")[1])
      const meetingEndMinutes = meetingStartMinutes + meeting.duracao
      const meetingEndTime = `${String(Math.floor(meetingEndMinutes / 60)).padStart(2, "0")}:${String(meetingEndMinutes % 60).padStart(2, "0")}`

      // Check if the current slot's start time falls within the meeting's duration
      return slot >= meeting.horario.slice(0, 5) && slot < meetingEndTime
    })
  }

  // CHANGE: Nova função para gerar slots dinâmicos baseados nas reuniões reais
  const generateDynamicTimeSlots = () => {
    const slots = new Set<string>()

    // Adicionar todos os horários fixos de 30 em 30 minutos
    for (let hour = 0; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        slots.add(time)
      }
    }

    // Adicionar horários específicos das reuniões que existem
    meetings.forEach((meeting) => {
      const meetingTime = meeting.horario.slice(0, 5) // Pega apenas HH:MM
      slots.add(meetingTime)
    })

    // Converter para array e ordenar
    return Array.from(slots).sort()
  }

  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 0; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`

        const isOccupied = meetings.some((meeting) => {
          try {
            if (!meeting.data) {
              return false
            }

            // Extrair apenas a data da string ISO, ignorando timezone
            const meetingDateStr = meeting.data.split("T")[0]
            const year = selectedDate.getFullYear()
            const month = String(selectedDate.getMonth() + 1).padStart(2, "0")
            const day = String(selectedDate.getDate()).padStart(2, "0")
            const selectedDateStr = `${year}-${month}-${day}`

            if (meetingDateStr !== selectedDateStr) {
              return false
            }

            // Calcular horário de início e fim da reunião existente
            const meetingStartTime = new Date(`2000-01-01T${meeting.horario}`)
            const meetingEndTime = new Date(meetingStartTime.getTime() + (meeting.duracao || 60) * 60000)

            // Calcular horário do slot atual
            const slotTime = new Date(`2000-01-01T${time}:00`)

            // Verificar se o slot está dentro do período da reunião
            return slotTime >= meetingStartTime && slotTime < meetingEndTime
          } catch (error) {
            console.log("[v0] Erro ao processar data da reunião:", error, meeting)
            return false
          }
        })

        slots.push({ time, isOccupied })
      }
    }
    return slots
  }

  const getAvailableTimeSlots = () => {
    // Retornar todos os horários de 07:00 às 22:00, permitindo múltiplas reuniões
    const allSlots = []
    for (let hour = 7; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        allSlots.push(time)
      }
    }
    return allSlots
  }

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1))
    setSelectedDate(newDate)
  }

  const handleLogout = () => {
    localStorage.removeItem("admin_token")
    localStorage.removeItem("admin_email") // Added to clear email as well
    router.push("/admin/igamingrat/login")
  }

  const handleCreateMentorado = async () => {
    if (!newMentorado.nome || !newMentorado.empresa || !newMentorado.email) {
      alert("Nome, empresa e email são obrigatórios")
      return
    }

    setCreating(true)

    try {
      const slug = newMentorado.nome
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")

      const adminEmail = typeof window !== "undefined" ? localStorage.getItem("admin_email") : null

      const response = await fetch("/api/mentorado", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": adminEmail || "sistema",
        },
        body: JSON.stringify({
          nome: newMentorado.nome,
          email: newMentorado.email,
          senha: Math.random().toString(36).slice(-8), // Gera senha automática
          slug: slug,
          empresa: newMentorado.empresa,
          telefone: newMentorado.telefone,
          comentarios: newMentorado.anotacoes,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        console.log("[v0] Mentorado criado com sucesso:", result)
        await loadMentorados()

        setNewMentorado({
          nome: "",
          empresa: "",
          email: "",
          telefone: "",
          anotacoes: "",
        })

        setShowCreateModal(false)
        alert("Mentorado criado com sucesso!")
      } else {
        alert(`Erro ao criar mentorado: ${result.error}`)
      }
    } catch (error) {
      console.error("[v0] Erro ao criar mentorado:", error)
      alert("Erro ao criar mentorado")
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteMentorado = async (mentoradoId: number) => {
    if (!confirm("Tem certeza que deseja excluir este mentorado? Esta ação não pode ser desfeita.")) {
      return
    }

    try {
      const apiUrl = `/api/mentorado/id/${mentoradoId}`
      console.log("[v0] Tentando excluir mentorado ID:", mentoradoId)
      console.log("[v0] URL construída:", apiUrl)
      console.log("[v0] Base URL:", window.location.origin)
      console.log("[v0] Full URL:", window.location.origin + apiUrl)

      // Test if API route exists first
      console.log("[v0] Testando se API route existe...")
      const testResponse = await fetch(apiUrl, {
        method: "OPTIONS",
      })
      console.log("[v0] OPTIONS response status:", testResponse.status)
      console.log("[v0] OPTIONS response headers:", Object.fromEntries(testResponse.headers.entries()))

      const response = await fetch(apiUrl, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("[v0] DELETE Response status:", response.status)
      console.log("[v0] DELETE Response headers:", Object.fromEntries(response.headers.entries()))
      console.log("[v0] DELETE Response URL:", response.url)

      // Verificar se a resposta é JSON válido
      const contentType = response.headers.get("content-type")
      console.log("[v0] Content-Type:", contentType)

      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text()
        console.error("[v0] Resposta não é JSON:", textResponse.substring(0, 500))
        console.error("[v0] Response status text:", response.statusText)
        alert("Erro: A API retornou uma resposta inválida (HTML ao invés de JSON)")
        return
      }

      const result = await response.json()
      console.log("[v0] Response data:", result)

      if (response.ok) {
        setMentorados(mentorados.filter((m) => m.id !== mentoradoId))
        alert("Mentorado excluído com sucesso!")
      } else {
        console.error("[v0] Erro na resposta:", result)
        alert(`Erro ao excluir mentorado: ${result.error || "Erro desconhecido"}`)
      }
    } catch (error) {
      console.error("[v0] Erro ao excluir mentorado:", error)
      alert(`Erro ao excluir mentorado: ${error instanceof Error ? error.message : "Erro desconhecido"}`)
    }
  }

  const handleCopyLink = async (slug: string) => {
    const link = `https://alunos.igamingrat.com/${slug}`
    try {
      await navigator.clipboard.writeText(link)
      alert("Link copiado para a área de transferência!")
    } catch (err) {
      console.error("Erro ao copiar link:", err)
      alert("Erro ao copiar link")
    }
  }

  // Função para carregar admins
  const loadAdmins = async () => {
    try {
      const response = await fetch("/api/admin/list")
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          setAdmins(data)
        }
      }
    } catch (error) {
      console.error("Erro ao carregar admins:", error)
    }
  }

  const loadTasks = async () => {
    try {
      setLoadingTasks(true)
      const response = await fetch("/api/admin/tasks")
      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks || [])
        setTaskTags(data.tags || [])
      }
    } catch (error) {
      console.error("Erro ao carregar tasks:", error)
    } finally {
      setLoadingTasks(false)
    }
  }

  const loadAulas = async () => {
    try {
      setLoadingAulas(true)
      const response = await fetch("/api/admin/aulas")
      if (response.ok) {
        const data = await response.json()
        setAulas(data.aulas || [])
      }
    } catch (error) {
      console.error("Erro ao carregar aulas:", error)
    } finally {
      setLoadingAulas(false)
    }
  }

  const handleCreateTask = async () => {
    if (!newTask.titulo.trim()) {
      alert("O título é obrigatório")
      return
    }

    // Find admin ID based on selected admin name
    const selectedAdmin = admins.find((a) => a.nome === newTask.atribuido_para)
    const adminId = selectedAdmin ? selectedAdmin.id : null

    try {
      const response = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newTask,
          admin_id: adminId, // Use the found admin ID
          criado_por: localStorage.getItem("admin_email") || "Admin",
          tags: newTask.tags,
          total_checklist: newTask.checklist.length,
          checklist_concluidos: newTask.checklist.filter((item) => item.concluido).length,
        }),
      })

      if (response.ok) {
        setShowNewTaskModal(false)
        setNewTask({
          titulo: "",
          descricao: "",
          status: "todo",
          prioridade: "media",
          atribuido_para: "", // Reset to empty string
          admin_id: null,
          mentorado_id: null,
          data_limite: "",
          tags: [],
          checklist: [],
          comentarios: [],
          total_checklist: 0,
          checklist_concluidos: 0,
          anexos: [],
          horario: "",
          arquivado: false, // Reset archived status
        })
        setNewChecklistItem("")
        setSelectedTags([]) // Reset selected tags
        loadTasks()
      } else {
        alert("Erro ao criar task")
      }
    } catch (error) {
      console.error("Erro ao criar task:", error)
      alert("Erro ao criar task")
    }
  }

  const handleUpdateTaskStatus = async (taskId: number, status: string) => {
    try {
      const response = await fetch(`/api/admin/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        loadTasks()
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
    }
  }

  const handleToggleChecklistItem = async (taskId: number, itemIndex: number) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task || !task.checklist) return

    const updatedChecklist = task.checklist.map((item: any, index: number) => {
      if (index === itemIndex) {
        return { ...item, concluido: !item.concluido }
      }
      return item
    })

    try {
      const response = await fetch(`/api/admin/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checklist: updatedChecklist }),
      })

      if (response.ok) {
        setSelectedTask({
          ...task,
          checklist: updatedChecklist,
          checklist_concluidos: updatedChecklist.filter((item: any) => item.concluido).length,
        })
        loadTasks()
      }
    } catch (error) {
      console.error("Erro ao atualizar checklist:", error)
    }
  }

  const openCommentModal = (task: any) => {
    setSelectedTaskForComment(task)
    setCommentModalOpen(true)
    setNewComment("")
    setCommentFiles([])
    setMentionedAdmins([])
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedTaskForComment) return

    try {
      console.log("[v0] Enviando comentário para task:", selectedTaskForComment.id)

      // Processar arquivos para base64
      const anexos = await Promise.all(
        commentFiles.map(async (file) => {
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.readAsDataURL(file)
          })
          return {
            nome: file.name,
            data_base64: base64,
            tamanho: file.size,
          }
        }),
      )

      const response = await fetch(`/api/admin/tasks/${selectedTaskForComment.id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          autor: localStorage.getItem("admin_name") || "Admin",
          autor_email: localStorage.getItem("admin_email") || "",
          comentario: newComment,
          mencoes: mentionedAdmins,
          anexos: anexos,
        }),
      })

      if (response.ok) {
        console.log("[v0] Comentário enviado com sucesso")
        setNewComment("")
        setCommentFiles([])
        setMentionedAdmins([])
        setCommentModalOpen(false)
        await loadTasks()
      } else {
        const errorData = await response.json()
        console.error("[v0] Erro ao enviar comentário:", errorData)
        alert("Erro ao enviar comentário: " + (errorData.error || "Erro desconhecido"))
      }
    } catch (error) {
      console.error("[v0] Erro ao adicionar comentário:", error)
      alert("Erro ao adicionar comentário: " + error)
    }
  }

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm("Tem certeza que deseja deletar esta task?")) return

    try {
      const response = await fetch(`/api/admin/tasks/${taskId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setShowTaskDetailModal(false)
        setSelectedTask(null)
        loadTasks()
      }
    } catch (error) {
      console.error("Erro ao deletar task:", error)
      alert("Erro ao deletar task")
    }
  }

  const handleFileUpload = async (taskId: number, file: File) => {
    try {
      setUploadingFile(true)

      // Convert file to base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64Data = reader.result as string

        const anexo = {
          nome: file.name,
          data: base64Data,
          tamanho: file.size,
        }

        const response = await fetch(`/api/admin/tasks/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            anexos: [...(selectedTask?.anexos || []), anexo],
          }),
        })

        if (response.ok) {
          await loadTasks()
          // Atualizar o selectedTask com os novos anexos
          const updatedTasks = await fetch("/api/admin/tasks").then((r) => r.json())
          const updatedTask = updatedTasks.tasks.find((t: any) => t.id === taskId)
          if (updatedTask) {
            setSelectedTask(updatedTask)
          }
          alert("Arquivo enviado com sucesso!")
        } else {
          alert("Erro ao enviar arquivo")
        }
      }

      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Erro ao fazer upload:", error)
      alert("Erro ao enviar arquivo")
    } finally {
      setUploadingFile(false)
    }
  }

  // Render Avaliações Section
  const renderAvaliacoes = () => {
    if (loadingAvaliacoes) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando avaliações...</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Avaliações de Satisfação</h2>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {avaliacoes.length} Avaliações
          </Badge>
        </div>

        {avaliacoes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma avaliação recebida ainda</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {avaliacoes.map((avaliacao) => (
              <Card key={avaliacao.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{avaliacao.mentorado_nome}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        Empresa: {avaliacao.empresa} | Data:{" "}
                        {new Date(avaliacao.data_avaliacao).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="text-2xl font-bold text-gray-900">{avaliacao.satisfacao_geral}/5</span>
                      </div>
                      <Badge
                        variant={
                          avaliacao.recomendaria_mentoria >= 9
                            ? "default"
                            : avaliacao.recomendaria_mentoria >= 7
                              ? "secondary"
                              : "destructive"
                        }
                        className="text-sm"
                      >
                        NPS: {avaliacao.recomendaria_mentoria}/10
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Métricas */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-blue-600 font-medium mb-1">Calls</p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: avaliacao.qualidade_calls }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs text-green-600 font-medium mb-1">Suporte</p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: avaliacao.qualidade_suporte }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-xs text-purple-600 font-medium mb-1">Entregáveis</p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: avaliacao.quality_entregaveis }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3">
                      <p className="text-xs text-orange-600 font-medium mb-1">Comunicação</p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: avaliacao.clareza_comunicacao }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <div className="bg-pink-50 rounded-lg p-3">
                      <p className="text-xs text-pink-600 font-medium mb-1">Conteúdo</p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: avaliacao.utilidade_conteudo }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Faturamento */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Faturamento Atual</p>
                      <p className="text-lg font-bold text-gray-900">{avaliacao.faturamento_atual}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Meta (3 meses)</p>
                      <p className="text-lg font-bold text-gray-900">{avaliacao.meta_faturamento}</p>
                    </div>
                  </div>

                  {/* Feedback */}
                  <div className="space-y-4">
                    {avaliacao.maior_conquista && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">🏆 Maior Conquista</p>
                        <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg">{avaliacao.maior_conquista}</p>
                      </div>
                    )}

                    {avaliacao.principal_desafio && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">⚠️ Principal Desafio</p>
                        <p className="text-sm text-gray-600 bg-orange-50 p-3 rounded-lg">
                          {avaliacao.principal_desafio}
                        </p>
                      </div>
                    )}

                    {avaliacao.expectativas_atendidas && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">✅ Expectativas</p>
                        <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                          {avaliacao.expectativas_atendidas}
                        </p>
                      </div>
                    )}

                    {avaliacao.sugestoes_melhoria && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">💡 Sugestões de Melhoria</p>
                        <p className="text-sm text-gray-600 bg-purple-50 p-3 rounded-lg">
                          {avaliacao.sugestoes_melhoria}
                        </p>
                      </div>
                    )}

                    {avaliacao.proximo_objetivo && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">🎯 Próximo Objetivo</p>
                        <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
                          {avaliacao.proximo_objetivo}
                        </p>
                      </div>
                    )}

                    {avaliacao.feedback_adicional && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">💬 Feedback Adicional</p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {avaliacao.feedback_adicional}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Info Operacional */}
                  <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Tempo de Resposta Suporte</p>
                      <p className="text-sm font-medium text-gray-900">{avaliacao.tempo_resposta_suporte}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Frequência Ideal de Calls</p>
                      <p className="text-sm font-medium text-gray-900">{avaliacao.frequencia_calls_ideal}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Render Sidebar (Updated)
  const renderSidebar = () => (
    <div
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out ${
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">iR</span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Admin Panel</h2>
            <p className="text-xs text-gray-600">iGaming Rat</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-2">
        <button
          onClick={() => {
            setActiveSection("dashboard")
            setIsMobileMenuOpen(false)
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
            activeSection === "dashboard"
              ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Home className="h-5 w-5" />
          Dashboard
        </button>

        <button
          onClick={() => {
            setActiveSection("agenda")
            setIsMobileMenuOpen(false)
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
            activeSection === "agenda"
              ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Calendar className="h-5 w-5" />
          Agenda
        </button>

        {/* rest of code here */}

        <button
          onClick={() => {
            setActiveSection("avaliacoes")
            setIsMobileMenuOpen(false)
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
            activeSection === "avaliacoes"
              ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Star className="h-5 w-5" />
          Avaliações
        </button>

        <button
          onClick={() => {
            setActiveSection("tasks")
            setIsMobileMenuOpen(false)
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
            activeSection === "tasks"
              ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <CheckSquare className="h-5 w-5" />
          Tasks
        </button>

        {/* Adicionando botão de WhatsApp na sidebar após Tasks */}
        <button
          onClick={() => {
            setActiveSection("whatsapp")
            setIsMobileMenuOpen(false)
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
            activeSection === "whatsapp"
              ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <MessageSquare className="h-5 w-5" />
          WhatsApp
        </button>

        <button
          onClick={() => {
            setActiveSection("aulas")
            setIsMobileMenuOpen(false)
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
            activeSection === "aulas"
              ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <BookOpen className="h-5 w-5" />
          Aulas
        </button>

        {/* Adicionar botão de Comentários na sidebar */}
        <button
          onClick={() => {
            setActiveSection("comentarios")
            setIsMobileMenuOpen(false)
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
            activeSection === "comentarios"
              ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <MessageSquare className="h-5 w-5" />
          Comentários
        </button>

        <button
          onClick={() => setActiveSection("minhas-demandas")}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            activeSection === "minhas-demandas" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <CheckSquare className="h-5 w-5" />
          Minhas Demandas
        </button>
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <Button variant="outline" onClick={handleLogout} className="w-full text-red-600 border-red-200 bg-transparent">
          Sair
        </Button>
      </div>
    </div>
  )

  const renderAgendaSection = () => {
    const filteredMeetings = meetings

    console.log("[v0] Renderizando agenda - Total de reuniões:", meetings.length)
    console.log(
      "[v0] Reuniões para hoje:",
      meetings.map((m) => ({
        id: m.id,
        horario: m.horario,
        duracao: m.duracao,
        data: m.data,
      })),
    )

    // CHANGE: Usar slots dinâmicos ao invés de timeSlots fixos
    const dynamicTimeSlots = generateDynamicTimeSlots()

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-col sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Sistema de Agenda</h1>
            <p className="text-gray-600 text-sm sm:text-base">
              {selectedDate.toLocaleDateString("pt-BR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                timeZone: "America/Sao_Paulo",
              })}
            </p>
          </div>
          <Button onClick={() => setShowCreateMeetingModal(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nova Reunião
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reuniões Hoje</p>
                {/* CHANGED: Using callsToday to display meetings for the selected date, as todayMeetings was removed */}
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{callsToday}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Reuniões</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{totalMeetings}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Horários Livres</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {generateTimeSlots().filter((slot) => !slot.isOccupied).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Próximas Hoje</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{upcomingMeetings}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg">Agenda do Dia</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Date navigation */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousDay}
                  className="h-8 w-8 p-0 bg-transparent"
                  disabled={isLoadingMeetings}
                  title="Dia anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToday}
                  className="h-8 px-3 text-xs font-medium bg-transparent"
                  disabled={isLoadingMeetings}
                  title="Voltar para hoje"
                >
                  Hoje
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextDay}
                  className="h-8 w-8 p-0 bg-transparent"
                  disabled={isLoadingMeetings}
                  title="Próximo dia"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Legend */}
              <div className="hidden lg:flex items-center gap-3 border-l pl-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-gray-600"></div>
                  <span className="text-xs text-gray-600">Admin</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-blue-500"></div>
                  <span className="text-xs text-gray-600">Fellipe</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-orange-500"></div>
                  <span className="text-xs text-gray-600">Luiddy</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingMeetings ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="max-h-[600px] overflow-y-auto">
                <div className="divide-y divide-gray-100">
                  {/* CHANGE: Usar dynamicTimeSlots ao invés de timeSlots fixos */}
                  {dynamicTimeSlots.map((slot) => {
                    const slotMeetings = getMeetingsForSlot(slot)
                    const isOccupied = slotMeetings.length > 0

                    const hasNewMeetingStartingHere = meetings.some((meeting) => meeting.horario.slice(0, 5) === slot)

                    const isWithinPreviousMeeting = meetings.some((meeting) => {
                      const meetingStart = meeting.horario.slice(0, 5)
                      const meetingEndMinutes =
                        Number.parseInt(meeting.horario.split(":")[0]) * 60 +
                        Number.parseInt(meeting.horario.split(":")[1]) +
                        meeting.duracao
                      const meetingEndTime = `${String(Math.floor(meetingEndMinutes / 60)).padStart(2, "0")}:${String(meetingEndMinutes % 60).padStart(2, "0")}`
                      return slot > meetingStart && slot < meetingEndTime
                    })

                    if (isWithinPreviousMeeting && !hasNewMeetingStartingHere) return null

                    return (
                      <div key={slot} className="flex hover:bg-gray-50 transition-colors">
                        {/* Time label */}
                        <div className="w-16 flex-shrink-0 py-3 px-3 text-xs font-medium text-gray-500 border-r border-gray-100">
                          {slot}
                        </div>

                        {/* Meeting content */}
                        <div className="flex-1 py-2 px-3">
                          {isOccupied ? (
                            <div className="flex gap-2 h-full">
                              {slotMeetings.map((meeting) => {
                                const slotSpan = Math.ceil(meeting.duracao / 30)
                                const cardHeight = slotSpan * 48 - 8

                                console.log("[v0] Renderizando meeting:", {
                                  id: meeting.id,
                                  horario: meeting.horario,
                                  slot: slot,
                                  duracao: meeting.duracao,
                                })

                                const isCompleted = meeting.status === "concluida"

                                const bgColor = isCompleted
                                  ? "bg-green-500/70"
                                  : meeting.admin_id === 3
                                    ? "bg-blue-500"
                                    : meeting.admin_id === 4
                                      ? "bg-orange-500"
                                      : "bg-gray-600"

                                const hoverColor = isCompleted
                                  ? "hover:bg-green-600/80"
                                  : meeting.admin_id === 3
                                    ? "hover:bg-blue-600"
                                    : meeting.admin_id === 4
                                      ? "hover:bg-orange-600"
                                      : "hover:bg-gray-700"

                                return (
                                  <div
                                    key={meeting.id}
                                    className={`
                                        group relative flex-1 min-h-[60px] rounded-lg shadow-sm cursor-pointer
                                        transition-all hover:shadow-md hover:scale-[1.02]
                                        ${bgColor} ${hoverColor}
                                        p-3 overflow-visible
                                        ${isCompleted ? "opacity-80 border-2 border-green-600" : ""}
                                      `}
                                    onClick={() => {
                                      setEditingMeeting(meeting)
                                      setShowEditMeetingModal(true)
                                    }}
                                  >
                                    {/* Nome e Horário */}
                                    <div className="flex flex-col h-full justify-between">
                                      <h4 className="font-semibold text-white text-sm truncate pr-8 flex items-center gap-1">
                                        {meeting.mentorado_nome}
                                        {isCompleted && (
                                          <svg
                                            className="w-4 h-4 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M5 13l4 4L19 7"
                                            />
                                          </svg>
                                        )}
                                      </h4>
                                      <p className="text-white/90 text-xs font-medium mt-1">
                                        {meeting.horario.slice(0, 5)}
                                      </p>

                                      {/* CHANGE: Botões de ação com editar adicionado */}
                                      <div
                                        className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {/* Botão de Info */}
                                        <div className="relative">
                                          <button
                                            onMouseEnter={() => setShowInfo(meeting.id)}
                                            onMouseLeave={() => setShowInfo(null)}
                                            className="p-1.5 rounded-full bg-white/90 text-gray-600 hover:bg-white hover:text-gray-800 shadow-sm transition-all"
                                          >
                                            <Info className="h-3.5 w-3.5" />
                                          </button>
                                          {showInfo === meeting.id && (
                                            <div className="absolute bottom-full right-0 mb-2 w-72 bg-gray-900 text-white text-xs rounded-lg shadow-xl p-3 z-[9999] border border-gray-700">
                                              <div className="space-y-2">
                                                <div>
                                                  <span className="font-semibold">Mentorado:</span>{" "}
                                                  {meeting.mentorado_nome}
                                                </div>
                                                <div>
                                                  <span className="font-semibold">Mentor:</span>{" "}
                                                  {meeting.admin_nome || "Administrador"}
                                                </div>
                                                <div>
                                                  <span className="font-semibold">Tipo:</span> {meeting.titulo}
                                                </div>
                                                <div>
                                                  <span className="font-semibold">Data:</span>{" "}
                                                  {new Date(meeting.data).toLocaleDateString("pt-BR")}
                                                </div>
                                                <div>
                                                  <span className="font-semibold">Horário:</span>{" "}
                                                  {meeting.horario.slice(0, 5)}
                                                </div>
                                                <div>
                                                  <span className="font-semibold">Duração:</span> {meeting.duracao}{" "}
                                                  minutos
                                                </div>
                                                {meeting.meet_link && (
                                                  <div>
                                                    <span className="font-semibold">Link:</span>{" "}
                                                    <a
                                                      href={meeting.meet_link}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="text-blue-400 hover:underline"
                                                      onClick={(e) => e.stopPropagation()}
                                                    >
                                                      Abrir Meet
                                                    </a>
                                                  </div>
                                                )}
                                                <div>
                                                  <span className="font-semibold">Status:</span>{" "}
                                                  {meeting.status === "agendada"
                                                    ? "Agendada"
                                                    : meeting.status === "concluida"
                                                      ? "Concluída"
                                                      : "Cancelada"}
                                                </div>
                                                {meeting.planejamento && (
                                                  <>
                                                    <div className="flex items-start gap-2 text-sm">
                                                      <FileText className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                                      <div>
                                                        <span className="font-semibold text-white">Planejamento:</span>
                                                        <p className="text-gray-200 mt-1 whitespace-pre-wrap">
                                                          {meeting.planejamento}
                                                        </p>
                                                      </div>
                                                    </div>
                                                    <div className="border-t border-gray-200" />
                                                  </>
                                                )}
                                                {meeting.status === "concluida" && meeting.observacoes && (
                                                  <div className="pt-2 border-t border-gray-700">
                                                    <span className="font-semibold text-green-400">Comentários:</span>
                                                    <p className="mt-1 text-gray-300 whitespace-pre-wrap">
                                                      {meeting.observacoes}
                                                    </p>
                                                  </div>
                                                )}
                                              </div>
                                              <div className="absolute -bottom-1 right-4 w-2 h-2 bg-gray-900 border-r border-b border-gray-700 transform rotate-45"></div>
                                            </div>
                                          )}
                                        </div>

                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setEditingMeeting(meeting)
                                            setShowEditMeetingModal(true)
                                          }}
                                          className="p-1.5 rounded-full bg-white/90 text-blue-600 hover:bg-white hover:text-blue-800 shadow-sm transition-all"
                                        >
                                          <Pencil className="h-3.5 w-3.5" />
                                        </button>

                                        {/* Botão de Concluir */}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleCompleteMeeting(meeting)
                                          }}
                                          className="p-1.5 rounded-full bg-white/90 text-green-600 hover:bg-white hover:text-green-800 shadow-sm transition-all"
                                        >
                                          <Check className="h-3.5 w-3.5" />
                                        </button>

                                        {/* Botão de Excluir */}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleDeleteMeeting(meeting.id)
                                          }}
                                          className="p-1.5 rounded-full bg-white/90 text-red-600 hover:bg-white hover:text-red-800 shadow-sm transition-all"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="h-10 flex items-center">
                              <span className="text-xs text-gray-400">Horário livre</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-gray-900">Disponibilidade</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousDay}
                    className="px-2 sm:px-3 bg-transparent"
                    disabled={isLoadingMeetings}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Anterior</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToday}
                    className="px-2 sm:px-3"
                    disabled={isLoadingMeetings}
                  >
                    <span className="text-sm font-medium px-2 sm:px-3 py-1 bg-blue-50 text-blue-600 rounded">Hoje</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextDay}
                    className="px-2 sm:px-3 bg-transparent"
                    disabled={isLoadingMeetings}
                  >
                    <span className="hidden sm:inline">Próximo</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {isLoadingMeetings ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    Horários livres para agendamento - Clique nos ocupados para ver detalhes
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                    {generateTimeSlots().map((slot) => (
                      <div
                        key={slot.time}
                        className={`
                          p-2 sm:p-3 rounded-lg text-center text-xs sm:text-sm font-medium cursor-pointer transition-colors
                          ${
                            slot.isOccupied
                              ? "bg-red-100 text-red-800 hover:bg-red-200"
                              : "bg-green-100 text-green-800 hover:bg-green-200"
                          }
                        `}
                        onClick={() => {
                          if (!slot.isOccupied) {
                            // Mostrar detalhes do horário ocupado
                          }
                        }}
                      >
                        {slot.time}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-4 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-100 rounded"></div>
                      <span>Disponível ({generateTimeSlots().filter((slot) => !slot.isOccupied).length})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-100 rounded"></div>
                      <span>Ocupado ({generateTimeSlots().filter((slot) => slot.isOccupied).length})</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // LOGS SECTION
  const renderLogsSection = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Logs de Auditoria</h1>
        <p className="text-gray-600 mt-1">Histórico completo de ações realizadas no sistema</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Detalhes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      Nenhum log registrado ainda
                    </td>
                  </tr>
                ) : (
                  logs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(log.created_at).toLocaleString("pt-BR")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold mr-2">
                            {(log.admin_display_name || log.admin_email).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {log.admin_display_name || log.admin_email}
                            </div>
                            <div className="text-xs text-gray-500">{log.admin_email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionColor(
                            log.action,
                          )}`}
                        >
                          {getActionLabel(log.action)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {log.details && typeof log.details === "object" ? (
                          <div className="max-w-md">
                            {log.details.mentorado_nome && (
                              <span className="font-medium">{log.details.mentorado_nome}</span>
                            )}
                            {log.details.meeting_titulo && (
                              <span className="font-medium">{log.details.meeting_titulo}</span>
                            )}
                            {log.details.data && <span className="text-gray-400 ml-2">({log.details.data})</span>}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      create_mentorado: "Criou mentorado",
      update_mentorado: "Editou mentorado",
      delete_mentorado: "Excluiu mentorado",
      create_meeting: "Agendou call",
      update_meeting: "Editou call",
      complete_meeting: "Concluiu call",
      delete_meeting: "Excluiu call",
    }
    return labels[action] || action
  }

  const getActionColor = (action: string) => {
    if (action.includes("create")) return "bg-green-100 text-green-700"
    if (action.includes("update") || action.includes("complete")) return "bg-blue-100 text-blue-700"
    if (action.includes("delete")) return "bg-red-100 text-red-700"
    return "bg-gray-100 text-gray-700"
  }

  // Funções para obter cores do admin
  const getAdminColor = (adminId: number) => {
    const colors = {
      1: "bg-gray-100 border-gray-300", // Admin padrão - cinza
      3: "bg-blue-100 border-blue-300", // Fellipe - azul
      4: "bg-orange-100 border-orange-300", // Luidy - laranja
    }
    return colors[adminId] || "bg-gray-100 border-gray-300"
  }

  const getAdminTextColor = (adminId: number) => {
    const colors = {
      1: "text-gray-900",
      3: "text-blue-900",
      4: "text-orange-900",
    }
    return colors[adminId] || "text-gray-900"
  }

  const getAdminBadgeColor = (adminId: number) => {
    const colors = {
      1: "bg-gray-200 text-gray-800",
      3: "bg-blue-200 text-blue-800",
      4: "bg-orange-200 text-orange-800",
    }
    return colors[adminId] || "bg-gray-200 text-gray-800"
  }

  const handlePreviousDay = () => {
    navigateDate("prev")
  }

  const handleNextDay = () => {
    navigateDate("next")
  }

  const handleToday = () => {
    setSelectedDate(new Date())
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard - iGaming Rat</h1>
          <p className="text-gray-600 mt-1">Gerencie seus mentorados e acompanhe o progresso</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Novo Mentorado
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Mentorados</p>
                <p className="text-2xl font-bold text-gray-900">{mentorados.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Calls Esta Semana</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Anotações Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
              <MessageSquare className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Progresso Geral</p>
                <p className="text-2xl font-bold text-gray-900">75%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar mentorado por nome ou empresa..."
              className="pl-10"
              value={mentoradoSearchTerm}
              onChange={(e) => setMentoradoSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredMentorados.map((mentorado) => (
          <Card key={mentorado.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {mentorado.nome.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm text-gray-900 truncate">{mentorado.nome}</h3>
                    <p className="text-xs text-gray-600 truncate">{mentorado.empresa}</p>
                  </div>
                </div>
                {/* CHANGE: Replaced Popover menu with 4 icon buttons */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(`/${mentorado.slug}`, "_blank")
                    }}
                    title="Ver Dashboard"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCopyLink(mentorado.slug)
                    }}
                    title="Copiar Link"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditMentorado(mentorado)
                    }}
                    title="Personalizar"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteMentorado(mentorado.id)
                    }}
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-3">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Calls: {mentorado.callsRealizadas || 0}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(mentorado.fase_atual)}`}>
                  {mentorado.fase_atual}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <Mail className="h-3 w-3 text-gray-400" />
                <span className="text-gray-600 truncate">{mentorado.email}</span>
              </div>

              {mentorado.telefone && (
                <div className="flex items-center gap-2 text-xs">
                  <Phone className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-600">{mentorado.telefone}</span>
                </div>
              )}

              {mentorado.comentarios && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-700 mb-1">Anotações Iniciais:</p>
                  <p className="text-xs text-gray-600 line-clamp-2">{mentorado.comentarios}</p>
                </div>
              )}

              <button
                onClick={() => {
                  const details = document.getElementById(`details-${mentorado.id}`)
                  if (details) {
                    details.classList.toggle("hidden")
                  }
                }}
                className="w-full flex items-center justify-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium pt-2 border-t border-gray-100"
              >
                <ChevronDown className="h-3 w-3" />
                Mais detalhes
              </button>

              <div id={`details-${mentorado.id}`} className="hidden pt-3 border-t space-y-2">
                <div className="text-xs">
                  <p className="text-gray-600">
                    Empresa: <span className="text-gray-900">{mentorado.empresa}</span>
                  </p>
                  <p className="text-gray-600">
                    Criado: <span className="text-gray-900">{new Date(mentorado.created_at).toLocaleDateString()}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderHistoricoSection = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Histórico</h1>
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-600">Histórico de reuniões em desenvolvimento...</p>
        </CardContent>
      </Card>
    </div>
  )

  const renderDisponibilidadeSection = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Disponibilidade</h1>
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-600">Configuração de disponibilidade em desenvolvimento...</p>
        </CardContent>
      </Card>
    </div>
  )

  const removeCommentFile = (index: number) => {
    setCommentFiles((files) => files.filter((_, i) => i !== index))
  }

  const toggleMentionAdmin = (email: string) => {
    setMentionedAdmins((prev) => (prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]))
  }

  const renderTasksSection = () => {
    const filteredTasks = tasks.filter((task) => {
      // Filtrar por arquivado
      if (showArchivedTasks && !task.arquivado) return false
      if (!showArchivedTasks && task.arquivado) return false

      const matchesStatus = taskFilter === "todas" || task.status === taskFilter
      const matchesSearch =
        !taskSearchTerm ||
        task.titulo.toLowerCase().includes(taskSearchTerm.toLowerCase()) ||
        task.mentorado_nome?.toLowerCase().includes(taskSearchTerm.toLowerCase()) ||
        task.atribuido_para?.toLowerCase().includes(taskSearchTerm.toLowerCase())

      return matchesStatus && matchesSearch
    })

    const tasksByStatus = {
      todo: filteredTasks.filter((t) => t.status === "todo"),
      em_progresso: filteredTasks.filter((t) => t.status === "em_progresso"),
      concluido: filteredTasks.filter((t) => t.status === "concluido"),
    }

    const getPriorityColor = (prioridade: string) => {
      switch (prioridade) {
        case "urgente":
          return "text-red-600 bg-red-50 border-red-200"
        case "alta":
          return "text-orange-600 bg-orange-50 border-orange-200"
        case "media":
          return "text-yellow-600 bg-yellow-50 border-yellow-200"
        case "baixa":
          return "text-green-600 bg-green-50 border-green-200"
        default:
          return "text-gray-600 bg-gray-50 border-gray-200"
      }
    }

    const getPriorityLabel = (prioridade: string) => {
      switch (prioridade) {
        case "urgente":
          return "Urgente"
        case "alta":
          return "Alta"
        case "media":
          return "Média"
        case "baixa":
          return "Baixa"
        default:
          return prioridade
      }
    }

    const getTagColor = (cor: string) => {
      const colors: Record<string, string> = {
        red: "bg-red-500",
        blue: "bg-blue-500",
        yellow: "bg-yellow-500",
        green: "bg-green-500",
        purple: "bg-purple-500",
        gray: "bg-gray-500",
        orange: "bg-orange-500",
        pink: "bg-pink-500",
      }
      return colors[cor] || "bg-gray-500"
    }

    // Drag and Drop handlers
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: any) => {
      setDraggedTask(task)
      e.dataTransfer.setData("text/plain", task.id.toString())
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.currentTarget.classList.add("bg-blue-50", "border-blue-300")
    }

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.currentTarget.classList.remove("bg-blue-50", "border-blue-300")
    }

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>, newStatus: string) => {
      e.preventDefault()
      e.currentTarget.classList.remove("bg-blue-50", "border-blue-300")

      if (draggedTask && draggedTask.status !== newStatus) {
        await handleUpdateTaskStatus(draggedTask.id, newStatus)
        setDraggedTask(null)
      }
    }

    const renderTaskCard = (task: any) => {
      // Calculate checklist progress
      let checklistProgress = 0
      if (task.total_checklist > 0) {
        checklistProgress = (task.checklist_concluidos / task.total_checklist) * 100
      }

      return (
        <Card
          key={task.id}
          draggable={!showArchivedTasks}
          onDragStart={(e) => !showArchivedTasks && handleDragStart(e, task)}
          onContextMenu={(e) => {
            e.preventDefault()
            setContextMenu({ x: e.clientX, y: e.clientY, task })
          }}
          className="mb-3 cursor-move hover:shadow-md transition-shadow relative"
          onClick={() => {
            setSelectedTask(task)
            setShowTaskDetailModal(true)
          }}
        >
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 flex-1">{task.titulo}</h3>
              <Badge className={`ml-2 ${getPriorityColor(task.prioridade)}`}>{getPriorityLabel(task.prioridade)}</Badge>
            </div>

            {task.descricao && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.descricao}</p>}

            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {task.tags.map((tag: any) => (
                  <span
                    key={tag.id}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-white ${getTagColor(
                      tag.cor,
                    )}`}
                  >
                    <Tag className="h-3 w-3" />
                    {tag.nome}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-3">
                {task.mentorado_nome && (
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {task.mentorado_nome}
                  </span>
                )}
                {task.atribuido_para && (
                  <span className="flex items-center gap-1 font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    <UserCheck className="h-4 w-4" />
                    {task.atribuido_para}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {task.total_checklist > 0 && (
                  <span className="flex items-center gap-1">
                    <CheckSquare className="h-3 w-3" />
                    {task.checklist_concluidos}/{task.total_checklist}
                  </span>
                )}
                {task.horario && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {task.horario}
                  </span>
                )}
                {task.data_limite && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(task.data_limite).toLocaleDateString()}
                  </span>
                )}
                {task.anexos && task.anexos.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Paperclip className="h-3 w-3" />
                    {task.anexos.length}
                  </span>
                )}
                {task.arquivado && (
                  <span className="flex items-center gap-1 text-gray-400">
                    <Archive className="h-3 w-3" />
                    Arquivado
                  </span>
                )}
              </div>
            </div>

            {task.total_checklist > 0 && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full transition-all"
                    style={{ width: `${checklistProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          {/* Adicionando botão de comentar nos cards de task */}
          <div className="p-4 border-t flex justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation()
                openCommentModal(task)
              }}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
            >
              <MessageSquare className="h-4 w-4" />
              Comentar ({task.comentarios?.length || 0})
            </button>
          </div>
        </Card>
      )
    }

    // Context menu functions
    const handleEditTaskFromContext = (task: any) => {
      setSelectedTask(task)
      setShowTaskDetailModal(true)
      setContextMenu(null)
    }

    const handleArchiveTask = async (taskId: number) => {
      try {
        const response = await fetch(`/api/admin/tasks/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ arquivado: true }),
        })
        if (response.ok) {
          loadTasks()
          setContextMenu(null)
        }
      } catch (error) {
        console.error("Erro ao arquivar task:", error)
      }
    }

    const handleUnarchiveTask = async (taskId: number) => {
      try {
        const response = await fetch(`/api/admin/tasks/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ arquivado: false }),
        })
        if (response.ok) {
          loadTasks()
          setContextMenu(null)
        }
      } catch (error) {
        console.error("Erro ao desarquivar task:", error)
      }
    }

    const handleDeleteTaskFromContext = async (taskId: number) => {
      if (!confirm("Tem certeza que deseja deletar esta task?")) return
      await handleDeleteTask(taskId)
      setContextMenu(null)
    }

    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Central de Tasks</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowArchivedTasks(!showArchivedTasks)}
              className="text-sm"
            >
              <Archive className="h-4 w-4 mr-2" />
              {showArchivedTasks ? "Ver Tasks Ativas" : "Ver Arquivadas"}
            </Button>
          </div>
          <Button onClick={() => setShowNewTaskModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Task
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar por título, mentorado ou responsável..."
              value={taskSearchTerm}
              onChange={(e) => setTaskSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {taskSearchTerm && (
              <button
                onClick={() => setTaskSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""} encontrada
            {filteredTasks.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Adicionar loading state na renderização das tasks */}
        {loadingTasks ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((col) => (
              <div key={col} className="space-y-3">
                <div className="bg-gray-100 rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
                <div className="bg-gray-100 rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-300 rounded w-2/3 mb-3"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, "todo")}
              className="min-h-[200px]"
            >
              <div className="bg-gray-100 rounded-lg p-3 mb-3">
                <h2 className="font-semibold text-gray-700 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />A Fazer ({tasksByStatus.todo.length})
                </h2>
              </div>
              {tasksByStatus.todo.map(renderTaskCard)}
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, "em_progresso")}
              className="min-h-[200px]"
            >
              <div className="bg-blue-100 rounded-lg p-3 mb-3">
                <h2 className="font-semibold text-blue-700 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Em Progresso ({tasksByStatus.em_progresso.length})
                </h2>
              </div>
              {tasksByStatus.em_progresso.map(renderTaskCard)}
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, "concluido")}
              className="min-h-[200px]"
            >
              <div className="bg-green-100 rounded-lg p-3 mb-3">
                <h2 className="font-semibold text-green-700 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Concluído ({tasksByStatus.concluido.length})
                </h2>
              </div>
              {tasksByStatus.concluido.map(renderTaskCard)}
            </div>
          </div>
        )}

        {/* Modal: Nova Task */}
        {showNewTaskModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Nova Task</h2>
                  <button onClick={() => setShowNewTaskModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                    <input
                      type="text"
                      id="task-titulo"
                      value={newTask.titulo}
                      onChange={(e) => setNewTask({ ...newTask, titulo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Ex: Fazer call com Gabriel 61"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea
                      id="task-descricao"
                      value={newTask.descricao}
                      onChange={(e) => setNewTask({ ...newTask, descricao: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      rows={3}
                      placeholder="Descreva a task..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                      <select
                        id="task-prioridade"
                        value={newTask.prioridade}
                        onChange={(e) => setNewTask({ ...newTask, prioridade: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="baixa">Baixa</option>
                        <option value="media">Média</option>
                        <option value="alta">Alta</option>
                        <option value="urgente">Urgente</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data Limite</label>
                      <input
                        type="date"
                        id="task-data-limite"
                        value={newTask.data_limite}
                        onChange={(e) => setNewTask({ ...newTask, data_limite: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Atribuir para</label>
                      <select
                        id="task-atribuido"
                        value={newTask.atribuido_para}
                        onChange={(e) =>
                          setNewTask({
                            ...newTask,
                            atribuido_para: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Selecione um admin</option>
                        {admins.map((admin) => (
                          <option key={admin.id} value={admin.nome}>
                            {admin.nome}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mentorado</label>
                      <select
                        id="task-mentorado"
                        value={newTask.mentorado_id || ""}
                        onChange={(e) =>
                          setNewTask({
                            ...newTask,
                            mentorado_id: e.target.value ? Number.parseInt(e.target.value) : null,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Nenhum</option>
                        {mentorados.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.nome}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {taskTags.map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => {
                            const isSelected = selectedTags.includes(tag.id)
                            setSelectedTags(
                              isSelected ? selectedTags.filter((t) => t !== tag.id) : [...selectedTags, tag.id],
                            )
                            setNewTask({
                              ...newTask,
                              tags: isSelected ? newTask.tags.filter((t) => t !== tag.id) : [...newTask.tags, tag.id],
                            })
                          }}
                          className={`px-3 py-1 rounded-full text-sm ${
                            selectedTags.includes(tag.id)
                              ? `${getTagColor(tag.cor)} text-white`
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {tag.nome}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Checklist</label>
                    <div className="space-y-2">
                      {newTask.checklist.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                          <CheckSquare className="h-4 w-4 text-gray-400" />
                          <span className="flex-1">{item.texto}</span>
                          <button
                            onClick={() =>
                              setNewTask({
                                ...newTask,
                                checklist: newTask.checklist.filter((_, i) => i !== index),
                              })
                            }
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newChecklistItem}
                          onChange={(e) => setNewChecklistItem(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && newChecklistItem.trim()) {
                              setNewTask({
                                ...newTask,
                                checklist: [...newTask.checklist, { texto: newChecklistItem, concluido: false }],
                              })
                              setNewChecklistItem("")
                            }
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Adicionar item da checklist..."
                        />
                        <Button
                          onClick={() => {
                            if (newChecklistItem.trim()) {
                              setNewTask({
                                ...newTask,
                                checklist: [...newTask.checklist, { texto: newChecklistItem, concluido: false }],
                              })
                              setNewChecklistItem("")
                            }
                          }}
                          variant="outline"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Horário</label>
                    <input
                      type="time"
                      id="task-horario"
                      value={newTask.horario}
                      onChange={(e) => setNewTask({ ...newTask, horario: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Adicionar campo de upload no modal de criar task */}
                  <div className="mb-4">
                    <Label htmlFor="task-files">Arquivos (opcional)</Label>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || [])
                        if (files.length > 0) {
                          // Converter arquivos para base64
                          Promise.all(
                            files.map((file) => {
                              return new Promise<{ nome: string; data: string; tamanho: number }>((resolve) => {
                                const reader = new FileReader()
                                reader.onloadend = () => {
                                  resolve({
                                    nome: file.name,
                                    data: reader.result as string,
                                    tamanho: file.size,
                                  })
                                }
                                reader.readAsDataURL(file)
                              })
                            }),
                          ).then((anexos) => {
                            setNewTask((prev) => ({
                              ...prev,
                              anexos: [...prev.anexos, ...anexos],
                            }))
                          })
                        }
                      }}
                      className="hidden"
                      id="new-task-files"
                    />
                    <Button
                      type="button"
                      onClick={() => document.getElementById("new-task-files")?.click()}
                      variant="outline"
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Adicionar Arquivos ({newTask.anexos.length})
                    </Button>
                    {newTask.anexos.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {newTask.anexos.map((anexo, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded"
                          >
                            <FileText className="h-3 w-3" />
                            <span className="flex-1 truncate">{anexo.nome}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setNewTask((prev) => ({
                                  ...prev,
                                  anexos: prev.anexos.filter((_, i) => i !== index),
                                }))
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button onClick={() => setShowNewTaskModal(false)} variant="outline" className="flex-1">
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreateTask} // Call the actual handleCreateTask function
                    disabled={!newTask.titulo}
                    className="flex-1"
                  >
                    Criar Task
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showTaskDetailModal && selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">{selectedTask.titulo}</h2>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getPriorityColor(selectedTask.prioridade)}>
                        {getPriorityLabel(selectedTask.prioridade)}
                      </Badge>
                      {selectedTask.tags &&
                        selectedTask.tags.map((tag: any) => (
                          <span
                            key={tag.id}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-white ${getTagColor(
                              tag.cor,
                            )}`}
                          >
                            {tag.nome}
                          </span>
                        ))}
                    </div>
                  </div>
                  <button onClick={() => setShowTaskDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* ... existing task details ... */}
                <div className="space-y-4">
                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={selectedTask.status}
                      onChange={(e) => {
                        handleUpdateTaskStatus(selectedTask.id, e.target.value)
                        setSelectedTask({
                          ...selectedTask,
                          status: e.target.value,
                        })
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="todo">A Fazer</option>
                      <option value="em_progresso">Em Progresso</option>
                      <option value="concluido">Concluído</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>

                  {/* Descrição */}
                  {selectedTask.descricao && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Descrição</h3>
                      <p className="text-gray-600">{selectedTask.descricao}</p>
                    </div>
                  )}

                  {/* Informações */}
                  <div className="grid grid-cols-2 gap-4">
                    {selectedTask.atribuido_para && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Atribuído para</h3>
                        <p className="text-gray-600">{selectedTask.atribuido_para}</p>
                      </div>
                    )}
                    {selectedTask.mentorado_nome && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Mentorado</h3>
                        <p className="text-gray-600">{selectedTask.mentorado_nome}</p>
                      </div>
                    )}
                    {selectedTask.data_limite && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Data Limite</h3>
                        <p className="text-gray-600">{new Date(selectedTask.data_limite).toLocaleDateString()}</p>
                      </div>
                    )}
                    {selectedTask.horario && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Horário</h3>
                        <p className="text-gray-600">{selectedTask.horario}</p>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Criado em</h3>
                      <p className="text-gray-600">{new Date(selectedTask.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Checklist */}
                  {selectedTask.checklist && selectedTask.checklist.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Checklist ({selectedTask.checklist_concluidos}/{selectedTask.total_checklist})
                      </h3>
                      <div className="space-y-2">
                        {selectedTask.checklist.map((item: any, index: number) => (
                          <div key={item.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={item.concluido}
                              onChange={() => handleToggleChecklistItem(selectedTask.id, index)}
                              className="h-4 w-4 text-blue-600 rounded"
                            />
                            <span
                              className={`flex-1 ${item.concluido ? "line-through text-gray-400" : "text-gray-700"}`}
                            >
                              {item.texto}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Paperclip className="h-4 w-4" />
                      Anexos ({selectedTask.anexos?.length || 0})
                    </h3>

                    <div className="space-y-2 mb-3">
                      {selectedTask.anexos?.map((anexo: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200"
                        >
                          <FileText className="h-4 w-4 text-gray-500" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{anexo.nome}</p>
                            <p className="text-xs text-gray-500">{anexo.tamanho.toFixed(2)} KB</p>
                          </div>
                          <a
                            href={anexo.data}
                            download={anexo.nome}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </div>
                      ))}
                    </div>

                    <label className="block">
                      <input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleFileUpload(selectedTask.id, file)
                          }
                        }}
                        disabled={uploadingFile}
                        className="hidden"
                        id="task-file-upload"
                      />
                      <Button
                        onClick={() => document.getElementById("task-file-upload")?.click()}
                        disabled={uploadingFile}
                        variant="outline"
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadingFile ? "Enviando..." : "Adicionar Arquivo"}
                      </Button>
                    </label>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Comentários ({selectedTask.comentarios?.length || 0})
                    </h3>

                    <div className="space-y-3 mb-4">
                      {selectedTask.comentarios?.map((comment: any) => (
                        <div key={comment.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-900">{comment.autor}</span>
                            <span className="text-sm text-gray-500">
                              {new Date(comment.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.comentario}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Adicionar um comentário..."
                        id="task-comment-input"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleAddComment(selectedTask.id)
                          }
                        }}
                      />
                      <Button onClick={() => handleAddComment(selectedTask.id)}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={() => handleDeleteTask(selectedTask.id)}
                    variant="outline"
                    className="text-red-600 border-red-200"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Deletar
                  </Button>
                  <Button onClick={() => setShowTaskDetailModal(false)} className="flex-1">
                    Fechar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        {contextMenu && (
          <div
            className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-1"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => handleEditTaskFromContext(contextMenu.task)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Editar
            </button>
            <button
              onClick={() =>
                showArchivedTasks ? handleUnarchiveTask(contextMenu.task.id) : handleArchiveTask(contextMenu.task.id)
              }
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <Archive className="h-4 w-4" />
              {showArchivedTasks ? "Desarquivar" : "Arquivar"}
            </button>
            <button
              onClick={() => handleDeleteTaskFromContext(contextMenu.task.id)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Excluir
            </button>
          </div>
        )}
        {/* Loading overlay during upload */}
        {uploadingFile && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center gap-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600"></div>
                <Upload className="h-6 w-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900">Enviando arquivo...</p>
                <p className="text-sm text-gray-500">Por favor, aguarde</p>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderCommentModal = () => {
    return (
      commentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Comentar em Task</h2>
                <button onClick={() => setCommentModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seu Comentário</label>
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Adicione seu comentário aqui..."
                    rows={5}
                    className="border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Anexos (opcional)</label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      setCommentFiles((prevFiles) => [...prevFiles, ...files])
                    }}
                    className="hidden"
                    id="comment-files"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById("comment-files")?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Selecionar Arquivos
                  </Button>
                  <div className="mt-2 space-y-1">
                    {commentFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <FileText className="h-3 w-3" />
                        <span className="flex-1 truncate">{file.name}</span>
                        <button onClick={() => removeCommentFile(index)} className="text-red-500 hover:text-red-700">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mentions */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Mencionar Admins (opcional)</label>
                  <div className="flex flex-wrap gap-2">
                    {admins.map((admin) => (
                      <button
                        key={admin.id}
                        onClick={() => toggleMentionAdmin(admin.email)}
                        className={`px-3 py-1 rounded-full text-xs ${
                          mentionedAdmins.includes(admin.email)
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {admin.nome}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setCommentModalOpen(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={handleAddComment} disabled={!newComment.trim()} className="flex-1">
                  Enviar Comentário
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
    )
  }

  // Renderizando a seção de aulas
  const renderAulasSection = () => {
    const addObjetivo = () => {
      if (objetivoInput.trim()) {
        if (showEditAulaModal && editingAula) {
          // Editando aula existente
          setEditingAula({
            ...editingAula,
            objetivosAprendizado: [...(editingAula.objetivosAprendizado || []), objetivoInput],
          })
        } else {
          // Criando nova aula
          setNewAula({
            ...newAula,
            objetivosAprendizado: [...newAula.objetivosAprendizado, objetivoInput],
          })
        }
        setObjetivoInput("")
      }
    }

    const removeObjetivo = (index: number) => {
      if (showEditAulaModal && editingAula) {
        // Editando aula existente
        setEditingAula({
          ...editingAula,
          objetivosAprendizado: editingAula.objetivosAprendizado.filter((_: string, i: number) => i !== index),
        })
      } else {
        // Criando nova aula
        setNewAula({
          ...newAula,
          objetivosAprendizado: newAula.objetivosAprendizado.filter((_: string, i: number) => i !== index),
        })
      }
    }

    const addMaterial = () => {
      if (materialInput.trim()) {
        if (showEditAulaModal && editingAula) {
          // Editando aula existente
          setEditingAula({
            ...editingAula,
            materiaisComplementares: [...(editingAula.materiaisComplementares || []), materialInput],
          })
        } else {
          // Criando nova aula
          setNewAula({
            ...newAula,
            materiaisComplementares: [...newAula.materiaisComplementares, materialInput],
          })
        }
        setMaterialInput("")
      }
    }

    const removeMaterial = (index: number) => {
      if (showEditAulaModal && editingAula) {
        // Editando aula existente
        setEditingAula({
          ...editingAula,
          materiaisComplementares: editingAula.materiaisComplementares.filter((_: string, i: number) => i !== index),
        })
      } else {
        // Criando nova aula
        setNewAula({
          ...newAula,
          materiaisComplementares: newAula.materiaisComplementares.filter((_: string, i: number) => i !== index),
        })
      }
    }

    const handleFileUploadMaterial = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      try {
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64 = reader.result as string
          const fileSize = (file.size / 1024).toFixed(2)
          const materialData = `Arquivo - ${file.name} (${fileSize}KB)`

          if (showEditAulaModal && editingAula) {
            // Editando aula existente
            setEditingAula({
              ...editingAula,
              materiaisComplementares: [...(editingAula.materiaisComplementares || []), materialData],
            })
          } else {
            // Criando nova aula
            setNewAula({
              ...newAula,
              materiaisComplementares: [...newAula.materiaisComplementares, materialData],
            })
          }
        }
        reader.readAsDataURL(file)
      } catch (error) {
        console.error("Erro ao fazer upload do arquivo:", error)
        alert("Erro ao fazer upload do arquivo")
      }
    }

    const moveAulaUp = (index: number) => {
      if (index === 0) return
      const newAulas = [...aulas]
      const temp = newAulas[index]
      newAulas[index] = newAulas[index - 1]
      newAulas[index - 1] = temp

      // Atualizar campo ordem
      newAulas[index].ordem = index + 1
      newAulas[index - 1].ordem = index

      setAulas(newAulas)
    }

    const moveAulaDown = (index: number) => {
      if (index === aulas.length - 1) return
      const newAulas = [...aulas]
      const temp = newAulas[index]
      newAulas[index] = newAulas[index + 1]
      newAulas[index + 1] = temp

      // Atualizar campo ordem
      newAulas[index].ordem = index + 1
      newAulas[index + 1].ordem = index + 2

      setAulas(newAulas)
    }

    const convertToYouTubeEmbed = (url: string): string => {
      if (!url || url.trim() === "") return url

      try {
        // Padrão 1: https://www.youtube.com/watch?v=VIDEO_ID
        // Padrão 2: https://youtube.com/watch?v=VIDEO_ID
        // Padrão 3: https://youtu.be/VIDEO_ID
        // Padrão 4: https://www.youtube.com/embed/VIDEO_ID (já está correto)

        let videoId = ""

        // Se já estiver no formato embed, retorna como está
        if (url.includes("youtube.com/embed/")) {
          return url
        }

        // Tenta extrair o ID do formato watch?v=
        if (url.includes("youtube.com/watch")) {
          const urlParams = new URLSearchParams(url.split("?")[1])
          videoId = urlParams.get("v") || ""
        }
        // Tenta extrair o ID do formato youtu.be
        else if (url.includes("youtu.be/")) {
          videoId = url.split("youtu.be/")[1]?.split("?")[0] || ""
        }

        // Se não encontrou o ID, retorna o original
        return url
      } catch (error) {
        console.error("[v0] Erro ao converter URL do YouTube:", error)
        return url
      }
    }

    const handleCreateAula = async () => {
      setCreating(true)
      try {
        // Preparar materiais com estrutura correta
        const materiaisFormatados = newAula.materiaisComplementares.map((m: any) => {
          if (typeof m === "string") {
            // Se for string simples, converter para objeto
            const [tipo, titulo] = m.includes(" - ") ? m.split(" - ") : ["link", m]
            return {
              titulo: titulo || m,
              tipo: tipo.toLowerCase() || "link",
              url: m, // Por enquanto usa o texto como URL
              tamanho: null,
            }
          }
          return m
        })

        const videoUrlEmbed = convertToYouTubeEmbed(newAula.videoUrl)

        const aulaData = {
          titulo: newAula.titulo,
          descricao: newAula.descricao,
          modulo: newAula.modulo,
          ordem: aulas.length + 1,
          duracao: Number.parseInt(newAula.duracao) || 60,
          thumbnail_url: newAula.capaUrl,
          video_url: videoUrlEmbed,
          sobre_aula: newAula.sobreAula,
          status: newAula.status,
          objetivos: newAula.objetivosAprendizado,
          materiais: materiaisFormatados,
        }

        const response = await fetch("/api/admin/aulas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(aulaData),
        })

        if (response.ok) {
          alert("Aula criada com sucesso!")
          await loadAulas() // Recarregar lista
          setShowCreateAulaModal(false)
          setNewAula({
            titulo: "",
            descricao: "",
            duracao: "60",
            modulo: "",
            ordem: "1",
            videoUrl: "",
            capaUrl: "",
            objetivosAprendizado: [],
            sobreAula: "",
            materiaisComplementares: [],
            status: "rascunho",
          })
          setMaterialInput("")
          setObjetivoInput("")
        } else {
          const error = await response.json()
          alert(`Erro ao criar aula: ${error.error}`)
        }
      } catch (error) {
        console.error("[v0] Erro ao criar aula:", error)
        alert("Erro ao criar aula")
      } finally {
        setCreating(false)
      }
    }

    const handleEditAula = (aula: any) => {
      setEditingAula({
        ...aula,
        capaUrl: aula.thumbnail_url,
        videoUrl: aula.video_url,
        sobreAula: aula.sobre_aula,
        objetivosAprendizado: aula.objetivos?.map((obj: any) => obj.objetivo) || [],
        materiaisComplementares: aula.materiais?.map((mat: any) => `${mat.tipo} - ${mat.titulo}`) || [],
      })
      setShowEditAulaModal(true)
    }

    const handleUpdateAula = async () => {
      setSaving(true)
      try {
        // Preparar materiais com estrutura correta
        const materiaisFormatados = editingAula.materiaisComplementares.map((m: any) => {
          if (typeof m === "string") {
            const [tipo, titulo] = m.includes(" - ") ? m.split(" - ") : ["link", m]
            return {
              titulo: titulo || m,
              tipo: tipo.toLowerCase() || "link",
              url: m,
              tamanho: null,
            }
          }
          return m
        })

        const videoUrlEmbed = convertToYouTubeEmbed(editingAula.videoUrl)

        const aulaData = {
          titulo: editingAula.titulo,
          descricao: editingAula.descricao,
          modulo: editingAula.modulo,
          ordem: editingAula.ordem,
          duracao: Number.parseInt(editingAula.duracao) || 60,
          thumbnail_url: editingAula.capaUrl,
          video_url: videoUrlEmbed,
          sobre_aula: editingAula.sobreAula,
          status: editingAula.status,
          objetivos: editingAula.objetivosAprendizado,
          materiais: materiaisFormatados,
        }

        const response = await fetch(`/api/admin/aulas/${editingAula.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(aulaData),
        })

        if (response.ok) {
          alert("Aula atualizada com sucesso!")
          await loadAulas()
          setShowEditAulaModal(false)
          setEditingAula(null)
        } else {
          const error = await response.json()
          alert(`Erro ao atualizar aula: ${error.error}`)
        }
      } catch (error) {
        console.error("[v0] Erro ao atualizar aula:", error)
        alert("Erro ao atualizar aula")
      } finally {
        setSaving(false)
      }
    }

    const handleDeleteAula = async (id: number) => {
      if (!confirm("Tem certeza que deseja excluir esta aula?")) return

      try {
        const response = await fetch(`/api/admin/aulas/${id}`, {
          method: "DELETE",
        })

        if (response.ok) {
          alert("Aula excluída com sucesso!")
          await loadAulas()
        } else {
          const error = await response.json()
          alert(`Erro ao excluir aula: ${error.error}`)
        }
      } catch (error) {
        console.error("[v0] Erro ao excluir aula:", error)
        alert("Erro ao excluir aula")
      }
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gerenciar Aulas</h1>
            <p className="text-gray-600">Adicione, edite e organize o conteúdo do curso</p>
          </div>
          <Button onClick={() => setShowCreateAulaModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Aula
          </Button>
        </div>

        {loadingAulas ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aulas
              .sort((a, b) => a.ordem - b.ordem)
              .map((aula, index) => (
                <Card key={aula.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            #{aula.ordem}
                          </Badge>
                          <CardTitle className="text-lg">{aula.titulo}</CardTitle>
                        </div>
                        <Badge variant={aula.status === "publicado" ? "default" : "secondary"} className="mb-2">
                          {aula.status === "publicado" ? "Publicada" : "Rascunho"}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveAulaUp(index)}
                          disabled={index === 0}
                          title="Mover para cima"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveAulaDown(index)}
                          disabled={index === aulas.length - 1}
                          title="Mover para baixo"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditAula(aula)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAula(aula.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {aula.thumbnail_url ? (
                      <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={aula.thumbnail_url || "/placeholder.svg"}
                          alt={aula.titulo}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/video-thumbnail.png"
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                        <Play className="h-8 w-8 text-white opacity-80" />
                      </div>
                    )}
                    <p className="text-sm text-gray-600 line-clamp-2">{aula.descricao}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">{aula.modulo}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">{aula.duracao} minutos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">{aula.objetivos?.length || 0} objetivos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">{aula.materiais?.length || 0} materiais</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}

        {/* Modal: Criar Aula */}
        {showCreateAulaModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Nova Aula</h2>
                  <button onClick={() => setShowCreateAulaModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-3">Informações Básicas</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Título da Aula *</label>
                        <Input
                          value={newAula.titulo}
                          onChange={(e) => setNewAula({ ...newAula, titulo: e.target.value })}
                          placeholder="Ex: Introdução ao iGaming"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Descrição Curta (Exibida na Lista)
                        </label>
                        <Input
                          value={newAula.descricao}
                          onChange={(e) => setNewAula({ ...newAula, descricao: e.target.value })}
                          placeholder="Resumo breve da aula"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Módulo</label>
                          <Input
                            value={newAula.modulo}
                            onChange={(e) => setNewAula({ ...newAula, modulo: e.target.value })}
                            placeholder="Ex: Módulo 1 - Fundamentos"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Duração (min)</label>
                          <Input
                            type="number"
                            value={newAula.duracao}
                            onChange={(e) => setNewAula({ ...newAula, duracao: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={newAula.status}
                          onChange={(e) => setNewAula({ ...newAula, status: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="rascunho">Rascunho</option>
                          <option value="publicada">Publicada</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="font-semibold text-purple-900 mb-3">Mídia e Conteúdo</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL da Capa/Thumbnail</label>
                        <Input
                          value={newAula.capaUrl}
                          onChange={(e) => setNewAula({ ...newAula, capaUrl: e.target.value })}
                          placeholder="https://... ou /placeholder.svg?query=..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Imagem exibida na lista de aulas (recomendado: 320x180px)
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL do Vídeo *</label>
                        <Input
                          value={newAula.videoUrl}
                          onChange={(e) => setNewAula({ ...newAula, videoUrl: e.target.value })}
                          placeholder="https://youtube.com/watch?v=... ou https://youtu.be/..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Cole qualquer link do YouTube - será convertido automaticamente para o formato embed
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-3">Sobre Esta Aula</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição Detalhada</label>
                        <Textarea
                          value={newAula.sobreAula}
                          onChange={(e) => setNewAula({ ...newAula, sobreAula: e.target.value })}
                          rows={4}
                          placeholder="Descrição completa exibida na página da aula..."
                        />
                        <p className="text-xs text-gray-500 mt-1">Texto exibido na seção "Sobre esta aula"</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">O Que Você Vai Aprender</label>
                        <div className="space-y-2">
                          {newAula.objetivosAprendizado.map((objetivo, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-2 bg-white p-3 rounded border border-green-200"
                            >
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="flex-1 text-sm">{objetivo}</span>
                              <button onClick={() => removeObjetivo(index)} className="text-red-500 hover:text-red-700">
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          <div className="flex gap-2">
                            <Input
                              value={objetivoInput}
                              onChange={(e) => setObjetivoInput(e.target.value)}
                              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addObjetivo())}
                              placeholder="Ex: Fundamentos essenciais do tema"
                            />
                            <Button onClick={addObjetivo} variant="outline" type="button">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500">Lista exibida na seção "O que você vai aprender"</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h3 className="font-semibold text-orange-900 mb-3">Materiais Complementares</h3>
                    <div className="space-y-2">
                      {newAula.materiaisComplementares.map((material, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 bg-white p-2 rounded border border-orange-200"
                        >
                          <Paperclip className="h-4 w-4 text-orange-600" />
                          <span className="flex-1 text-sm">
                            {typeof material === "string" ? material : material.titulo || material.arquivo_nome}
                          </span>
                          <button onClick={() => removeMaterial(index)} className="text-red-500 hover:text-red-700">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Input
                          value={materialInput}
                          onChange={(e) => setMaterialInput(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addMaterial())}
                          placeholder="Ex: PDF - Glossário | Link - Artigo"
                          className="flex-1"
                        />
                        <Button onClick={addMaterial} variant="outline" type="button">
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => document.getElementById("material-file-input")?.click()}
                          className="gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          Arquivo
                        </Button>
                        <input
                          id="material-file-input"
                          type="file"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,image/*"
                          onChange={handleFileUploadMaterial}
                          className="hidden"
                        />
                      </div>
                      <p className="text-xs text-gray-500">PDFs, links, templates e outros recursos para download</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button onClick={() => setShowCreateAulaModal(false)} variant="outline" className="flex-1">
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreateAula}
                    disabled={!newAula.titulo || !newAula.videoUrl || creating}
                    className="flex-1"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Aula
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Editar Aula */}
        {showEditAulaModal && editingAula && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Editar Aula</h2>
                  <button onClick={() => setShowEditAulaModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-3">Informações Básicas</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Título da Aula *</label>
                        <Input
                          value={editingAula.titulo}
                          onChange={(e) => setEditingAula({ ...editingAula, titulo: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Descrição Curta (Exibida na Lista)
                        </label>
                        <Input
                          value={editingAula.descricao}
                          onChange={(e) => setEditingAula({ ...editingAula, descricao: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Módulo</label>
                          <Input
                            value={editingAula.modulo}
                            onChange={(e) => setEditingAula({ ...editingAula, modulo: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Duração (min)</label>
                          <Input
                            type="number"
                            value={editingAula.duracao}
                            onChange={(e) => setEditingAula({ ...editingAula, duracao: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ordem de Exibição</label>
                        <Input
                          type="number"
                          min="1"
                          value={editingAula.ordem}
                          onChange={(e) => setEditingAula({ ...editingAula, ordem: e.target.value })}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Você também pode usar os botões de seta no card da aula
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={editingAula.status}
                          onChange={(e) => setEditingAula({ ...editingAula, status: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="rascunho">Rascunho</option>
                          <option value="publicada">Publicada</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="font-semibold text-purple-900 mb-3">Mídia e Conteúdo</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL da Capa/Thumbnail</label>
                        <Input
                          value={editingAula.capaUrl || ""}
                          onChange={(e) => setEditingAula({ ...editingAula, capaUrl: e.target.value })}
                          placeholder="https://... ou /placeholder.svg?query=..."
                        />
                        {editingAula.capaUrl && (
                          <div className="mt-2 w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={editingAula.capaUrl || "/placeholder.svg"}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL do Vídeo *</label>
                        <Input
                          value={editingAula.videoUrl}
                          onChange={(e) => setEditingAula({ ...editingAula, videoUrl: e.target.value })}
                          placeholder="https://youtube.com/watch?v=... ou https://youtu.be/..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Cole qualquer link do YouTube - será convertido automaticamente para o formato embed
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-3">Sobre Esta Aula</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição Detalhada</label>
                        <Textarea
                          value={editingAula.sobreAula || ""}
                          onChange={(e) => setEditingAula({ ...editingAula, sobreAula: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">O Que Você Vai Aprender</label>
                        <div className="space-y-2">
                          {(editingAula.objetivosAprendizado || []).map((objetivo: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-start gap-2 bg-white p-3 rounded border border-green-200"
                            >
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="flex-1 text-sm">{objetivo}</span>
                              <button onClick={() => removeObjetivo(index)} className="text-red-500 hover:text-red-700">
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          <div className="flex gap-2">
                            <Input
                              value={objetivoInput}
                              onChange={(e) => setObjetivoInput(e.target.value)}
                              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addObjetivo())}
                              placeholder="Ex: Fundamentos essenciais do tema"
                            />
                            <Button onClick={addObjetivo} variant="outline" type="button">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h3 className="font-semibold text-orange-900 mb-3">Materiais Complementares</h3>
                    <div className="space-y-2">
                      {(editingAula.materiaisComplementares || []).map((material: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 bg-white p-2 rounded border border-orange-200"
                        >
                          <Paperclip className="h-4 w-4 text-orange-600" />
                          <span className="flex-1 text-sm">{material}</span>
                          <button onClick={() => removeMaterial(index)} className="text-red-500 hover:text-red-700">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Input
                          value={materialInput}
                          onChange={(e) => setMaterialInput(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addMaterial())}
                          placeholder="Ex: PDF - Glossário"
                        />
                        <Button onClick={addMaterial} variant="outline" type="button">
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => document.getElementById("material-file-input")?.click()}
                          className="gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          Arquivo
                        </Button>
                        <input
                          id="material-file-input"
                          type="file"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,image/*"
                          onChange={handleFileUploadMaterial}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button onClick={() => setShowEditAulaModal(false)} variant="outline" className="flex-1">
                    Cancelar
                  </Button>
                  <Button onClick={handleUpdateAula} disabled={!editingAula.titulo || saving} className="flex-1">
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Salvar Alterações
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderComentariosSection = () => {
    if (selectedAulaComentarios) {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setSelectedAulaComentarios(null)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedAulaComentarios.aula_titulo}</h1>
              <p className="text-gray-600">{selectedAulaComentarios.total_comentarios} comentário(s) nesta aula</p>
            </div>
          </div>

          <div className="space-y-4">
            {selectedAulaComentarios.comentarios.map((comentario: any) => (
              <Card key={comentario.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{comentario.mentorado_nome}</CardTitle>
                        <p className="text-sm text-gray-500">{comentario.mentorado_email}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(comentario.created_at).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "America/Sao_Paulo",
                      })}
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{comentario.comentario}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comentários das Aulas</h1>
          <p className="text-gray-600">Visualize todos os comentários dos mentorados por aula</p>
        </div>

        {loadingComentarios ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : comentarios.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum comentário registrado ainda</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comentarios.map((aulaComentario: any) => (
              <Card
                key={aulaComentario.aula_id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedAulaComentarios(aulaComentario)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{aulaComentario.aula_titulo}</CardTitle>
                  {aulaComentario.modulo && (
                    <Badge variant="outline" className="w-fit">
                      {aulaComentario.modulo}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MessageSquare className="h-5 w-5" />
                    <span className="font-medium">{aulaComentario.total_comentarios}</span>
                    <span>comentário(s)</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Clique para visualizar detalhes</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  const loadComentarios = async () => {
    setLoadingComentarios(true)
    try {
      const response = await fetch("/api/admin/comentarios")
      const data = await response.json()
      setComentarios(data.comentariosPorAula || [])
    } catch (error: any) {
      console.error("[v0] Erro ao buscar comentários:", error.message)
    } finally {
      setLoadingComentarios(false)
    }
  }

  // Renderiza o cabeçalho da página
  const renderHeader = () => (
    <header className="bg-white shadow-sm border-b border-gray-200 py-4 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Seção de busca */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input type="text" placeholder="Pesquisar..." className="pl-10 w-64" />
        </div>
      </div>

      {/* Informações do usuário e logout */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-gray-100">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="hidden sm:flex items-center gap-2">
          <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {adminEmail.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-sm text-gray-900">{adminEmail}</p>
            <p className="text-xs text-gray-500">Administrador</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleLogout} className="text-red-600 border-red-200 bg-transparent">
          Sair
        </Button>
      </div>
    </header>
  )

  // Renderiza o conteúdo principal com base na seção ativa
  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return renderDashboard()
      case "agenda":
        return renderAgendaSection()
      case "logs":
        return renderLogsSection()
      case "avaliacoes":
        return renderAvaliacoes()
      case "tasks":
        return renderTasksSection()
      case "whatsapp":
        return <WhatsAppTest />
      case "aulas":
        return renderAulasSection()
      case "comentarios":
        return renderComentariosSection()
      case "minhas-demandas":
        return <MinhasDemandas />
      // Adicionar outros casos conforme necessário
      default:
        return <div>Seção não encontrada</div>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {renderSidebar()}

      <div className="flex-1 lg:ml-64">
        {renderHeader()}

        <main className="p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </main>
      </div>

      {/* Modal de edição de reunião */}
      {showEditMeetingModal && editingMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Editar Reunião</h2>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowEditMeetingModal(false)
                  setEditingMeeting(null)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Mentorado</label>
                <select
                  value={editingMeeting.mentorado_id}
                  onChange={(e) => setEditingMeeting({ ...editingMeeting, mentorado_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione um mentorado</option>
                  {mentorados.map((mentorado) => (
                    <option key={mentorado.id} value={mentorado.id}>
                      {mentorado.nome} - {mentorado.empresa}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Mentor Responsável</label>
                <select
                  value={editingMeeting.admin_id}
                  onChange={(e) => setEditingMeeting({ ...editingMeeting, admin_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {admins.map((admin) => (
                    <option key={admin.id} value={admin.id}>
                      {admin.nome}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Selecione qual mentor conduzirá esta reunião</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Título da Call</label>
                  <Input
                    value={editingMeeting.titulo}
                    onChange={(e) => setEditingMeeting({ ...editingMeeting, titulo: e.target.value })}
                    placeholder="Ex: Mentoria - Alinhamento inicial"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Link do Google Meet (opcional)</label>
                  <Input
                    type="url"
                    value={editingMeeting.meet_link || ""}
                    onChange={(e) => setEditingMeeting({ ...editingMeeting, meet_link: e.target.value })}
                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  />
                  <p className="text-xs text-gray-500 mt-1">Cole o link da reunião do Google Meet</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Data</label>
                    <Input
                      type="date"
                      value={editingMeeting.data}
                      onChange={(e) => setEditingMeeting({ ...editingMeeting, data: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Horário</label>
                    <Input
                      type="time"
                      value={editingMeeting.horario}
                      onChange={(e) => setEditingMeeting({ ...editingMeeting, horario: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Duração (minutos)</label>
                <select
                  value={editingMeeting.duracao}
                  onChange={(e) =>
                    setEditingMeeting({
                      ...editingMeeting,
                      duracao: Number.parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={30}>30 minutos</option>
                  <option value={60}>60 minutos</option>
                  <option value={90}>90 minutos</option>
                  <option value={120}>120 minutos</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Planejamento da Call (opcional)</label>
                <textarea
                  value={editingMeeting.planejamento || ""}
                  onChange={(e) =>
                    setEditingMeeting({
                      ...editingMeeting,
                      planejamento: e.target.value,
                    })
                  }
                  placeholder="Descreva os tópicos que devem ser abordados nesta call..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-y"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Adicione anotações sobre o que precisa ser discutido ou objetivos da reunião
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <select
                  value={editingMeeting.status || "agendada"}
                  onChange={(e) => setEditingMeeting({ ...editingMeeting, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="agendada">Agendada</option>
                  <option value="concluida">Concluída</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={handleUpdateMeeting} disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700">
                {saving ? "Atualizando..." : "Salvar Alterações"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditMeetingModal(false)
                  setEditingMeeting(null)
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {editingMentorado !== null && (
        <Dialog open={editingMentorado !== null} onOpenChange={() => setEditingMentorado(null)}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Personalizar - {mentorados.find((m) => m.id === editingMentorado)?.nome}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto space-y-6 pt-4 pr-2">
              {/* Tabs */}
              <div className="flex border-b gap-1 overflow-x-auto pb-px">
                <button
                  onClick={() => setActiveTab("geral")}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === "geral"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Geral
                </button>
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === "dashboard"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab("cards")}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === "cards"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setActiveTab("agenda")}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === "agenda"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Agenda
                </button>
                <button
                  onClick={() => setActiveTab("empresa")}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === "empresa"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Empresa
                </button>
                <button
                  onClick={() => setActiveTab("resumo")}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === "resumo"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Resumo
                </button>
                <button
                  onClick={() => setActiveTab("comentarios")}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === "comentarios"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Comentários
                </button>
              </div>

              {/* Tab Content - Geral */}
              {activeTab === "geral" && (
                <div className="space-y-6">
                  <h3 className="font-semibold text-lg">Informações Gerais</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-fase">Fase Atual</Label>
                      <select
                        id="edit-fase"
                        value={editingData.faseAtual}
                        onChange={(e) => setEditingData({ ...editingData, faseAtual: e.target.value })}
                        className="w-full p-2 border rounded-md transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Alinhamento">Alinhamento</option>
                        <option value="Planejamento">Planejamento</option>
                        <option value="Estruturação">Estruturação</option>
                        <option value="Execução">Execução</option>
                        <option value="Consolidação">Consolidação</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="edit-progresso">Progresso (%)</Label>
                      <Input
                        id="edit-progresso"
                        type="number"
                        value={editingData.progresso || 0}
                        onChange={(e) => setEditingData({ ...editingData, progresso: Number(e.target.value) })}
                        min="0"
                        max="100"
                        className="transition-all focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="edit-calls">Calls Realizadas</Label>
                    <Input
                      id="edit-calls"
                      type="number"
                      value={editingData.callsRealizadas || 0}
                      onChange={(e) => setEditingData({ ...editingData, callsRealizadas: Number(e.target.value) })}
                      min="0"
                      className="transition-all focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Tab Content - Dashboard */}
              {activeTab === "dashboard" && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Configurações do Dashboard</h3>
                  <div>
                    <Label htmlFor="edit-saudacao">Saudação</Label>
                    <Input
                      id="edit-saudacao"
                      value={editingData.saudacao || ""}
                      onChange={(e) => setEditingData({ ...editingData, saudacao: e.target.value })}
                      className="transition-all focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-subtitulo">Subtítulo</Label>
                    <Input
                      id="edit-subtitulo"
                      value={editingData.subtitulo || ""}
                      onChange={(e) => setEditingData({ ...editingData, subtitulo: e.target.value })}
                      className="transition-all focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Tab Content - Cards */}
              {activeTab === "cards" && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Configurações dos Cards</h3>
                  <div>
                    <Label htmlFor="edit-card-concluido-titulo">Título Card Concluído</Label>
                    <Input
                      id="edit-card-concluido-titulo"
                      value={editingData.cardConcluido?.titulo || ""}
                      onChange={(e) =>
                        setEditingData({
                          ...editingData,
                          cardConcluido: { ...editingData.cardConcluido, titulo: e.target.value },
                        })
                      }
                      className="transition-all focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-card-concluido-texto">Texto Card Concluído</Label>
                    <Textarea
                      id="edit-card-concluido-texto"
                      value={editingData.cardConcluido?.texto || ""}
                      onChange={(e) =>
                        setEditingData({
                          ...editingData,
                          cardConcluido: { ...editingData.cardConcluido, texto: e.target.value },
                        })
                      }
                      rows={3}
                      className="transition-all focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Tab Content - Agenda */}
              {activeTab === "agenda" && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Configurações de Agenda</h3>
                  <p className="text-sm text-gray-500">Configurações de agenda em desenvolvimento</p>
                </div>
              )}

              {/* Tab Content - Empresa */}
              {activeTab === "empresa" && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Status da Empresa</h3>
                  <p className="text-sm text-gray-500">Configurações de empresa em desenvolvimento</p>
                </div>
              )}

              {/* Tab Content - Resumo */}
              {activeTab === "resumo" && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Resumo da Mentoria</h3>
                  <p className="text-sm text-gray-500">Resumo em desenvolvimento</p>
                </div>
              )}

              {/* Tab Content - Comentários */}
              {activeTab === "comentarios" && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Anotações e Comentários</h3>
                  <p className="text-sm text-gray-500">Comentários em desenvolvimento</p>
                </div>
              )}
            </div>
            <DialogFooter className="flex gap-2 pt-4 border-t mt-4">
              <Button variant="outline" onClick={() => setEditingMentorado(null)}>
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  const mentorado = mentorados.find((m) => m.id === editingMentorado)
                  if (mentorado) handleSavePersonalizacao(mentorado)
                }}
                disabled={saving}
              >
                {saving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {showCreateModal && (
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Novo Mentorado</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-nome">Nome *</Label>
                <Input
                  id="new-nome"
                  value={newMentorado.nome}
                  onChange={(e) => setNewMentorado({ ...newMentorado, nome: e.target.value })}
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <Label htmlFor="new-empresa">Empresa *</Label>
                <Input
                  id="new-empresa"
                  value={newMentorado.empresa}
                  onChange={(e) => setNewMentorado({ ...newMentorado, empresa: e.target.value })}
                  placeholder="Nome da empresa"
                />
              </div>
              <div>
                <Label htmlFor="new-email">Email *</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newMentorado.email}
                  onChange={(e) => setNewMentorado({ ...newMentorado, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="new-telefone">Telefone</Label>
                <Input
                  id="new-telefone"
                  value={newMentorado.telefone}
                  onChange={(e) => setNewMentorado({ ...newMentorado, telefone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="new-anotacoes">Anotações Iniciais</Label>
                <Textarea
                  id="new-anotacoes"
                  value={newMentorado.anotacoes}
                  onChange={(e) => setNewMentorado({ ...newMentorado, anotacoes: e.target.value })}
                  placeholder="Adicione observações sobre o mentorado..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false)
                  setNewMentorado({
                    nome: "",
                    empresa: "",
                    email: "",
                    telefone: "",
                    anotacoes: "",
                  })
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleCreateMentorado} disabled={creating} className="flex-1">
                {creating ? "Criando..." : "Criar Mentorado"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {showCreateMeetingModal && (
        <Dialog open={showCreateMeetingModal} onOpenChange={setShowCreateMeetingModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nova Reunião</DialogTitle>
              <DialogDescription>Agende uma nova reunião com um mentorado</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Mentorado</label>
                <select
                  value={newMeeting.mentorado_id}
                  onChange={(e) => setNewMeeting({ ...newMeeting, mentorado_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Selecione um mentorado</option>
                  {mentorados.map((mentorado) => (
                    <option key={mentorado.id} value={mentorado.id}>
                      {mentorado.nome} - {mentorado.empresa}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Mentor Responsável</label>
                <select
                  value={newMeeting.admin_id}
                  onChange={(e) => setNewMeeting({ ...newMeeting, admin_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {admins.map((admin) => (
                    <option key={admin.id} value={admin.id}>
                      {admin.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Título da Call</label>
                <Input
                  value={newMeeting.titulo}
                  onChange={(e) => setNewMeeting({ ...newMeeting, titulo: e.target.value })}
                  placeholder="Ex: Mentoria - Alinhamento inicial"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Link do Google Meet (opcional)</label>
                <Input
                  type="url"
                  value={newMeeting.meet_link}
                  onChange={(e) => setNewMeeting({ ...newMeeting, meet_link: e.target.value })}
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Data</label>
                  <Input
                    type="date"
                    value={newMeeting.data}
                    onChange={(e) => setNewMeeting({ ...newMeeting, data: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Horário</label>
                  <Input
                    type="time"
                    value={newMeeting.horario}
                    onChange={(e) => setNewMeeting({ ...newMeeting, horario: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Duração (minutos)</label>
                <select
                  value={newMeeting.duracao}
                  onChange={(e) => setNewMeeting({ ...newMeeting, duracao: Number.parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value={30}>30 minutos</option>
                  <option value={60}>60 minutos</option>
                  <option value={90}>90 minutos</option>
                  <option value={120}>120 minutos</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Planejamento da Call (opcional)</label>
                <textarea
                  value={newMeeting.planejamento}
                  onChange={(e) => setNewMeeting({ ...newMeeting, planejamento: e.target.value })}
                  placeholder="Descreva os tópicos que devem ser abordados..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[80px]"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateMeeting} disabled={saving} className="flex-1">
                  {saving ? "Criando..." : "Criar Reunião"}
                </Button>
                <Button variant="outline" onClick={() => setShowCreateMeetingModal(false)} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
