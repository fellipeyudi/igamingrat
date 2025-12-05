"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  Target,
  TrendingUp,
  Zap,
  BarChart3,
  Settings,
  Video,
  Menu,
  X,
  Home,
  BookOpen,
  FileText,
} from "lucide-react"

export default function ApresentacaoPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("fases")

  const fases = [
    {
      titulo: "Call de Onboarding",
      icon: Video,
      cor: "bg-blue-600",
      corTexto: "text-blue-600",
      descricao: "Início da jornada",
      itens: [
        "Apresentação do conteúdo que será abordado",
        "Alinhamento do cronograma de todas as calls",
        "Definição das datas pré-estabelecidas",
        "Alinhamento de horários com o mentorado",
        "Esclarecimento de dúvidas sobre o funcionamento",
        "Explicação sobre suporte e cronograma",
        "Estruturação/venda de contingência",
        "Criação de conta na Pepper e upload de documentos",
      ],
    },
    {
      titulo: "Call de Estruturação",
      icon: Settings,
      cor: "bg-purple-600",
      corTexto: "text-purple-600",
      descricao: "Construção da base",
      itens: [
        "Apresentação da oferta",
        "Estruturação completa do funil",
        "Criação de produto na Pepper",
        "Configuração de checkout com planos e orderbumps",
        "Linkagem do checkout no funil de vendas",
        "Configuração do Utmify com Pepper",
        "Criação e configuração do pixel",
      ],
    },
    {
      titulo: "Call de Tráfego",
      icon: TrendingUp,
      cor: "bg-orange-600",
      corTexto: "text-orange-600",
      descricao: "Geração de audiência",
      itens: [
        "Subida das campanhas",
        "Criação e aprovação de criativos",
        "Configuração completa das campanhas",
        "Programação e agendamento",
      ],
    },
    {
      titulo: "Call de Otimização",
      icon: Target,
      cor: "bg-green-600",
      corTexto: "text-green-600",
      descricao: "Refinamento de resultados",
      itens: [
        "Otimização das campanhas ativas",
        "Análise profunda de métricas",
        "Insights sobre otimização",
        "Sugestões de melhorias",
        "Identificação de erros",
        "Preparação para escala",
      ],
    },
    {
      titulo: "Call de Escala",
      icon: Zap,
      cor: "bg-red-600",
      corTexto: "text-red-600",
      descricao: "Expansão estratégica",
      itens: [
        "Insights sobre escala",
        "Pontos críticos de análise ao escalar",
        "Parâmetros e métricas de escala",
        "Tomada de decisão estratégica",
        "Gestão de investimento",
      ],
    },
  ]

  const topicosContingencia = [
    "Estruturação de funis e produtos",
    "Configuração de checkout e tracking",
    "Estratégias de tráfego",
    "Técnicas de otimização",
    "Métodos de escala",
    "Mineração de dados",
    "Parte teórica fundamentada",
  ]

  const renderSidebar = () => (
    <div
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out ${
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">iR</span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Mentoria</h2>
            <p className="text-xs text-gray-600">iGaming Rat</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-2">
        <button
          onClick={() => {
            setActiveSection("fases")
            setIsMobileMenuOpen(false)
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
            activeSection === "fases"
              ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <BookOpen className="h-5 w-5" />
          Fases da Mentoria
        </button>

        <button
          onClick={() => {
            setActiveSection("contingencia")
            setIsMobileMenuOpen(false)
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
            activeSection === "contingencia"
              ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <FileText className="h-5 w-5" />
          Contingência
        </button>
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <Button variant="outline" onClick={() => (window.location.href = "/")} className="w-full">
          <Home className="h-4 w-4 mr-2" />
          Voltar ao Início
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {renderSidebar()}

      <div className="flex-1 lg:ml-64">
        <div className="p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {activeSection === "fases" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Programa de Mentoria</h1>
                  <p className="text-gray-600 mt-1">Um processo estruturado para levar seu negócio ao próximo nível</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {fases.map((fase, index) => {
                    const Icon = fase.icon
                    return (
                      <Card key={index} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center text-center">
                            <div className={`${fase.cor} p-3 rounded-lg mb-3`}>
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            <p className="text-sm font-medium text-gray-600">Fase {index + 1}</p>
                            <p className="text-lg font-bold text-gray-900 mt-1">
                              {fase.titulo.replace("Call de ", "")}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                <div className="space-y-4">
                  {fases.map((fase, index) => {
                    const Icon = fase.icon
                    return (
                      <Card key={index}>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className={`${fase.cor} p-3 rounded-lg flex-shrink-0`}>
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xl font-semibold text-gray-900">{fase.titulo}</h3>
                                <Badge variant="outline" className="ml-2">
                                  Fase {index + 1}
                                </Badge>
                              </div>
                              <p className="text-gray-600 mb-4">{fase.descricao}</p>
                              <div className="grid md:grid-cols-2 gap-3">
                                {fase.itens.map((item, itemIndex) => (
                                  <div key={itemIndex} className="flex items-start gap-2">
                                    <CheckCircle2 className={`h-4 w-4 ${fase.corTexto} mt-0.5 flex-shrink-0`} />
                                    <span className="text-sm text-gray-700">{item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {activeSection === "contingencia" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Contingência - Fundamentos</h1>
                  <p className="text-gray-600 mt-1">Conhecimentos essenciais abordados ao longo da mentoria</p>
                </div>

                <Card>
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      {topicosContingencia.map((topico, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                        >
                          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 font-medium">{topico}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <BarChart3 className="h-8 w-8 text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Próximos Passos</h3>
                        <p className="text-gray-700 leading-relaxed">
                          As datas das calls serão pré-definidas no cronograma e ajustadas conforme sua disponibilidade
                          de horários. Cada fase será concluída antes de avançar para a próxima, garantindo máximo
                          aproveitamento do conteúdo.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
