"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Star, Send, ArrowLeft, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AvaliacaoSatisfacao() {
  const [loading, setLoading] = useState(true)
  const [mentoradoData, setMentoradoData] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  // Respostas do formulário
  const [respostas, setRespostas] = useState({
    faturamento_atual: "",
    meta_faturamento: "",
    satisfacao_geral: 0,
    qualidade_calls: 0,
    qualidade_suporte: 0,
    qualidade_entregaveis: 0,
    clareza_comunicacao: 0,
    utilidade_conteudo: 0,
    principal_desafio: "",
    maior_conquista: "",
    expectativas_atendidas: "",
    sugestoes_melhoria: "",
    proximo_objetivo: "",
    feedback_adicional: "",
    tempo_resposta_suporte: "",
    frequencia_calls_ideal: "",
    recomendaria_mentoria: 0,
  })

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("mentorado_token")

      if (!token) {
        router.push(`/${slug}/login`)
        return
      }

      try {
        const response = await fetch(`/api/mentorado/${slug}`)
        if (response.ok) {
          const data = await response.json()
          if (data && data.mentorado && data.mentorado.id) {
            setMentoradoData(data)
          } else {
            console.error("[v0] Dados do mentorado inválidos:", data)
            localStorage.removeItem("mentorado_token")
            router.push(`/${slug}/login`)
          }
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

  const handleStarRating = (field: string, rating: number) => {
    setRespostas((prev) => ({ ...prev, [field]: rating }))
  }

  const handleNPSRating = (rating: number) => {
    setRespostas((prev) => ({ ...prev, recomendaria_mentoria: rating }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!mentoradoData || !mentoradoData.mentorado || !mentoradoData.mentorado.id) {
      console.error("[v0] Dados do mentorado não carregados")
      alert("Erro: Dados do mentorado não encontrados. Faça login novamente.")
      return
    }

    setSubmitting(true)

    try {
      console.log("[v0] Enviando avaliação para mentorado_id:", mentoradoData.mentorado.id)

      const response = await fetch(`/api/mentorado/${slug}/avaliacao`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentorado_id: mentoradoData.mentorado.id,
          ...respostas,
        }),
      })

      if (response.ok) {
        setSubmitted(true)
        setTimeout(() => {
          router.push(`/${slug}`)
        }, 3000)
      } else {
        const errorData = await response.json()
        console.error("[v0] Erro ao enviar avaliação:", errorData)
        alert("Erro ao enviar avaliação. Tente novamente.")
      }
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error)
      alert("Erro ao enviar avaliação. Tente novamente.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Avaliação Enviada!</h2>
            <p className="text-gray-600 mb-4">Obrigado pelo seu feedback. Ele é muito importante para nós!</p>
            <p className="text-sm text-gray-500">Redirecionando para o dashboard...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const StarRating = ({ value, onChange }: { value: number; onChange: (rating: number) => void }) => (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110"
        >
          <Star className={`h-8 w-8 ${star <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
        </button>
      ))}
    </div>
  )

  const NPSRating = ({ value, onChange }: { value: number; onChange: (rating: number) => void }) => (
    <div className="flex flex-wrap gap-2">
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
        <button
          key={num}
          type="button"
          onClick={() => onChange(num)}
          className={`w-12 h-12 rounded-lg font-semibold transition-all ${
            num === value
              ? num <= 6
                ? "bg-red-500 text-white"
                : num <= 8
                  ? "bg-yellow-500 text-white"
                  : "bg-green-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {num}
        </button>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push(`/${slug}`)} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Avaliação de Satisfação</h1>
            <p className="text-gray-600">Nos ajude a melhorar sua experiência na mentoria</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Faturamento */}
          <Card>
            <CardHeader>
              <CardTitle>Resultados Financeiros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qual seu faturamento atual mensal?
                </label>
                <input
                  type="text"
                  value={respostas.faturamento_atual}
                  onChange={(e) => setRespostas({ ...respostas, faturamento_atual: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: R$ 10.000,00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qual sua meta de faturamento para os próximos 3 meses?
                </label>
                <input
                  type="text"
                  value={respostas.meta_faturamento}
                  onChange={(e) => setRespostas({ ...respostas, meta_faturamento: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: R$ 30.000,00"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Avaliações com Estrelas */}
          <Card>
            <CardHeader>
              <CardTitle>Avalie sua Experiência</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Satisfação Geral com a Mentoria</label>
                <StarRating
                  value={respostas.satisfacao_geral}
                  onChange={(rating) => handleStarRating("satisfacao_geral", rating)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Qualidade das Calls</label>
                <StarRating
                  value={respostas.qualidade_calls}
                  onChange={(rating) => handleStarRating("qualidade_calls", rating)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Qualidade do Suporte</label>
                <StarRating
                  value={respostas.qualidade_suporte}
                  onChange={(rating) => handleStarRating("qualidade_suporte", rating)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Qualidade dos Entregáveis (materiais, planilhas, etc.)
                </label>
                <StarRating
                  value={respostas.qualidade_entregaveis}
                  onChange={(rating) => handleStarRating("qualidade_entregaveis", rating)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Clareza na Comunicação</label>
                <StarRating
                  value={respostas.clareza_comunicacao}
                  onChange={(rating) => handleStarRating("clareza_comunicacao", rating)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Utilidade do Conteúdo Ensinado</label>
                <StarRating
                  value={respostas.utilidade_conteudo}
                  onChange={(rating) => handleStarRating("utilidade_conteudo", rating)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Perguntas Abertas */}
          <Card>
            <CardHeader>
              <CardTitle>Compartilhe sua Experiência</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qual seu principal desafio no momento?
                </label>
                <textarea
                  value={respostas.principal_desafio}
                  onChange={(e) => setRespostas({ ...respostas, principal_desafio: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qual foi sua maior conquista até agora?
                </label>
                <textarea
                  value={respostas.maior_conquista}
                  onChange={(e) => setRespostas({ ...respostas, maior_conquista: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  A mentoria está atendendo suas expectativas? Por quê?
                </label>
                <textarea
                  value={respostas.expectativas_atendidas}
                  onChange={(e) => setRespostas({ ...respostas, expectativas_atendidas: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">O que podemos melhorar?</label>
                <textarea
                  value={respostas.sugestoes_melhoria}
                  onChange={(e) => setRespostas({ ...respostas, sugestoes_melhoria: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Qual seu próximo objetivo?</label>
                <textarea
                  value={respostas.proximo_objetivo}
                  onChange={(e) => setRespostas({ ...respostas, proximo_objetivo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Operacional */}
          <Card>
            <CardHeader>
              <CardTitle>Aspectos Operacionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Como você avalia o tempo de resposta do suporte?
                </label>
                <select
                  value={respostas.tempo_resposta_suporte}
                  onChange={(e) => setRespostas({ ...respostas, tempo_resposta_suporte: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="Muito rápido">Muito rápido (até 2h)</option>
                  <option value="Rápido">Rápido (2-6h)</option>
                  <option value="Normal">Normal (6-12h)</option>
                  <option value="Lento">Lento (12-24h)</option>
                  <option value="Muito lento">Muito lento (mais de 24h)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qual seria a frequência ideal de calls para você?
                </label>
                <select
                  value={respostas.frequencia_calls_ideal}
                  onChange={(e) => setRespostas({ ...respostas, frequencia_calls_ideal: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="2x por semana">2x por semana</option>
                  <option value="1x por semana">1x por semana</option>
                  <option value="A cada 10 dias">A cada 10 dias</option>
                  <option value="Quinzenal">Quinzenal</option>
                  <option value="Mensal">Mensal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Feedback adicional (opcional)</label>
                <textarea
                  value={respostas.feedback_adicional}
                  onChange={(e) => setRespostas({ ...respostas, feedback_adicional: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Algum comentário adicional que gostaria de compartilhar?"
                />
              </div>
            </CardContent>
          </Card>

          {/* NPS */}
          <Card>
            <CardHeader>
              <CardTitle>Recomendação</CardTitle>
            </CardHeader>
            <CardContent>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                De 0 a 10, qual a probabilidade de você recomendar nossa mentoria para um amigo?
              </label>
              <NPSRating value={respostas.recomendaria_mentoria} onChange={handleNPSRating} />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Muito improvável</span>
                <span>Muito provável</span>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Enviar Avaliação
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
