import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(
  "postgresql://neondb_owner:npg_TNMj2X4HrqEw@ep-misty-mode-acoot3dc-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
)

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const mentoradoResult = await sql`
      SELECT id FROM mentorados WHERE slug = ${params.slug} LIMIT 1
    `

    if (mentoradoResult.length === 0) {
      return NextResponse.json({ error: "Mentorado não encontrado" }, { status: 404 })
    }

    const mentoradoId = mentoradoResult[0].id

    const aulasResult = await sql`
      SELECT 
        a.id,
        a.titulo,
        a.descricao as descricao_curta,
        a.descricao_detalhada,
        a.video_url,
        a.ordem,
        a.duracao,
        a.thumbnail_url,
        a.modulo,
        a.ativa,
        a.status
      FROM aulas a
      WHERE a.ativa = true
      ORDER BY a.ordem ASC
    `

    // Buscar objetivos de aprendizado para cada aula
    const objetivosResult = await sql`
      SELECT aula_id, texto
      FROM objetivos_aprendizado
      ORDER BY aula_id, id
    `

    // Buscar materiais complementares para cada aula
    const materiaisResult = await sql`
      SELECT aula_id, titulo, url, tipo, arquivo_base64, arquivo_nome, arquivo_tamanho
      FROM materiais_complementares
      ORDER BY aula_id, id
    `

    // Buscar progresso do mentorado
    const progressoResult = await sql`
      SELECT aula_id, concluida, tempo_assistido
      FROM progresso_aulas
      WHERE mentorado_id = ${mentoradoId}
    `

    const progressoPorAula = progressoResult.reduce((acc: any, prog: any) => {
      acc[prog.aula_id] = {
        concluida: prog.concluida,
        tempoAssistido: prog.tempo_assistido || 0,
      }
      return acc
    }, {})

    // Organizar dados
    const objetivosPorAula = objetivosResult.reduce((acc: any, obj: any) => {
      if (!acc[obj.aula_id]) acc[obj.aula_id] = []
      acc[obj.aula_id].push(obj.texto)
      return acc
    }, {})

    const materiaisPorAula = materiaisResult.reduce((acc: any, mat: any) => {
      if (!acc[mat.aula_id]) acc[mat.aula_id] = []
      acc[mat.aula_id].push({
        titulo: mat.titulo,
        url: mat.url,
        tipo: mat.tipo,
        arquivoBase64: mat.arquivo_base64,
        arquivoNome: mat.arquivo_nome,
        arquivoTamanho: mat.arquivo_tamanho,
      })
      return acc
    }, {})

    // Formatar resposta
    const aulas = aulasResult.map((aula: any) => ({
      id: aula.id,
      titulo: aula.titulo,
      descricao: aula.descricao_curta || aula.descricao_detalhada || "",
      descricaoDetalhada: aula.descricao_detalhada || "",
      modulo: aula.modulo || "Módulo Geral",
      duracao: `${aula.duracao || 60} minutos`,
      videoUrl: aula.video_url || "",
      thumbnailUrl: aula.thumbnail_url || "",
      ordem: aula.ordem,
      concluida: progressoPorAula[aula.id]?.concluida || false,
      progresso: progressoPorAula[aula.id]?.tempoAssistido || 0,
      objetivosAprendizado: objetivosPorAula[aula.id] || [],
      materiais: materiaisPorAula[aula.id] || [],
      status: aula.status || "rascunho",
    }))

    const totalAulas = aulas.length
    const aulasCompletas = aulas.filter((a: any) => a.concluida).length
    const progressoPercentual = totalAulas > 0 ? Math.round((aulasCompletas / totalAulas) * 100) : 0

    return NextResponse.json({
      aulas,
      progresso: {
        total: totalAulas,
        completas: aulasCompletas,
        percentual: progressoPercentual,
      },
    })
  } catch (error: any) {
    console.error("[v0] Erro ao buscar aulas:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
