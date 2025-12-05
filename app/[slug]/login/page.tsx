"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, ArrowRight, AlertCircle } from "lucide-react"

export default function MentoradoLogin() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  useEffect(() => {
    // Buscar nome do mentorado pela slug
    const fetchMentorado = async () => {
      try {
        const response = await fetch(`/api/mentorado/${slug}`)
        if (response.ok) {
          const data = await response.json()
          // setMentoradoNome(data.nome)
        }
      } catch (error) {
        console.error("Erro ao buscar mentorado:", error)
      }
    }

    fetchMentorado()
  }, [slug])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      console.log("[v0] Iniciando login com:", { email, slug })

      const response = await fetch("/api/mentorado/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, slug }),
      })

      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response ok:", response.ok)

      const contentType = response.headers.get("content-type")
      console.log("[v0] Content-Type:", contentType)

      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text()
        console.log("[v0] Resposta não é JSON:", textResponse)
        setError("Erro interno do servidor. Tente novamente.")
        return
      }

      const data = await response.json()
      console.log("[v0] Response data:", data)

      if (response.ok) {
        localStorage.setItem("mentorado_token", data.token)
        router.push(`/${slug}`)
      } else {
        setError(data.error || "Erro ao fazer login")
      }
    } catch (error) {
      console.error("[v0] Erro no login:", error)
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>Informe seu email para acessar seu dashboard de acompanhamento</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Seu email cadastrado"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                "Verificando..."
              ) : (
                <>
                  Acessar Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
