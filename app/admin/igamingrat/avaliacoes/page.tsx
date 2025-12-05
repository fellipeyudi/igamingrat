"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Star, TrendingUp, MessageSquare, Users, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Avaliacao {
  id: number
  mentorado_id: number
  mentorado_nome: string
  faturamento_atual: string
  meta_faturamento: string
  satisfacao_geral: number
  qualidade_calls: number
  qualidade_suporte: number
  qualidade_entregaveis: number
  clareza_comunicacao: number
  utilidade_conteudo: number
  principal_desafio: string
  maior_conquista: string
  expectativas_atendidas: string
  sugestoes_melhoria: string
  proximo_objetivo: string
  feedback_adicional: string
  tempo_resposta_suporte: string
  frequencia_calls_ideal: string
  recomendaria_mentoria: number
  created_at: string
}

export default function AvaliacoesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [selectedAvaliacao, setSelectedAvaliacao] = useState<Avaliacao | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    media_satisfacao: 0,
    media_nps: 0,
    promotores: 0,
    neutros: 0,
    detratores: 0,
  })

  useEffect(() => {
    const token = localStorage.getItem("admin_token")
    if (!token) {
      router.push("/admin/login")
      return
    }

    fetchAvaliacoes()
  }, [router])

  const fetchAvaliacoes = async () => {
    try {
      const response = await fetch("/api/admin/avaliacoes")
      if (response.ok) {
        const data = await response.json()
        setAvaliacoes(data.avaliacoes)
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Erro ao buscar avaliações:", error)
    } finally {
      setLoading(false)
    }
  }

  const StarDisplay = ({ value }: { value: number }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className={`h-5 w-5 ${star <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
      ))}
    </div>
  )

  const getNPSCategory = (score: number) => {
    if (score >= 9) return { label: "Promotor", color: "bg-green-100 text-green-800 border-green-300" }
    if (score >= 7) return { label: "Neutro", color: "bg-yellow-100 text-yellow-800 border-yellow-300" }
    return { label: "Detrator", color: "bg-red-100 text-red-800 border-red-300" }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando avaliações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push("/admin/igamingrat")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Avaliações de Satisfação</h1>
              <p className="text-gray-600">Feedback dos mentorados sobre a mentoria</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Avaliações</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Satisfação Média</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.media_satisfacao.toFixed(1)}</p>
                  <StarDisplay value={Math.round(stats.media_satisfacao)} />
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">NPS Score</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.media_nps.toFixed(1)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">Distribuição NPS</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-green-600">Promotores:</span>
                    <span className="font-semibold">{stats.promotores}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-yellow-600">Neutros:</span>
                    <span className="font-semibold">{stats.neutros}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-red-600">Detratores:</span>
                    <span className="font-semibold">{stats.detratores}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Avaliações */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Avaliações Recebidas</h2>
            {avaliacoes.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma avaliação recebida ainda.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {avaliacoes.map((avaliacao) => {
                  const npsCategory = getNPSCategory(avaliacao.recomendaria_mentoria)
                  return (
                    <Card
                      key={avaliacao.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedAvaliacao?.id === avaliacao.id ? "ring-2 ring-blue-500" : ""
                      }`}
                      onClick={() => setSelectedAvaliacao(avaliacao)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{avaliacao.mentorado_nome}</h3>
                            <p className="text-xs text-gray-500">
                              {new Date(avaliacao.created_at).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          <Badge className={npsCategory.color}>{npsCategory.label}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <StarDisplay value={avaliacao.satisfacao_geral} />
                          <span className="text-sm text-gray-600">({avaliacao.satisfacao_geral}/5)</span>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {/* Detalhes */}
          <div className="lg:col-span-2">
            {selectedAvaliacao ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Detalhes da Avaliação</span>
                      <Badge className={getNPSCategory(selectedAvaliacao.recomendaria_mentoria).color}>
                        NPS: {selectedAvaliacao.recomendaria_mentoria}/10
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Informações do Mentorado */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Informações</h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Mentorado:</span>
                          <span className="text-sm font-semibold">{selectedAvaliacao.mentorado_nome}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Data:</span>
                          <span className="text-sm font-semibold">
                            {new Date(selectedAvaliacao.created_at).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Resultados Financeiros */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Resultados Financeiros</h4>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-700">Faturamento Atual:</span>
                          <span className="text-sm font-semibold text-green-700">
                            {selectedAvaliacao.faturamento_atual}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-700">Meta (3 meses):</span>
                          <span className="text-sm font-semibold text-green-700">
                            {selectedAvaliacao.meta_faturamento}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Avaliações */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Avaliações</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Satisfação Geral</span>
                          <StarDisplay value={selectedAvaliacao.satisfacao_geral} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Qualidade das Calls</span>
                          <StarDisplay value={selectedAvaliacao.qualidade_calls} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Qualidade do Suporte</span>
                          <StarDisplay value={selectedAvaliacao.qualidade_suporte} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Qualidade dos Entregáveis</span>
                          <StarDisplay value={selectedAvaliacao.qualidade_entregaveis} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Clareza na Comunicação</span>
                          <StarDisplay value={selectedAvaliacao.clareza_comunicacao} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Utilidade do Conteúdo</span>
                          <StarDisplay value={selectedAvaliacao.utilidade_conteudo} />
                        </div>
                      </div>
                    </div>

                    {/* Feedback Textual */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Feedback</h4>
                      <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm font-semibold text-blue-900 mb-1">Principal Desafio</p>
                          <p className="text-sm text-blue-800">{selectedAvaliacao.principal_desafio}</p>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <p className="text-sm font-semibold text-green-900 mb-1">Maior Conquista</p>
                          <p className="text-sm text-green-800">{selectedAvaliacao.maior_conquista}</p>
                        </div>

                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <p className="text-sm font-semibold text-purple-900 mb-1">Expectativas</p>
                          <p className="text-sm text-purple-800">{selectedAvaliacao.expectativas_atendidas}</p>
                        </div>

                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                          <p className="text-sm font-semibold text-orange-900 mb-1">Sugestões de Melhoria</p>
                          <p className="text-sm text-orange-800">{selectedAvaliacao.sugestoes_melhoria}</p>
                        </div>

                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                          <p className="text-sm font-semibold text-indigo-900 mb-1">Próximo Objetivo</p>
                          <p className="text-sm text-indigo-800">{selectedAvaliacao.proximo_objetivo}</p>
                        </div>

                        {selectedAvaliacao.feedback_adicional && (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-sm font-semibold text-gray-900 mb-1">Feedback Adicional</p>
                            <p className="text-sm text-gray-700">{selectedAvaliacao.feedback_adicional}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Aspectos Operacionais */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Aspectos Operacionais</h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Tempo de Resposta do Suporte:</span>
                          <span className="text-sm font-semibold">{selectedAvaliacao.tempo_resposta_suporte}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Frequência Ideal de Calls:</span>
                          <span className="text-sm font-semibold">{selectedAvaliacao.frequencia_calls_ideal}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="pt-12 pb-12 text-center text-gray-500">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Selecione uma avaliação</p>
                  <p className="text-sm">Clique em uma avaliação da lista para ver os detalhes completos</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
