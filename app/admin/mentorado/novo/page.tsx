import { ArrowLeft, Save, User, Building, Target, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

export default function NovoMentorado() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Novo Mentorado</h1>
            <p className="text-gray-600">Adicione um novo mentorado ao seu programa</p>
          </div>
        </div>

        <form className="space-y-6">
          {/* Informações Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input id="nome" placeholder="Ex: João Silva" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="joao@exemplo.com" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input id="telefone" placeholder="(11) 99999-9999" />
                </div>
                <div>
                  <Label htmlFor="slug">Slug (URL personalizada)</Label>
                  <Input id="slug" placeholder="joao-silva" />
                  <p className="text-xs text-gray-500 mt-1">Será usado na URL: /joao-silva</p>
                </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="empresa">Nome da Empresa</Label>
                  <Input id="empresa" placeholder="Ex: TechStart Solutions" />
                </div>
                <div>
                  <Label htmlFor="setor">Setor</Label>
                  <Input id="setor" placeholder="Ex: Tecnologia, Saúde, Educação" />
                </div>
              </div>
              <div>
                <Label htmlFor="descricao">Descrição do Negócio</Label>
                <Textarea id="descricao" placeholder="Descreva brevemente o negócio do mentorado..." rows={3} />
              </div>
            </CardContent>
          </Card>

          {/* Configurações da Mentoria */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Configurações da Mentoria
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="fase">Fase Inicial</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a fase" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planejamento">Planejamento</SelectItem>
                      <SelectItem value="analise">Análise</SelectItem>
                      <SelectItem value="estruturacao">Estruturação</SelectItem>
                      <SelectItem value="operacao">Operação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="progresso">Progresso Inicial (%)</Label>
                  <Input id="progresso" type="number" min="0" max="100" placeholder="1" /> {/* updated placeholder */}
                </div>
                <div>
                  <Label htmlFor="dataInicio">Data de Início</Label>
                  <Input id="dataInicio" type="date" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="objetivo">Objetivo Principal</Label>
                  <Textarea id="objetivo" placeholder="Qual o principal objetivo desta mentoria?" rows={2} />
                </div>
                <div>
                  <Label htmlFor="desafios">Principais Desafios</Label>
                  <Textarea id="desafios" placeholder="Quais os principais desafios identificados?" rows={2} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configurações Iniciais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Configurações Iniciais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="callsRealizadas">Calls Realizadas</Label>
                  <Input id="callsRealizadas" type="number" min="0" placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="modulosConcluidos">Módulos Concluídos</Label>
                  <Input id="modulosConcluidos" type="number" min="0" placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="diasMentoria">Dias de Mentoria</Label>
                  <Input id="diasMentoria" type="number" min="0" placeholder="0" />
                </div>
              </div>

              <div>
                <Label htmlFor="anotacaoInicial">Anotação Inicial</Label>
                <Textarea
                  id="anotacaoInicial"
                  placeholder="Adicione uma anotação inicial sobre este mentorado..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Link href="/admin">
              <Button variant="outline">Cancelar</Button>
            </Link>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              Criar Mentorado
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
