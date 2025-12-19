"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BookOpen, CheckCircle2, Clock, FileText, Play, Search, Filter, Circle } from "lucide-react"
import Link from "next/link"

export default function AulasPage({ params }: { params: { slug: string } }) {
  const [busca, setBusca] = useState("")
  const [filtroModulo, setFiltroModulo] = useState("todos")
  const [aulasSelecionadas, setAulasSelecionadas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAulas = async () => {
      try {
        const response = await fetch(`/api/mentorado/${params.slug}/aulas`)
        if (response.ok) {
          const data = await response.json()
          setAulasSelecionadas(data.aulas || [])
        }
      } catch (error) {
        console.error("[v0] Erro ao carregar aulas:", error)
      } finally {
        setLoading(false)
      }
    }

    loadAulas()
  }, [params.slug])

  // Filtrar aulas
  const aulas = aulasSelecionadas.filter((aula) => {
    const matchBusca =
      aula.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      aula.descricao.toLowerCase().includes(busca.toLowerCase())
    const matchModulo = filtroModulo === "todos" || aula.modulo === filtroModulo
    return matchBusca && matchModulo
  })

  // Estatísticas
  const totalAulas = aulasSelecionadas.length
  const aulasConcluidasCount = aulasSelecionadas.filter((a) => a.concluida).length
  const progressoGeral = totalAulas > 0 ? Math.round((aulasConcluidasCount / totalAulas) * 100) : 0

  // Módulos únicos
  const modulos = ["todos", ...Array.from(new Set(aulasSelecionadas.map((a) => a.modulo)))]

  const toggleAulaConcluida = async (aulaId: number) => {
    const aulaAtual = aulasSelecionadas.find((a) => a.id === aulaId)
    if (!aulaAtual) return

    // Atualizar UI imediatamente para melhor UX
    setAulasSelecionadas((prev) =>
      prev.map((aula) => (aula.id === aulaId ? { ...aula, concluida: !aula.concluida } : aula)),
    )

    try {
      const method = aulaAtual.concluida ? "DELETE" : "POST"
      const response = await fetch(`/api/mentorado/${params.slug}/aulas/${aulaId}/completar`, {
        method,
      })

      if (!response.ok) {
        // Reverter mudança se falhar
        setAulasSelecionadas((prev) =>
          prev.map((aula) => (aula.id === aulaId ? { ...aula, concluida: aulaAtual.concluida } : aula)),
        )
        console.error("[v0] Erro ao atualizar conclusão da aula")
      }
    } catch (error) {
      // Reverter mudança se falhar
      setAulasSelecionadas((prev) =>
        prev.map((aula) => (aula.id === aulaId ? { ...aula, concluida: aulaAtual.concluida } : aula)),
      )
      console.error("[v0] Erro ao marcar aula como concluída:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando aulas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/${params.slug}`}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Minhas Aulas</h1>
                <p className="text-xs text-gray-500">
                  {aulasConcluidasCount} de {totalAulas} concluídas · {progressoGeral}% completo
                </p>
              </div>
            </div>

            <div className="hidden sm:block">
              <div className="bg-gray-200 h-2 w-32 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${progressoGeral}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar aulas..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10 h-10 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filtroModulo}
              onChange={(e) => setFiltroModulo(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {modulos.map((modulo) => (
                <option key={modulo} value={modulo}>
                  {modulo === "todos" ? "Todos os Módulos" : modulo}
                </option>
              ))}
            </select>
          </div>
        </div>

        {aulas.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma aula encontrada</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {aulas.map((aula) => (
              <Card
                key={aula.id}
                className={`group overflow-hidden transition-all hover:shadow-lg border-l-4 ${
                  aula.concluida ? "border-l-blue-600 bg-blue-50/30" : "border-l-gray-300 hover:border-l-blue-500"
                }`}
              >
                <div className="flex items-center gap-4 p-4">
                  <Link href={`/${params.slug}/aulas/${aula.id}`}>
                    {aula.thumbnail_url ? (
                      <div className="relative w-28 h-20 rounded-lg overflow-hidden cursor-pointer group-hover:scale-105 transition-transform flex-shrink-0">
                        <img
                          src={aula.thumbnail_url || "/placeholder.svg"}
                          alt={aula.titulo}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback para placeholder se imagem falhar
                            e.currentTarget.style.display = "none"
                            e.currentTarget.parentElement?.classList.add(
                              "bg-gradient-to-br",
                              "from-blue-400",
                              "via-blue-500",
                              "to-blue-600",
                              "flex",
                              "items-center",
                              "justify-center",
                            )
                          }}
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <Play className="h-6 w-6 text-white fill-white opacity-80 group-hover:opacity-100" />
                        </div>
                        <div className="absolute top-1 left-1 bg-white/90 backdrop-blur-sm text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                          #{aula.ordem}
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-28 h-20 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-lg flex items-center justify-center cursor-pointer group-hover:scale-105 transition-transform flex-shrink-0">
                        <div className="absolute top-1 left-1 bg-white/90 backdrop-blur-sm text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                          #{aula.ordem}
                        </div>
                        <Play className="h-6 w-6 text-white fill-white opacity-80 group-hover:opacity-100" />
                      </div>
                    )}
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-2">
                      <Link href={`/${params.slug}/aulas/${aula.id}`} className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base text-gray-900 group-hover:text-blue-600 transition-colors cursor-pointer line-clamp-1">
                          {aula.titulo}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-1 mt-0.5">{aula.descricao}</p>
                      </Link>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <Badge variant="secondary" className="text-xs font-medium px-2 py-0.5">
                        {aula.modulo}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{aula.duracao}</span>
                      </div>
                      {aula.materiais.length > 0 && (
                        <div className="flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5" />
                          <span>
                            {aula.materiais.length} material{aula.materiais.length > 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                    </div>

                    {aula.progresso > 0 && aula.progresso < 100 && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 transition-all" style={{ width: `${aula.progresso}%` }} />
                        </div>
                        <span className="text-xs font-medium text-blue-600 w-10 text-right">{aula.progresso}%</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        toggleAulaConcluida(aula.id)
                      }}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        aula.concluida
                          ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                          : "bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600"
                      }`}
                    >
                      {aula.concluida ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Concluída
                        </>
                      ) : (
                        <>
                          <Circle className="h-4 w-4" />
                          Concluir
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
