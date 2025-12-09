"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  ImageIcon,
  VideoIcon,
  FileTextIcon,
  BarChartIcon,
  CalendarIcon,
  ClockIcon,
  LinkIcon,
  TrashIcon,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Midia {
  id: number
  tipo: string
  categoria: string
  titulo: string
  descricao?: string
  url: string
  data_midia?: string
  horario_midia?: string
  reuniao_id?: number
  reuniao_titulo?: string
  metricas?: any
  created_at: string
}

interface GerenciarMidiasProps {
  mentoradoId: number
  mentoradoNome: string
  reunioes: Array<{ id: number; titulo: string; data: string }>
}

export function GerenciarMidias({ mentoradoId, mentoradoNome, reunioes }: GerenciarMidiasProps) {
  const [midias, setMidias] = useState<Midia[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    tipo: "imagem",
    categoria: "campanha",
    titulo: "",
    descricao: "",
    url: "",
    data_midia: "",
    horario_midia: "",
    reuniao_id: "",
    metricas: {
      alcance: "",
      conversao: "",
      roi: "",
    },
  })

  useEffect(() => {
    carregarMidias()
  }, [mentoradoId])

  const carregarMidias = async () => {
    try {
      const res = await fetch(`/api/admin/mentorado-midias?mentorado_id=${mentoradoId}`)
      const data = await res.json()
      setMidias(data)
    } catch (error) {
      toast({ title: "Erro ao carregar mídias", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const payload = {
        mentorado_id: mentoradoId,
        ...formData,
        reuniao_id: formData.reuniao_id ? Number.parseInt(formData.reuniao_id) : null,
        metricas: formData.tipo === "metrica" ? formData.metricas : null,
      }

      const res = await fetch("/api/admin/mentorado-midias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast({ title: "Mídia adicionada com sucesso!" })
        setDialogOpen(false)
        carregarMidias()
        resetForm()
      } else {
        throw new Error("Erro ao adicionar mídia")
      }
    } catch (error) {
      toast({ title: "Erro ao adicionar mídia", variant: "destructive" })
    }
  }

  const resetForm = () => {
    setFormData({
      tipo: "imagem",
      categoria: "campanha",
      titulo: "",
      descricao: "",
      url: "",
      data_midia: "",
      horario_midia: "",
      reuniao_id: "",
      metricas: { alcance: "", conversao: "", roi: "" },
    })
  }

  const deletarMidia = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar esta mídia?")) return

    try {
      const res = await fetch(`/api/admin/mentorado-midias/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast({ title: "Mídia deletada com sucesso!" })
        carregarMidias()
      }
    } catch (error) {
      toast({ title: "Erro ao deletar mídia", variant: "destructive" })
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

  if (loading) return <div>Carregando...</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Mídias e Métricas - {mentoradoNome}</h3>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Adicionar Mídia</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Mídia/Métrica</DialogTitle>
              <DialogDescription>Adicione uma nova mídia, campanha ou métrica para o mentorado</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Mídia</Label>
                  <Select value={formData.tipo} onValueChange={(v) => setFormData({ ...formData, tipo: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="imagem">Imagem</SelectItem>
                      <SelectItem value="video">Vídeo</SelectItem>
                      <SelectItem value="documento">Documento</SelectItem>
                      <SelectItem value="metrica">Métrica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={formData.categoria} onValueChange={(v) => setFormData({ ...formData, categoria: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="campanha">Campanha</SelectItem>
                      <SelectItem value="metrica">Métrica</SelectItem>
                      <SelectItem value="resultado">Resultado</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  placeholder="Ex: Campanha Black Friday - Instagram Ads"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  placeholder="Descrição detalhada da campanha ou métrica"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>URL da Mídia</Label>
                <Input
                  placeholder="https://exemplo.com/imagem.png"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data da Mídia</Label>
                  <Input
                    type="date"
                    value={formData.data_midia}
                    onChange={(e) => setFormData({ ...formData, data_midia: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Horário</Label>
                  <Input
                    type="time"
                    value={formData.horario_midia}
                    onChange={(e) => setFormData({ ...formData, horario_midia: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Vincular a uma Call (opcional)</Label>
                <Select value={formData.reuniao_id} onValueChange={(v) => setFormData({ ...formData, reuniao_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma reunião" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Nenhuma</SelectItem>
                    {reunioes.map((r) => (
                      <SelectItem key={r.id} value={r.id.toString()}>
                        {r.titulo} - {new Date(r.data).toLocaleDateString("pt-BR")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.tipo === "metrica" && (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium">Métricas da Campanha</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Alcance</Label>
                      <Input
                        type="number"
                        placeholder="1000"
                        value={formData.metricas.alcance}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            metricas: { ...formData.metricas, alcance: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Conversão (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="5.2"
                        value={formData.metricas.conversao}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            metricas: { ...formData.metricas, conversao: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>ROI (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="250"
                        value={formData.metricas.roi}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            metricas: { ...formData.metricas, roi: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Adicionar Mídia</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {midias.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Nenhuma mídia adicionada ainda</p>
            </CardContent>
          </Card>
        ) : (
          midias.map((midia) => (
            <Card key={midia.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getIconByType(midia.tipo)}
                    <CardTitle className="text-base">{midia.titulo}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{midia.categoria}</Badge>
                    <Button variant="ghost" size="sm" onClick={() => deletarMidia(midia.id)}>
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {midia.descricao && <CardDescription>{midia.descricao}</CardDescription>}
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
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
                      {midia.reuniao_titulo}
                    </div>
                  )}
                </div>

                {midia.metricas && (
                  <div className="flex gap-4 pt-2 border-t">
                    {midia.metricas.alcance && (
                      <div>
                        <span className="text-xs text-muted-foreground">Alcance:</span>
                        <p className="font-semibold">{midia.metricas.alcance}</p>
                      </div>
                    )}
                    {midia.metricas.conversao && (
                      <div>
                        <span className="text-xs text-muted-foreground">Conversão:</span>
                        <p className="font-semibold">{midia.metricas.conversao}%</p>
                      </div>
                    )}
                    {midia.metricas.roi && (
                      <div>
                        <span className="text-xs text-muted-foreground">ROI:</span>
                        <p className="font-semibold">{midia.metricas.roi}%</p>
                      </div>
                    )}
                  </div>
                )}

                <a
                  href={midia.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline block"
                >
                  Ver mídia
                </a>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
