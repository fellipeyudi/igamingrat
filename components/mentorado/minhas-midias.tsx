"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ImageIcon, VideoIcon, FileTextIcon, BarChartIcon, CalendarIcon, ClockIcon, LinkIcon } from "lucide-react"

interface Midia {
  id: number
  tipo: string
  categoria: string
  titulo: string
  descricao?: string
  url: string
  data_midia?: string
  horario_midia?: string
  reuniao_titulo?: string
  metricas?: any
}

export function MinhasMidias({ mentoradoId }: { mentoradoId: number }) {
  const [midias, setMidias] = useState<Midia[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarMidias()
  }, [mentoradoId])

  const carregarMidias = async () => {
    try {
      const res = await fetch(`/api/admin/mentorado-midias?mentorado_id=${mentoradoId}`)
      const data = await res.json()
      setMidias(data)
    } catch (error) {
      console.error("[v0] Erro ao carregar mídias:", error)
    } finally {
      setLoading(false)
    }
  }

  const getIconByType = (tipo: string) => {
    switch (tipo) {
      case "imagem":
        return <ImageIcon className="h-5 w-5" />
      case "video":
        return <VideoIcon className="h-5 w-5" />
      case "documento":
        return <FileTextIcon className="h-5 w-5" />
      case "metrica":
        return <BarChartIcon className="h-5 w-5" />
      default:
        return <FileTextIcon className="h-5 w-5" />
    }
  }

  if (loading) return <div>Carregando suas mídias...</div>

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Suas Campanhas e Métricas</h2>

      {midias.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Nenhuma campanha ou métrica disponível ainda</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {midias.map((midia) => (
            <Card key={midia.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getIconByType(midia.tipo)}
                    <CardTitle className="text-base">{midia.titulo}</CardTitle>
                  </div>
                  <Badge variant="secondary">{midia.categoria}</Badge>
                </div>
                {midia.descricao && <CardDescription>{midia.descricao}</CardDescription>}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {midia.data_midia && (
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      {new Date(midia.data_midia).toLocaleDateString("pt-BR")}
                    </div>
                  )}
                  {midia.horario_midia && (
                    <div className="flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" />
                      {midia.horario_midia}
                    </div>
                  )}
                  {midia.reuniao_titulo && (
                    <div className="flex items-center gap-1">
                      <LinkIcon className="h-4 w-4" />
                      Vinculado à call: {midia.reuniao_titulo}
                    </div>
                  )}
                </div>

                {midia.metricas && (
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                    {midia.metricas.alcance && (
                      <div className="text-center">
                        <span className="text-xs text-muted-foreground block">Alcance</span>
                        <p className="font-semibold text-lg">{midia.metricas.alcance}</p>
                      </div>
                    )}
                    {midia.metricas.conversao && (
                      <div className="text-center">
                        <span className="text-xs text-muted-foreground block">Conversão</span>
                        <p className="font-semibold text-lg">{midia.metricas.conversao}%</p>
                      </div>
                    )}
                    {midia.metricas.roi && (
                      <div className="text-center">
                        <span className="text-xs text-muted-foreground block">ROI</span>
                        <p className="font-semibold text-lg">{midia.metricas.roi}%</p>
                      </div>
                    )}
                  </div>
                )}

                <a
                  href={midia.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm text-blue-600 hover:underline font-medium"
                >
                  Visualizar mídia →
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
