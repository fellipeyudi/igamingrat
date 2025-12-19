"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link" // Import Link
import {
  Calendar,
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  ArrowRight,
  MessageSquare,
  Target,
  Check,
  LogOut,
  Star,
  Play,
  BookOpen,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const AULAS_MOCKADAS = [
  {
    id: 1,
    titulo: "Introdução ao iGaming",
    descricao: "Conceitos básicos e fundamentos do mercado de iGaming",
    modulo: "Módulo 1 - Fundamentos",
    duracao: "60 minutos",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    ordem: 1,
    concluida: true,
    progresso: 100,
    materiais: [
      { nome: "Slides da Aula 1.pdf", url: "#" },
      { nome: "Exercícios.pdf", url: "#" },
    ],
    comentarios: [
      {
        autor: "Pedro Barros",
        texto: "Ótima introdução! Ficou muito claro.",
        data: "Há 2 dias",
      },
    ],
  },
  {
    id: 2,
    titulo: "Estratégias de Marketing Digital",
    descricao: "Como criar campanhas efetivas para o setor de iGaming",
    modulo: "Módulo 2 - Marketing",
    duracao: "90 minutos",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    ordem: 2,
    concluida: false,
    progresso: 45,
    materiais: [
      { nome: "Guia de Marketing.pdf", url: "#" },
      { nome: "Templates de Campanha.zip", url: "#" },
    ],
    comentarios: [],
  },
  {
    id: 3,
    titulo: "Regulamentação e Compliance",
    descricao: "Aspectos legais e regulatórios do mercado de iGaming",
    modulo: "Módulo 3 - Legal",
    duracao: "75 minutos",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    ordem: 3,
    concluida: false,
    progresso: 0,
    materiais: [{ nome: "Legislação Atual.pdf", url: "#" }],
    comentarios: [],
  },
  {
    id: 4,
    titulo: "Análise de Métricas e KPIs",
    descricao: "Como medir e otimizar o desempenho do seu negócio",
    modulo: "Módulo 4 - Analytics",
    duracao: "80 minutos",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    ordem: 4,
    concluida: false,
    progresso: 0,
    materiais: [],
    comentarios: [],
  },
]

export default function MentoradoDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mentoradoData, setMentoradoData] = useState<any>(null)
  const [aulaAtual, setAulaAtual] = useState<any>(null)
  const [novoComentario, setNovoComentario] = useState("")
  const [aulas, setAulas] = useState<any[]>([])
  const [abaAtiva, setAbaAtiva] = useState<"visao-geral" | "materiais" | "comentarios">("visao-geral")

  const [progressoAulasData, setProgressoAulasData] = useState({ completas: 0, total: 0, percentual: 0 })

  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("mentorado_token")

      if (!token) {
        router.push(`/${slug}/login`)
        return
      }

      try {
        // Verificar se o token é válido e buscar dados do mentorado
        const response = await fetch(`/api/mentorado/${slug}`)
        if (response.ok) {
          const data = await response.json()
          setMentoradoData(data)
          setIsAuthenticated(true)

          await loadAulas()
        } else {
          localStorage.removeItem("mentorado_token")
          router.push(`/${slug}/login`)
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error)
        localStorage.removeItem("mentorado_token")
        router.push(`/${slug}/login`)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [slug, router])

  const loadAulas = async () => {
    try {
      const response = await fetch(`/api/mentorado/${slug}/aulas`)
      if (response.ok) {
        const data = await response.json()
        setAulas(data.aulas || [])

        // Usar progresso que vem do banco
        if (data.progresso) {
          setProgressoAulasData({
            completas: data.progresso.completas,
            total: data.progresso.total,
            percentual: data.progresso.percentual,
          })
        }
      }
    } catch (error) {
      console.error("[v0] Erro ao carregar aulas:", error)
    }
  }

  const handleMarcarConcluida = (aulaId: number) => {
    setAulas(aulas.map((aula) => (aula.id === aulaId ? { ...aula, concluida: true, progresso: 100 } : aula)))
  }

  const handleAdicionarComentario = (aulaId: number) => {
    if (!novoComentario.trim()) return

    setAulas(
      aulas.map((aula) =>
        aula.id === aulaId
          ? {
              ...aula,
              comentarios: [
                ...aula.comentarios,
                {
                  autor: mentoradoData?.nome || "Você",
                  texto: novoComentario,
                  data: "Agora",
                },
              ],
            }
          : aula,
      ),
    )
    setNovoComentario("")
  }

  const handleLogout = () => {
    localStorage.removeItem("mentorado_token")
    router.push(`/${slug}/login`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !mentoradoData) {
    return null
  }

  const mentorado = {
    nome: mentoradoData.nome,
    empresa: mentoradoData.empresa,
    fase: mentoradoData.fase_atual,
    progresso: mentoradoData.progresso,
    callsRealizadas: mentoradoData.calls_realizadas,
  }

  const conquistasRecentes = mentoradoData.conquistas_recentes || []
  const proximosMarcos = mentoradoData.proximos_marcos || []
  const anotacoesMentoria = mentoradoData.anotacoes_mentoria || []
  const statusEmpresa = mentoradoData.status_empresa || {}
  const agendaMentoria = mentoradoData.agenda_mentoria || {}
  const cardConcluido = mentoradoData.card_concluido || { titulo: "Concluído recentemente", texto: "" }
  const cardTrabalhando = mentoradoData.card_trabalhando || { titulo: "Trabalhando agora", texto: "" }

  const todasFases = ["Alinhamento", "Planejamento", "Estruturação", "Otimização", "Escala"]

  const callPendente = mentoradoData.call_pendente || {}
  const saudacaoRaw = mentoradoData.saudacao || `Olá, ${mentorado.nome}!`
  const saudacaoProcessada = saudacaoRaw.replace(/\{nome\}/g, mentorado.nome)
  const saudacao = saudacaoProcessada.startsWith("👋") ? saudacaoProcessada : `👋 ${saudacaoProcessada}`
  const subtitulo = mentoradoData.subtitulo || "Acompanhe seu progresso na mentoria"

  const faseAtual = mentorado.fase || "Alinhamento"
  const faseAtualIndex = todasFases.indexOf(faseAtual)
  const faseAtualIndexSafe = faseAtualIndex >= 0 ? faseAtualIndex : 0

  const totalFases = todasFases.length
  const fasesCompletas = faseAtualIndexSafe

  const progressoPercentual = totalFases > 1 ? Math.round((fasesCompletas / (totalFases - 1)) * 100) : 0

  const proximaFase = todasFases[faseAtualIndexSafe + 1] || "Escala"

  const aulasConcluidasCount = progressoAulasData.completas
  const progressoAulas = progressoAulasData.percentual
  const proximaAula = aulas.find((a) => !a.concluida)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              {saudacao.includes(mentorado.nome) ? saudacao : `${saudacao.replace("!", "")} ${mentorado.nome}!`}
            </h1>
            <p className="text-gray-600">{subtitulo}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => router.push(`/${slug}/satisfacao`)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white flex items-center gap-2"
            >
              <Star className="h-4 w-4" />
              Avaliar Mentoria
            </Button>
            <Button variant="outline" onClick={handleLogout} className="bg-transparent">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <TrendingUp className="h-5 w-5" />
              Status da Mentoria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Bar with Percentage */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-blue-600">{progressoPercentual}%</span>
                    <div className="text-sm text-gray-600">
                      <div className="font-semibold text-base">Fase Atual: {faseAtual}</div>
                      <div className="text-xs text-gray-500">Próxima: {proximaFase}</div>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="border-blue-200 text-blue-700 font-medium px-4 py-1.5">
                  {fasesCompletas}/{totalFases} Fases
                </Badge>
              </div>

              {/* Horizontal Stepper Progress Bar */}
              <div className="relative pt-2">
                {/* Background Track */}
                <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full" />

                {/* Progress Track */}
                <div
                  className="absolute top-5 left-0 h-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: totalFases > 1 ? `${(fasesCompletas / (totalFases - 1)) * 100}%` : "0%",
                  }}
                />

                {/* Steps */}
                <div className="relative flex justify-between">
                  {todasFases.map((fase, index) => {
                    const isCompleted = index < faseAtualIndexSafe
                    const isCurrent = index === faseAtualIndexSafe
                    const isPending = index > faseAtualIndexSafe

                    return (
                      <div key={index} className="flex flex-col items-center" style={{ flex: 1 }}>
                        {/* Circle */}
                        <div
                          className={`
                            relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-semibold text-xs border-3 transition-all duration-300
                            ${
                              isCompleted
                                ? "bg-emerald-500 border-white text-white shadow-md"
                                : isCurrent
                                  ? "bg-blue-500 border-white text-white shadow-lg"
                                  : "bg-white border-gray-300 text-gray-400"
                            }
                          `}
                        >
                          {isCompleted ? <Check className="h-5 w-5" /> : index + 1}
                        </div>

                        {/* Label */}
                        <span
                          className={`
                            text-xs mt-2 font-medium text-center max-w-20 transition-colors duration-300
                            ${
                              isCompleted
                                ? "text-emerald-600"
                                : isCurrent
                                  ? "text-blue-600 font-semibold"
                                  : "text-gray-400"
                            }
                          `}
                        >
                          {fase}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-800">{cardConcluido.titulo}</h4>
                    <p className="text-sm text-green-700 mt-1">{cardConcluido.texto}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <ArrowRight className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-800">{cardTrabalhando.titulo}</h4>
                    <p className="text-sm text-blue-700 mt-1">{cardTrabalhando.texto}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Agenda de Mentoria
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-700 mb-1">{mentorado.callsRealizadas}</div>
                  <div className="text-sm text-blue-600 font-medium">Calls Realizadas</div>
                </div>
              </div>

              {agendaMentoria.mensagem_inicial && !agendaMentoria.ultimas_calls && !agendaMentoria.proxima_call ? (
                <div className="text-center py-6 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">{agendaMentoria.mensagem_inicial}</p>
                </div>
              ) : (
                <>
                  {agendaMentoria.ultimas_calls && agendaMentoria.ultimas_calls.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Últimas Calls Realizadas</h4>
                      <div className="space-y-2">
                        {agendaMentoria.ultimas_calls.map((call: any, index: number) => (
                          <div
                            key={index}
                            className="bg-gradient-to-r from-emerald-50 to-green-50 border-l-4 border-emerald-500 rounded-lg p-3 shadow-sm"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2 text-sm text-emerald-700 font-medium">
                                <Calendar className="h-4 w-4" />
                                {call.data}
                                {call.horario && (
                                  <>
                                    <Clock className="h-4 w-4 ml-2" />
                                    {call.horario}
                                  </>
                                )}
                              </div>
                              <CheckCircle className="h-5 w-5 text-emerald-600" />
                            </div>
                            <p className="text-sm font-semibold text-emerald-900">{call.titulo}</p>
                            {call.observacoes && (
                              <p className="text-xs text-emerald-700 mt-1 italic">{call.observacoes}</p>
                            )}
                            {call.meet_link && (
                              <a
                                href={call.meet_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-800 mt-2 font-medium hover:underline"
                              >
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                  />
                                </svg>
                                Ver gravação/link
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {agendaMentoria.proxima_call && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-blue-800">Próxima Call Agendada</h4>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-blue-700 mb-2">
                        <Calendar className="h-4 w-4" />
                        {agendaMentoria.proxima_call.data}
                        {agendaMentoria.proxima_call.horario && (
                          <>
                            <Clock className="h-4 w-4 ml-2" />
                            {agendaMentoria.proxima_call.horario}
                          </>
                        )}
                      </div>
                      <p className="text-sm text-blue-700 mb-2">{agendaMentoria.proxima_call.titulo}</p>
                      {agendaMentoria.proxima_call.meet_link && (
                        <a
                          href={agendaMentoria.proxima_call.meet_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                          </svg>
                          Entrar no Google Meet
                        </a>
                      )}
                    </div>
                  )}

                  {callPendente && callPendente.titulo && callPendente.titulo.trim() !== "" && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-orange-800">Call Pendente</h4>
                          <p className="text-sm text-orange-700">{callPendente.titulo}</p>
                        </div>
                        <Badge variant="outline" className="border-orange-300 text-orange-700">
                          {callPendente.status || "A definir"}
                        </Badge>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Status da Empresa */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Status da Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Estágio Atual: {faseAtual}</h4>
                <p className="text-sm text-gray-600 mb-4">
                  {statusEmpresa.descricao_fase || "Sua empresa está em desenvolvimento."}
                </p>

                {statusEmpresa.checklist && (
                  <div className="space-y-2">
                    {statusEmpresa.checklist.map((item: any, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        {item.concluido ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <div className="h-4 w-4 bg-blue-600 rounded-full" />
                        )}
                        <span className="text-sm text-gray-700">{item.item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {statusEmpresa.proxima_fase && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Próxima Fase: {statusEmpresa.proxima_fase}</h4>
                  <p className="text-sm text-gray-600">
                    {statusEmpresa.descricao_proxima || "Próxima etapa do desenvolvimento."}
                  </p>
                </div>
              )}

              {statusEmpresa.acao_prioritaria && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Target className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-orange-800">Ação Prioritária</h4>
                      <p className="text-sm text-orange-700 mt-1">{statusEmpresa.acao_prioritaria}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Aulas e Conteúdo - REMOVIDO - Agora é uma página dedicada em /aulas */}
        {/* <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Aulas e Conteúdo
              </CardTitle>
              <Badge variant="outline" className="border-blue-200 text-blue-700 font-medium">
                {aulasConcluidasCount}/{aulas.length} concluídas ({progressoAulas}%)
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col lg:flex-row min-h-[600px]">
              {/* Sidebar de Aulas */}
        {/* <div
                className={`w-full lg:w-80 border-b lg:border-b-0 lg:border-r bg-gray-50/50 overflow-y-auto max-h-[600px] ${aulaAtual ? "hidden lg:block" : "block"}`}
              >
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm text-gray-700">Módulos e Aulas</h3>
                    <span className="text-xs text-gray-500">
                      {aulasConcluidasCount}/{aulas.length}
                    </span>
                  </div>

                  {aulas.map((aula) => (
                    <button
                      key={aula.id}
                      onClick={() => {
                        setAulaAtual(aula)
                        setAbaAtiva("visao-geral") // Reset tab when changing lesson
                      }}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        aulaAtual?.id === aula.id
                          ? "bg-blue-600 text-white shadow-md"
                          : aula.concluida
                            ? "bg-green-50 hover:bg-green-100 border border-green-200"
                            : "bg-white hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                            aulaAtual?.id === aula.id
                              ? "bg-white text-blue-600"
                              : aula.concluida
                                ? "bg-green-600 text-white"
                                : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {aula.concluida ? <CheckCircle className="h-4 w-4" /> : aula.ordem}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium truncate ${aulaAtual?.id === aula.id ? "text-white" : "text-gray-900"}`}
                          >
                            {aula.titulo}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-xs flex items-center gap-1 ${aulaAtual?.id === aula.id ? "text-blue-100" : "text-gray-500"}`}
                            >
                              <Clock className="h-3 w-3" />
                              {aula.duracao}
                            </span>
                            {aula.progresso > 0 && !aula.concluida && (
                              <span
                                className={`text-xs ${aulaAtual?.id === aula.id ? "text-blue-100" : "text-gray-500"}`}
                              >
                                {aula.progresso}%
                              </span>
                            )}
                          </div>
                          {aula.progresso > 0 && aula.progresso < 100 && (
                            <Progress
                              value={aula.progresso}
                              className={`h-1 mt-2 ${aulaAtual?.id === aula.id ? "bg-blue-500" : ""}`}
                            />
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Área Principal de Conteúdo */}
        {/* <div className="flex-1 overflow-y-auto max-h-[600px]">
                {!aulaAtual ? (
                  <div className="p-8 text-center">
                    <div className="max-w-md mx-auto">
                      <Play className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Selecione uma aula</h3>
                      <p className="text-gray-600 mb-6">
                        Escolha uma aula na lista ao lado para começar seu aprendizado
                      </p>
                      {proximaAula && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                          <Badge className="bg-blue-600 text-white mb-2">Próxima Aula</Badge>
                          <h4 className="font-semibold text-gray-900 mb-1">{proximaAula.titulo}</h4>
                          <p className="text-sm text-gray-600 mb-3">{proximaAula.modulo}</p>
                          <Button
                            onClick={() => {
                              setAulaAtual(proximaAula)
                              setAbaAtiva("visao-geral")
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Começar Agora
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 space-y-6">
                    {/* Botão Voltar Mobile */}
        {/* <Button onClick={() => setAulaAtual(null)} variant="ghost" className="lg:hidden mb-4">
                      <ChevronRight className="h-4 w-4 rotate-180 mr-2" />
                      Voltar para lista
                    </Button>

                    {/* Video Player */}
        {/* <div className="bg-black rounded-lg overflow-hidden aspect-video">
                      <iframe
                        src={aulaAtual.videoUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>

                    {/* Header da Aula */}
        {/* <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <Badge variant="outline" className="mb-2">
                          {aulaAtual.modulo}
                        </Badge>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{aulaAtual.titulo}</h2>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {aulaAtual.duracao}
                          </span>
                          {aulaAtual.comentarios.length > 0 && (
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4" />
                              {aulaAtual.comentarios.length} comentários
                            </span>
                          )}
                        </div>
                      </div>
                      {!aulaAtual.concluida && (
                        <Button
                          onClick={() => handleMarcarConcluida(aulaAtual.id)}
                          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Marcar como Concluída
                        </Button>
                      )}
                      {aulaAtual.concluida && (
                        <Badge className="bg-green-600 text-white px-4 py-2">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Concluída
                        </Badge>
                      )}
                    </div>

                    {/* Progresso */}
        {/* {aulaAtual.progresso > 0 && aulaAtual.progresso < 100 && (
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="font-medium text-gray-700">Seu progresso</span>
                          <span className="text-gray-600">{aulaAtual.progresso}%</span>
                        </div>
                        <Progress value={aulaAtual.progresso} className="h-2" />
                      </div>
                    )}

                    {/* Tabs de Conteúdo */}
        {/* <div className="border-t pt-6">
                      <div className="flex gap-4 border-b mb-6">
                        <button
                          onClick={() => setAbaAtiva("visao-geral")}
                          className={`pb-3 px-1 font-medium text-sm transition-colors border-b-2 ${
                            abaAtiva === "visao-geral"
                              ? "border-blue-600 text-blue-600"
                              : "border-transparent text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          Visão Geral
                        </button>
                        <button
                          onClick={() => setAbaAtiva("materiais")}
                          className={`pb-3 px-1 font-medium text-sm transition-colors border-b-2 ${
                            abaAtiva === "materiais"
                              ? "border-blue-600 text-blue-600"
                              : "border-transparent text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          Materiais ({aulaAtual.materiais.length})
                        </button>
                        <button
                          onClick={() => setAbaAtiva("comentarios")}
                          className={`pb-3 px-1 font-medium text-sm transition-colors border-b-2 ${
                            abaAtiva === "comentarios"
                              ? "border-blue-600 text-blue-600"
                              : "border-transparent text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          Comentários ({aulaAtual.comentarios.length})
                        </button>
                      </div>

                      {/* Conteúdo das Tabs */}
        {/* {abaAtiva === "visao-geral" && (
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Sobre esta aula</h3>
                            <p className="text-gray-700 leading-relaxed">{aulaAtual.descricao}</p>
                          </div>
                        </div>
                      )}

                      {abaAtiva === "materiais" && (
                        <div className="space-y-3">
                          {aulaAtual.materiais.length > 0 ? (
                            aulaAtual.materiais.map((material: any, index: number) => (
                              <a
                                key={index}
                                href={material.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors group"
                              >
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                  <svg
                                    className="h-5 w-5 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                  </svg>
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {material.nome}
                                  </p>
                                  <p className="text-sm text-gray-500">{material.tipo || "Documento"}</p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                              </a>
                            ))
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <svg
                                className="h-12 w-12 mx-auto mb-3 text-gray-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              <p>Nenhum material disponível para esta aula</p>
                            </div>
                          )}
                        </div>
                      )}

                      {abaAtiva === "comentarios" && (
                        <div className="space-y-4">
                          {/* Adicionar Comentário */}
        {/* <div className="bg-gray-50 rounded-lg p-4">
                            <Textarea
                              placeholder="Compartilhe suas dúvidas ou reflexões sobre esta aula..."
                              value={novoComentario}
                              onChange={(e) => setNovoComentario(e.target.value)}
                              className="mb-3 bg-white"
                              rows={3}
                            />
                            <div className="flex justify-end">
                              <Button
                                onClick={() => handleAdicionarComentario(aulaAtual.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                disabled={!novoComentario.trim()}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Publicar Comentário
                              </Button>
                            </div>
                          </div>

                          {/* Lista de Comentários */}
        {/* <div className="space-y-4">
                            {aulaAtual.comentarios.map((comentario: any, index: number) => (
                              <div key={index} className="border-b last:border-b-0 pb-4 last:pb-0">
                                <div className="flex items-start gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm">
                                      {comentario.autor
                                        .split(" ")
                                        .map((n: string) => n[0])
                                        .join("")
                                        .slice(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-gray-900">{comentario.autor}</span>
                                      <span className="text-sm text-gray-500">{comentario.data}</span>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed">{comentario.texto}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Navegação entre aulas */}
        {/* <div className="flex items-center justify-between pt-6 border-t">
                      <Button
                        variant="outline"
                        onClick={() => {
                          const currentIndex = aulas.findIndex((a) => a.id === aulaAtual.id)
                          if (currentIndex > 0) {
                            setAulaAtual(aulas[currentIndex - 1])
                            setAbaAtiva("visao-geral")
                          }
                        }}
                        disabled={aulaAtual.ordem === 1}
                      >
                        <ChevronRight className="h-4 w-4 rotate-180 mr-2" />
                        Aula Anterior
                      </Button>
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => {
                          const currentIndex = aulas.findIndex((a) => a.id === aulaAtual.id)
                          if (currentIndex < aulas.length - 1) {
                            setAulaAtual(aulas[currentIndex + 1])
                            setAbaAtiva("visao-geral")
                          }
                        }}
                        disabled={aulaAtual.ordem === aulas.length}
                      >
                        Próxima Aula
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card> */}

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <CardTitle>Aulas e Conteúdo</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Acesse todo o conteúdo do curso, assista às aulas e acompanhe seu progresso.
            </p>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg mb-4">
              <div>
                <p className="text-sm font-medium text-blue-900">Seu Progresso</p>
                <p className="text-2xl font-bold text-blue-600">{progressoAulas}%</p>
                <p className="text-xs text-blue-700">
                  {aulasConcluidasCount}/{progressoAulasData.total} aulas concluídas
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Play className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <Link href={`/${slug}/aulas`}>
              {" "}
              {/* Changed to Link component */}
              <Button className="w-full">
                <BookOpen className="h-4 w-4 mr-2" />
                Acessar Minhas Aulas
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Resumo da Jornada */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Resumo da Jornada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Conquistas Recentes</h4>
                <div className="space-y-3">
                  {conquistasRecentes.length > 0 ? (
                    conquistasRecentes.map((conquista: any, index: number) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-gray-900">{conquista.titulo}</h5>
                          <p className="text-sm text-gray-600">{conquista.descricao}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Nenhuma conquista registrada ainda.</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Próximos Marcos</h4>
                <div className="space-y-3">
                  {proximosMarcos.length > 0 ? (
                    proximosMarcos.map((marco: any, index: number) => (
                      <div key={index} className="flex items-start gap-3">
                        <ArrowRight className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-gray-900">{marco.titulo}</h5>
                          <p className="text-sm text-gray-600">{marco.descricao}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Nenhum marco definido ainda.</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Anotações da Mentoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Anotações da Mentoria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {anotacoesMentoria.length > 0 ? (
                anotacoesMentoria.map((anotacao: any, index: number) => (
                  <div key={index} className="flex gap-3">
                    <img
                      src="/images/image.png"
                      alt="Avatar do mentor"
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div
                      className={`flex-1 ${
                        anotacao.cor === "green"
                          ? "bg-green-50 border-green-200"
                          : anotacao.cor === "orange"
                            ? "bg-orange-50 border-orange-200"
                            : anotacao.cor === "purple"
                              ? "bg-purple-50 border-purple-200"
                              : "bg-blue-50 border-blue-200"
                      } border rounded-lg p-4`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`font-semibold ${
                            anotacao.cor === "green"
                              ? "text-green-800"
                              : anotacao.cor === "orange"
                                ? "text-orange-800"
                                : anotacao.cor === "purple"
                                  ? "text-purple-800"
                                  : "text-blue-800"
                          }`}
                        >
                          Mentor
                        </span>
                        <span
                          className={`text-sm ${
                            anotacao.cor === "green"
                              ? "text-green-600"
                              : anotacao.cor === "orange"
                                ? "text-orange-600"
                                : anotacao.cor === "purple"
                                  ? "text-purple-600"
                                  : "text-blue-600"
                          }`}
                        >
                          {anotacao.data} - {anotacao.horario}
                        </span>
                      </div>
                      <p
                        className={`text-sm ${
                          anotacao.cor === "green"
                            ? "text-green-700"
                            : anotacao.cor === "orange"
                              ? "text-orange-700"
                              : anotacao.cor === "purple"
                                ? "text-purple-700"
                                : "text-blue-700"
                        }`}
                      >
                        {anotacao.texto}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Novos comentários aparecerão aqui após cada sessão</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
