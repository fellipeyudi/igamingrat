"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Copy, Users, AlertCircle } from "lucide-react"

export default function WhatsAppGroupsPage() {
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    loadGroups()
  }, [])

  const loadGroups = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await fetch("/api/whatsapp/groups")
      const data = await response.json()

      console.log("[v0] Resposta da API de grupos:", data)

      if (data.success) {
        if (Array.isArray(data.groups)) {
          setGroups(data.groups)
        } else if (data.groups && Array.isArray(data.groups.data)) {
          setGroups(data.groups.data)
        } else if (data.groups && typeof data.groups === "object") {
          setGroups([data.groups])
        } else {
          setGroups([])
        }
      } else {
        setError(data.error || "Erro ao carregar grupos")
      }
    } catch (error: any) {
      console.error("Erro ao carregar grupos:", error)
      setError(error.message || "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (groupId: string) => {
    navigator.clipboard.writeText(groupId)
    setCopiedId(groupId)
    setTimeout(() => setCopiedId(""), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Carregando grupos...</h1>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6 border-destructive">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="w-6 h-6" />
              <div>
                <h3 className="font-semibold">Erro ao carregar grupos</h3>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
            <Button onClick={loadGroups} className="mt-4">
              Tentar novamente
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Grupos do WhatsApp</h1>
        </div>

        <div className="space-y-4">
          {groups.length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground">Nenhum grupo encontrado</Card>
          ) : (
            groups.map((group: any, index) => {
              const groupId = group.phone ? `${group.phone.replace("-group", "")}@g.us` : group.id || group.jid

              return (
                <Card key={groupId || index} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{group.name || group.subject || "Sem nome"}</h3>
                      <p className="text-sm text-muted-foreground mt-1 font-mono">ID: {groupId}</p>
                      {group.participants && (
                        <p className="text-xs text-muted-foreground mt-1">{group.participants.length} participantes</p>
                      )}
                    </div>

                    <Button
                      variant={copiedId === groupId ? "default" : "outline"}
                      size="sm"
                      onClick={() => copyToClipboard(groupId)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      {copiedId === groupId ? "Copiado!" : "Copiar ID"}
                    </Button>
                  </div>
                </Card>
              )
            })
          )}
        </div>

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Como usar:</h3>
          <ol className="text-sm text-muted-foreground space-y-1">
            <li>1. Encontre o grupo desejado na lista acima</li>
            <li>2. Clique em "Copiar ID" para copiar o ID do grupo</li>
            <li>3. Envie este ID para configurar as notificações para o grupo</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
