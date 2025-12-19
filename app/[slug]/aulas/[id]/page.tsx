"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  FileText,
  MessageSquare,
  Download,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"
import Link from "next/link"

export default function AulaDetalhePage({
  params,
}: {
  params: { slug: string; id: string }
}) {
  const aulaId = Number.parseInt(params.id)

  const [aula, setAula] = useState<any>(null)
  const [todasAulas, setTodasAulas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [abaAtiva, setAbaAtiva] = useState<"visao-geral" | "materiais" | "comentarios">("visao-geral")
  const [comentario, setComentario] = useState("")
  const [concluida, setConcluida] = useState(false)
  const [loadingConclusao, setLoadingConclusao] = useState(false)
  const [comentarios, setComentarios] = useState<any[]>([])
  const [loadingComentarios, setLoadingComentarios] = useState(false)
  const [enviandoComentario, setEnviandoComentario] = useState(false)

  useEffect(() => {
    const loadAula = async () => {
      try {
        const response = await fetch(`/api/mentorado/${params.slug}/aulas`)
        if (response.ok) {
          const data = await response.json()
          const aulaEncontrada = data.aulas.find((a: any) => a.id === aulaId)

          if (aulaEncontrada) {
            setAula(aulaEncontrada)
            setConcluida(aulaEncontrada.concluida)
          }

          setTodasAulas(data.aulas || [])
        }
      } catch (error) {
        console.error("[v0] Erro ao carregar aula:", error)
      } finally {
        setLoading(false)
      }
    }

    loadAula()
    loadComentarios()
  }, [params.slug, aulaId])

  useEffect(() => {
    if (abaAtiva === "comentarios") {
      loadComentarios()
    }
  }, [abaAtiva])

  const aulaAnterior = todasAulas.find((a) => a.ordem === aula.ordem - 1)
  const proximaAula = todasAulas.find((a) => a.ordem === aula.ordem + 1)

  const handleConcluirAula = async () => {
    setLoadingConclusao(true)
    try {
      const method = concluida ? "DELETE" : "POST"
      const response = await fetch(`/api/mentorado/${params.slug}/aulas/${aulaId}/completar`, {
        method,
      })

      if (response.ok) {
        const data = await response.json()
        setConcluida(!concluida)
        console.log(
          `[v0] Progresso atualizado: ${data.aulasCompletas}/${data.totalAulas} (${data.progressoPercentual}%)`,
        )
      } else {
        console.error("[v0] Erro ao atualizar conclusão da aula")
      }
    } catch (error) {
      console.error("[v0] Erro ao marcar aula como concluída:", error)
    } finally {
      setLoadingConclusao(false)
    }
  }

  const loadComentarios = async () => {
    setLoadingComentarios(true)
    try {
      const response = await fetch(`/api/mentorado/${params.slug}/aulas/${aulaId}/comentarios`)
      if (response.ok) {
        const data = await response.json()
        setComentarios(data.comentarios || [])
      }
    } catch (error) {
      console.error("[v0] Erro ao carregar comentários:", error)
    } finally {
      setLoadingComentarios(false)
    }
  }

  const handleEnviarComentario = async () => {
    if (!comentario.trim()) return

    setEnviandoComentario(true)
    try {
      const response = await fetch(`/api/mentorado/${params.slug}/aulas/${aulaId}/comentarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comentario }),
      })

      if (response.ok) {
        const data = await response.json()
        setComentarios([data.comentario, ...comentarios])
        setComentario("")
        console.log("[v0] Comentário publicado com sucesso!")
      } else {
        console.error("[v0] Erro ao enviar comentário")
      }
    } catch (error) {
      console.error("[v0] Erro ao enviar comentário:", error)
    } finally {
      setEnviandoComentario(false)
    }
  }

  if (loading || !aula) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando aula...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href={`/${params.slug}/aulas`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Aulas
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Video Player */}
        <Card className="mb-6 overflow-hidden">
          <div className="aspect-video bg-black">
            <iframe
              src={aula.videoUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              title={aula.titulo}
            />
          </div>
        </Card>

        {/* Aula Info */}
        <div className="mb-6">
          <Badge variant="secondary" className="mb-2">
            {aula.modulo}
          </Badge>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{aula.titulo}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {aula.duracao}
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              {aula.materiais.length} materiais
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b mb-6">
          <div className="flex gap-6">
            <button
              onClick={() => setAbaAtiva("visao-geral")}
              className={`pb-3 border-b-2 transition-colors ${
                abaAtiva === "visao-geral"
                  ? "border-blue-600 text-blue-600 font-medium"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setAbaAtiva("materiais")}
              className={`pb-3 border-b-2 transition-colors ${
                abaAtiva === "materiais"
                  ? "border-blue-600 text-blue-600 font-medium"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Materiais ({aula.materiais.length})
            </button>
            <button
              onClick={() => setAbaAtiva("comentarios")}
              className={`pb-3 border-b-2 transition-colors ${
                abaAtiva === "comentarios"
                  ? "border-blue-600 text-blue-600 font-medium"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Comentários ({comentarios.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {abaAtiva === "visao-geral" && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Sobre esta aula</h2>
                <p className="text-gray-600 leading-relaxed">{aula.descricaoDetalhada || aula.descricao}</p>

                {aula.objetivosAprendizado && aula.objetivosAprendizado.length > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">O que você vai aprender:</h3>
                    <ul className="space-y-2 text-sm text-blue-800">
                      {aula.objetivosAprendizado.map((objetivo: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>{objetivo}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            )}

            {abaAtiva === "materiais" && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Materiais Complementares</h2>
                {aula.materiais.length === 0 ? (
                  <p className="text-gray-500">Nenhum material disponível para esta aula.</p>
                ) : (
                  <div className="space-y-3">
                    {aula.materiais.map((material: any, index: number) => (
                      <a
                        key={index}
                        href={material.url || "#"}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-2 rounded">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <span className="font-medium text-gray-900">{material.titulo}</span>
                        </div>
                        <Download className="h-5 w-5 text-gray-400" />
                      </a>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {abaAtiva === "comentarios" && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Comentários</h2>

                <div className="mb-6">
                  <Textarea
                    placeholder="Adicione um comentário ou tire suas dúvidas..."
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    className="mb-3"
                    rows={3}
                    disabled={enviandoComentario}
                  />
                  <Button onClick={handleEnviarComentario} disabled={!comentario.trim() || enviandoComentario}>
                    {enviandoComentario ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Publicando...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Publicar Comentário
                      </>
                    )}
                  </Button>
                </div>

                {loadingComentarios ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Carregando comentários...</p>
                  </div>
                ) : comentarios.length === 0 ? (
                  <p className="text-gray-500 text-sm">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
                ) : (
                  <div className="space-y-4">
                    {comentarios.map((comentarioItem: any) => (
                      <div key={comentarioItem.id} className="border-l-4 border-blue-200 pl-4 py-2">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-900">{comentarioItem.autor_nome}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(comentarioItem.created_at).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-gray-700">{comentarioItem.comentario}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Sidebar - Navegação */}
          <div className="space-y-4">
            {aulaAnterior && (
              <Link href={`/${params.slug}/aulas/${aulaAnterior.id}`}>
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <ChevronLeft className="h-4 w-4" />
                    Aula Anterior
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm">{aulaAnterior.titulo}</h3>
                </Card>
              </Link>
            )}

            {proximaAula && (
              <Link href={`/${params.slug}/aulas/${proximaAula.id}`}>
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer bg-blue-50 border-blue-200">
                  <div className="flex items-center justify-between text-sm text-blue-600 mb-2">
                    <span className="font-medium">Próxima Aula</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm mb-1">{proximaAula.titulo}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {proximaAula.duracao}
                  </p>
                </Card>
              </Link>
            )}
          </div>
        </div>

        <div className="mt-8 mb-16">
          <div className="max-w-2xl mx-auto">
            <Button
              onClick={handleConcluirAula}
              disabled={loadingConclusao}
              size="lg"
              className={`w-full h-16 text-lg font-semibold transition-all ${
                concluida ? "bg-green-600 hover:bg-green-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {loadingConclusao ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3" />
                  Salvando...
                </>
              ) : concluida ? (
                <>
                  <CheckCircle className="h-6 w-6 mr-3" />
                  Aula Concluída
                </>
              ) : (
                <>
                  <CheckCircle className="h-6 w-6 mr-3" />
                  Marcar como Concluída
                </>
              )}
            </Button>
            {concluida && (
              <p className="text-center text-sm text-green-600 mt-3 font-medium">Parabéns! Você concluiu esta aula.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
