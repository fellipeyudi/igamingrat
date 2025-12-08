"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send, Loader2, MessageCircle, CheckCircle2, XCircle, Clock } from "lucide-react"

interface WhatsAppLog {
  id: number
  telefone: string
  mensagem: string
  tipo: string
  status: string
  error_message: string | null
  reuniao_titulo: string | null
  mentorado_nome: string | null
  created_at: string
}

export default function WhatsAppTestPage() {
  const [telefone, setTelefone] = useState("5561998750875")
  const [mensagem, setMensagem] = useState("")
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [logs, setLogs] = useState<WhatsAppLog[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)

  useEffect(() => {
    loadLogs()
  }, [])

  const loadLogs = async () => {
    setLoadingLogs(true)
    try {
      const response = await fetch("/api/whatsapp/logs?limit=20")
      const data = await response.json()
      setLogs(data)
    } catch (error) {
      console.error("Erro ao carregar logs:", error)
    } finally {
      setLoadingLogs(false)
    }
  }

  const handleSend = async () => {
    if (!telefone || !mensagem) {
      alert("Preencha telefone e mensagem")
      return
    }

    setSending(true)
    setResult(null)

    try {
      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          telefone,
          mensagem,
          tipo: "teste",
        }),
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        setMensagem("")
        loadLogs() // Recarregar logs após envio
      }
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
      })
    } finally {
      setSending(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sucesso":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "erro":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "enviando":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: any = {
      sucesso: "default",
      erro: "destructive",
      enviando: "secondary",
    }
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-8 w-8 text-green-500" />
          <div>
            <h1 className="text-3xl font-bold">Teste WhatsApp Z-API</h1>
            <p className="text-muted-foreground">Envie mensagens de teste e visualize o histórico de envios</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário de Envio */}
          <Card>
            <CardHeader>
              <CardTitle>Enviar Mensagem de Teste</CardTitle>
              <CardDescription>Envie uma mensagem via WhatsApp usando a Z-API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Telefone (com DDI)</label>
                <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="5561998750875" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mensagem</label>
                <Textarea
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Digite sua mensagem de teste..."
                  rows={6}
                />
              </div>

              <Button onClick={handleSend} disabled={sending || !telefone || !mensagem} className="w-full">
                {sending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Mensagem
                  </>
                )}
              </Button>

              {result && (
                <div
                  className={`p-4 rounded-lg ${
                    result.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                  }`}
                >
                  <p className="font-medium">
                    {result.success ? "✅ Mensagem enviada com sucesso!" : "❌ Erro ao enviar"}
                  </p>
                  {result.messageId && <p className="text-sm mt-1">ID: {result.messageId}</p>}
                  {result.error && <p className="text-sm mt-1 text-red-600">{result.error}</p>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Logs Recentes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Logs Recentes</CardTitle>
                  <CardDescription>Últimas 20 mensagens enviadas</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={loadLogs} disabled={loadingLogs}>
                  {loadingLogs ? <Loader2 className="h-4 w-4 animate-spin" /> : "Atualizar"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingLogs ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : logs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhum log encontrado</p>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {logs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-3 space-y-2 hover:bg-accent/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(log.status)}
                          <span className="font-mono text-sm">{log.telefone}</span>
                        </div>
                        {getStatusBadge(log.status)}
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">{log.mensagem}</p>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="capitalize">{log.tipo}</span>
                        <span>{new Date(log.created_at).toLocaleString("pt-BR")}</span>
                      </div>

                      {log.mentorado_nome && (
                        <p className="text-xs text-muted-foreground">Mentorado: {log.mentorado_nome}</p>
                      )}

                      {log.error_message && <p className="text-xs text-red-600">{log.error_message}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
