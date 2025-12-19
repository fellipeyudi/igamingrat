import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(
  "postgresql://neondb_owner:npg_TNMj2X4HrqEw@ep-misty-mode-acoot3dc-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
)

// GET - Listar todas as aulas
export async function GET() {
  try {
    const aulas = await sql`
      SELECT 
        a.*,
        COALESCE(
          (
            SELECT json_agg(
              jsonb_build_object(
                'id', ao.id,
                'texto', ao.texto,
                'ordem', ao.ordem
              ) ORDER BY ao.ordem
            )
            FROM objetivos_aprendizado ao
            WHERE ao.aula_id = a.id
          ),
          '[]'
        ) as objetivos,
        COALESCE(
          (
            SELECT json_agg(
              jsonb_build_object(
                'id', am.id,
                'titulo', am.titulo,
                'tipo', am.tipo,
                'url', am.url,
                'arquivo_nome', am.arquivo_nome,
                'arquivo_tamanho', am.arquivo_tamanho
              ) ORDER BY am.ordem
            )
            FROM materiais_complementares am
            WHERE am.aula_id = a.id
          ),
          '[]'
        ) as materiais
      FROM aulas a
      ORDER BY a.ordem ASC, a.id DESC
    `

    return NextResponse.json({ aulas })
  } catch (error) {
    console.error("[v0] Erro ao buscar aulas:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

// POST - Criar nova aula
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      titulo,
      descricao,
      descricao_curta,
      descricao_detalhada,
      modulo,
      ordem,
      duracao,
      thumbnail_url,
      video_url,
      status,
      objetivos,
      materiais,
    } = body

    if (!titulo || !video_url) {
      return NextResponse.json({ error: "Campos obrigatórios: titulo, video_url" }, { status: 400 })
    }

    const [aula] = await sql`
      INSERT INTO aulas (
        titulo, 
        descricao, 
        descricao_curta,
        descricao_detalhada,
        modulo,
        video_url, 
        ordem, 
        duracao, 
        thumbnail_url, 
        status,
        ativa
      )
      VALUES (
        ${titulo}, 
        ${descricao || null}, 
        ${descricao_curta || null},
        ${descricao_detalhada || null},
        ${modulo || null},
        ${video_url}, 
        ${ordem || 0}, 
        ${duracao || null},
        ${thumbnail_url || null},
        ${status || "rascunho"},
        ${true}
      )
      RETURNING *
    `

    if (objetivos && Array.isArray(objetivos) && objetivos.length > 0) {
      for (let i = 0; i < objetivos.length; i++) {
        const textoObjetivo = typeof objetivos[i] === "string" ? objetivos[i] : objetivos[i].texto
        await sql`
          INSERT INTO objetivos_aprendizado (aula_id, texto, ordem)
          VALUES (${aula.id}, ${textoObjetivo}, ${i})
        `
      }
    }

    if (materiais && Array.isArray(materiais) && materiais.length > 0) {
      for (let i = 0; i < materiais.length; i++) {
        const material = materiais[i]
        await sql`
          INSERT INTO materiais_complementares (
            aula_id, 
            titulo, 
            tipo, 
            url,
            arquivo_base64,
            arquivo_nome,
            arquivo_tamanho,
            ordem
          )
          VALUES (
            ${aula.id}, 
            ${material.titulo}, 
            ${material.tipo}, 
            ${material.url || null},
            ${material.arquivo_base64 || null},
            ${material.arquivo_nome || null},
            ${material.arquivo_tamanho || null},
            ${i}
          )
        `
      }
    }

    return NextResponse.json({ message: "Aula criada com sucesso", aula }, { status: 201 })
  } catch (error) {
    console.error("[v0] Erro ao criar aula:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
