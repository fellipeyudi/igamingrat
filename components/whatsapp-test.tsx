"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, RefreshCw, CheckCircle, XCircle, Clock, MessageSquare, Phone } from "lucide-react"

interface WhatsAppLog {
  id: number
  telefone: string
  mensagem: string
  tipo: string
  status: string
  created_at: string
  reuniao_titulo?: string
  mentorado_nome?: string
  error_message?: string
}

export default function WhatsAppTest() {
  const [telefone, setTelefone] = useState("120363419470266629-group")
  const [mensagem, setMensagem] = useState("")
  const [tipo, setTipo] = useState("manual")
  const [sending, setSending] = useState(false)
  const [logs, setLogs] = useState<WhatsAppLog[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [lastResult, setLastResult] = useState<any>(null)

  const loadLogs = async () => {
    setLoadingLogs(true)
    try {
      const response = await fetch("/api/whatsapp/logs?limit=100")
      const data = await response.json()
      console.log("[v0] Logs carregados:", data)
      setLogs(data)
    } catch (error) {
      console.error("[v0] Erro ao carregar logs:", error)
    } finally {
      setLoadingLogs(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [])

  const handleSendMessage = async () => {
    if (!telefone || !mensagem) {
      alert("Preencha telefone e mensagem")
      return
    }

    setSending(true)
    setLastResult(null)

    try {
      console.log("[v0] Enviando mensagem teste:", { telefone, mensagem, tipo })

      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          telefone,
          mensagem,
          tipo,
        }),
      })

      const result = await response.json()
      console.log("[v0] Resultado do envio:", result)
      setLastResult(result)

      if (result.success) {
        setMensagem("")
        loadLogs()
      }
    } catch (error: any) {
      console.error("[v0] Erro ao enviar:", error)
      setLastResult({
        success: false,
        error: error.message,
      })
    } finally {
      setSending(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sucesso":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Enviado
          </Badge>
        )
      case "erro":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Erro
          </Badge>
        )
      case "enviando":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            Enviando
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTipoBadge = (tipo: string) => {
    const tipos: Record<string, { label: string; color: string }> = {
      nova_reuniao: { label: "Nova Reunião", color: "bg-blue-100 text-blue-700" },
      lembrete_reuniao: { label: "Lembrete", color: "bg-orange-100 text-orange-700" },
      nova_task: { label: "Nova Task", color: "bg-purple-100 text-purple-700" },
      novo_mentorado: { label: "Novo Mentorado", color: "bg-green-100 text-green-700" },
      manual: { label: "Manual", color: "bg-gray-100 text-gray-700" },
    }

    const info = tipos[tipo] || { label: tipo, color: "bg-gray-100 text-gray-700" }
    return <Badge className={`${info.color} border-0`}>{info.label}</Badge>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Central de WhatsApp</h2>
        <p className="text-gray-600">Teste e monitore envios de mensagens via WhatsApp</p>
      </div>

      <Tabs defaultValue="send" className="w-full">
        <TabsList>
          <TabsTrigger value="send">
            <Send className="h-4 w-4 mr-2" />
            Enviar Mensagem
          </TabsTrigger>
          <TabsTrigger value="logs">
            <MessageSquare className="h-4 w-4 mr-2" />
            Histórico de Mensagens
          </TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enviar Mensagem de Teste</CardTitle>
              <CardDescription>Use esta ferramenta para testar o envio de mensagens via WhatsApp</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone / ID do Grupo</Label>
                <Input
                  id="telefone"
                  type="text"
                  placeholder="5561998750875 ou 120363419470266629-group"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                />
                <p className="text-sm text-gray-500">
                  Use formato: número com DDI (5561...) ou ID do grupo (...-group)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Mensagem</Label>
                <select
                  id="tipo"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="manual">Manual (Teste)</option>
                  <option value="nova_reuniao">Nova Reunião</option>
                  <option value="lembrete_reuniao">Lembrete de Reunião</option>
                  <option value="nova_task">Nova Task</option>
                  <option value="novo_mentorado">Novo Mentorado</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mensagem">Mensagem</Label>
                <Textarea
                  id="mensagem"
                  rows={6}
                  placeholder="Digite a mensagem que será enviada..."
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                />
              </div>

              <Button onClick={handleSendMessage} disabled={sending} className="w-full">
                {sending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Mensagem
                  </>
                )}
              </Button>

              {lastResult && (
                <Card className={lastResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-2">
                      {lastResult.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className={`font-semibold ${lastResult.success ? "text-green-900" : "text-red-900"}`}>
                          {lastResult.success ? "Mensagem enviada com sucesso!" : "Erro ao enviar mensagem"}
                        </p>
                        {lastResult.messageId && (
                          <p className="text-sm text-green-700 mt-1">ID: {lastResult.messageId}</p>
                        )}
                        {lastResult.error && <p className="text-sm text-red-700 mt-1">{lastResult.error}</p>}
                        {lastResult.details && (
                          <pre className="text-xs mt-2 p-2 bg-white rounded border overflow-auto">
                            {JSON.stringify(lastResult.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Configuração Atual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-blue-700 font-semibold">Instance ID:</p>
                  <p className="text-blue-900 font-mono text-xs">3EB605034006810864C082D554977C76</p>
                </div>
                <div>
                  <p className="text-blue-700 font-semibold">Grupo de Notificações:</p>
                  <p className="text-blue-900 font-mono text-xs">120363419470266629-group</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Histórico de Mensagens</h3>
              <p className="text-sm text-gray-600">Últimas 100 mensagens enviadas</p>
            </div>
            <Button onClick={loadLogs} disabled={loadingLogs} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${loadingLogs ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>

          {loadingLogs ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                <RefreshCw className="h-8 w-8 mx-auto animate-spin mb-2" />
                Carregando logs...
              </CardContent>
            </Card>
          ) : logs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                Nenhuma mensagem enviada ainda
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <Card key={log.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(log.status)}
                        {getTipoBadge(log.tipo)}
                      </div>
                      <span className="text-xs text-gray-500">{new Date(log.created_at).toLocaleString("pt-BR")}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="font-mono text-gray-700">{log.telefone}</span>
                      </div>

                      {(log.reuniao_titulo || log.mentorado_nome) && (
                        <div className="text-sm text-gray-600">
                          {log.reuniao_titulo && <span>📅 {log.reuniao_titulo}</span>}
                          {log.mentorado_nome && <span>👤 {log.mentorado_nome}</span>}
                        </div>
                      )}

                      <div className="bg-gray-50 p-3 rounded border text-sm whitespace-pre-wrap font-mono">
                        {log.mensagem}
                      </div>

                      {log.error_message && (
                        <div className="bg-red-50 border border-red-200 p-2 rounded text-xs text-red-700">
                          <strong>Erro:</strong> {log.error_message}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
