import { ArrowLeft, Save, User, Building, Target, Calendar, MessageSquare, Plus, Trash2, Edit3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function EditarMentorado({ params }: { params: { slug: string } }) {
  // Mock data - em produção viria do banco de dados
  const mentorado = {
    nome: "João Silva",
    email: "joao@techstart.com",
    telefone: "(11) 99999-9999",
    empresa: "TechStart Solutions",
    setor: "Tecnologia",
    fase: "estruturacao",
    callsRealizadas: 12,
    modulosConcluidos: 4,
    diasMentoria: 28,
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Editar: {mentorado.nome}</h1>
              <p className="text-gray-600">Personalize todas as informações do dashboard</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/${params.slug}`}>
              <Button variant="outline">Ver Dashboard</Button>
            </Link>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </div>

        <Tabs defaultValue="geral" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="progresso">Progresso</TabsTrigger>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
            <TabsTrigger value="anotacoes">Anotações</TabsTrigger>
            <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
          </TabsList>

          {/* Aba Geral */}
          <TabsContent value="geral" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informações Pessoais */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informações Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input id="nome" defaultValue={mentorado.nome} />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={mentorado.email} />
                  </div>
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input id="telefone" defaultValue={mentorado.telefone} />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug (URL)</Label>
                    <Input id="slug" defaultValue={params.slug} />
                    <p className="text-xs text-gray-500 mt-1">URL atual: /{params.slug}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Informações da Empresa */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Informações da Empresa
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="empresa">Nome da Empresa</Label>
                    <Input id="empresa" defaultValue={mentorado.empresa} />
                  </div>
                  <div>
                    <Label htmlFor="setor">Setor</Label>
                    <Input id="setor" defaultValue={mentorado.setor} />
                  </div>
                  <div>
                    <Label htmlFor="descricao">Descrição do Negócio</Label>
                    <Textarea id="descricao" placeholder="Descreva o negócio..." rows={3} />
                  </div>
                  <div>
                    <Label htmlFor="objetivo">Objetivo da Mentoria</Label>
                    <Textarea id="objetivo" placeholder="Qual o objetivo principal?" rows={2} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Aba Progresso */}
          <TabsContent value="progresso" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Configurações de Progresso */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Configurações de Progresso
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="fase">Fase Atual</Label>
                    <Select defaultValue={mentorado.fase}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planejamento">Planejamento</SelectItem>
                        <SelectItem value="analise">Análise</SelectItem>
                        <SelectItem value="estruturacao">Estruturação</SelectItem>
                        <SelectItem value="operacao">Operação</SelectItem>
                        {/* Removed SelectItem of "Crescimento" */}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="calls">Calls Realizadas</Label>
                      <Input id="calls" type="number" defaultValue={mentorado.callsRealizadas} />
                    </div>
                    <div>
                      <Label htmlFor="modulos">Módulos</Label>
                      <Input id="modulos" type="number" defaultValue={mentorado.modulosConcluidos} />
                    </div>
                    <div>
                      <Label htmlFor="dias">Dias</Label>
                      <Input id="dias" type="number" defaultValue={mentorado.diasMentoria} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status Cards Personalizáveis */}
              <Card>
                <CardHeader>
                  <CardTitle>Status Cards</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-green-800">Concluído recentemente</span>
                        <Button size="sm" variant="ghost">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Textarea
                        className="text-sm border-0 p-0 bg-transparent resize-none"
                        defaultValue="Finalizamos a definição dos objetivos estratégicos e análise completa do mercado..."
                        rows={2}
                      />
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-blue-800">Trabalhando agora</span>
                        <Button size="sm" variant="ghost">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Textarea
                        className="text-sm border-0 p-0 bg-transparent resize-none"
                        defaultValue="Estamos desenvolvendo o plano de negócios detalhado..."
                        rows={2}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Aba Agenda */}
          <TabsContent value="agenda" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Gerenciar Agenda
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Última Call */}
                <div className="space-y-3">
                  <h4 className="font-semibold">Última Call Realizada</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ultimaCallData">Data</Label>
                      <Input id="ultimaCallData" type="date" defaultValue="2025-08-22" />
                    </div>
                    <div>
                      <Label htmlFor="ultimaCallDuracao">Duração</Label>
                      <Input id="ultimaCallDuracao" placeholder="1h30min" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="ultimaCallResumo">Resumo da Call</Label>
                    <Textarea
                      id="ultimaCallResumo"
                      defaultValue="Revisamos o modelo de negócio e definimos as próximas ações..."
                      rows={2}
                    />
                  </div>
                </div>

                {/* Próxima Call */}
                <div className="space-y-3 pt-4 border-t">
                  <h4 className="font-semibold">Próxima Call Agendada</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="proximaCallData">Data</Label>
                      <Input id="proximaCallData" type="date" defaultValue="2025-08-29" />
                    </div>
                    <div>
                      <Label htmlFor="proximaCallHorario">Horário</Label>
                      <Input id="proximaCallHorario" placeholder="14:30 - 16:00" />
                    </div>
                    <div>
                      <Label htmlFor="proximaCallStatus">Status</Label>
                      <Select defaultValue="agendada">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="agendada">Agendada</SelectItem>
                          <SelectItem value="pendente">Pendente</SelectItem>
                          <SelectItem value="cancelada">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="proximaCallPauta">Pauta da Call</Label>
                    <Textarea
                      id="proximaCallPauta"
                      defaultValue="Revisão do plano de negócios e definição das estratégias de marketing digital"
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Anotações */}
          <TabsContent value="anotacoes" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Anotações da Mentoria
                  </CardTitle>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Anotação
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Lista de Anotações */}
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">22/08/2025 - 16:30</Badge>
                        <Select defaultValue="azul">
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="azul">Azul</SelectItem>
                            <SelectItem value="verde">Verde</SelectItem>
                            <SelectItem value="laranja">Laranja</SelectItem>
                            <SelectItem value="vermelho">Vermelho</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea
                      defaultValue="João está evoluindo muito bem na estruturação do negócio. Conseguimos validar o modelo e agora estamos focando no plano de negócios..."
                      rows={3}
                    />
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">15/08/2025 - 14:45</Badge>
                        <Select defaultValue="verde">
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="azul">Azul</SelectItem>
                            <SelectItem value="verde">Verde</SelectItem>
                            <SelectItem value="laranja">Laranja</SelectItem>
                            <SelectItem value="vermelho">Vermelho</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea
                      defaultValue="Excelente progresso na análise de mercado! João trouxe dados consistentes e identificou oportunidades..."
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Conteúdo */}
          <TabsContent value="conteudo" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Conquistas e Marcos */}
              <Card>
                <CardHeader>
                  <CardTitle>Conquistas e Marcos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Conquistas Recentes</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center gap-2 p-2 border rounded">
                        <Input placeholder="Título da conquista" className="flex-1" />
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 p-2 border rounded">
                        <Input placeholder="Título da conquista" className="flex-1" />
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="mt-2 bg-transparent">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Conquista
                    </Button>
                  </div>

                  <div>
                    <Label>Próximos Marcos</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center gap-2 p-2 border rounded">
                        <Input placeholder="Título do marco" className="flex-1" />
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 p-2 border rounded">
                        <Input placeholder="Título do marco" className="flex-1" />
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="mt-2 bg-transparent">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Marco
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Status da Empresa */}
              <Card>
                <CardHeader>
                  <CardTitle>Status da Empresa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="estagioAtual">Estágio Atual</Label>
                    <Input id="estagioAtual" defaultValue="Estruturação" />
                  </div>
                  <div>
                    <Label htmlFor="descricaoEstagio">Descrição do Estágio</Label>
                    <Textarea
                      id="descricaoEstagio"
                      defaultValue="Sua empresa está na fase de estruturação do negócio..."
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="proximaFase">Próxima Fase</Label>
                    <Input id="proximaFase" defaultValue="Operação" />
                  </div>
                  <div>
                    <Label htmlFor="acaoPrioritaria">Ação Prioritária</Label>
                    <Textarea
                      id="acaoPrioritaria"
                      defaultValue="Finalizar análise de concorrência até 30/08..."
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
