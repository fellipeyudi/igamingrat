import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(
  "postgresql://neondb_owner:npg_TNMj2X4HrqEw@ep-misty-mode-acoot3dc-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
)

// GET - Buscar aula específica
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const aulaId = params.id

    const [aula] = await sql`
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
      WHERE a.id = ${aulaId}
    `

    if (!aula) {
      return NextResponse.json({ error: "Aula não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ aula })
  } catch (error) {
    console.error("[v0] Erro ao buscar aula:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

// PUT - Atualizar aula
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const aulaId = params.id
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

    const [aula] = await sql`
      UPDATE aulas SET
        titulo = ${titulo},
        descricao = ${descricao || null},
        descricao_curta = ${descricao_curta || null},
        descricao_detalhada = ${descricao_detalhada || null},
        modulo = ${modulo || null},
        ordem = ${ordem},
        duracao = ${duracao},
        thumbnail_url = ${thumbnail_url || null},
        video_url = ${video_url},
        status = ${status || "rascunho"},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${aulaId}
      RETURNING *
    `

    if (!aula) {
      return NextResponse.json({ error: "Aula não encontrada" }, { status: 404 })
    }

    if (objetivos && Array.isArray(objetivos)) {
      await sql`DELETE FROM objetivos_aprendizado WHERE aula_id = ${aulaId}`

      for (let i = 0; i < objetivos.length; i++) {
        const objetivo = objetivos[i]
        // Aceita tanto string quanto objeto
        const textoObjetivo = typeof objetivo === "string" ? objetivo : objetivo?.texto || ""

        // Só insere se houver texto
        if (textoObjetivo.trim()) {
          await sql`
            INSERT INTO objetivos_aprendizado (aula_id, texto, ordem)
            VALUES (${aulaId}, ${textoObjetivo}, ${i})
          `
        }
      }
    }

    if (materiais && Array.isArray(materiais)) {
      await sql`DELETE FROM materiais_complementares WHERE aula_id = ${aulaId}`

      for (let i = 0; i < materiais.length; i++) {
        const material = materiais[i]
        // Se for string, converte para objeto
        const materialObj = typeof material === "string" ? { titulo: material, tipo: "link", url: material } : material

        // Só insere se houver título
        if (materialObj?.titulo?.trim()) {
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
              ${aulaId}, 
              ${materialObj.titulo}, 
              ${materialObj.tipo || "link"}, 
              ${materialObj.url || null},
              ${materialObj.arquivo_base64 || null},
              ${materialObj.arquivo_nome || null},
              ${materialObj.arquivo_tamanho || null},
              ${i}
            )
          `
        }
      }
    }

    return NextResponse.json({ message: "Aula atualizada com sucesso", aula })
  } catch (error) {
    console.error("[v0] Erro ao atualizar aula:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

// DELETE - Deletar aula
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const aulaId = params.id

    // O CASCADE nas foreign keys vai deletar objetivos e materiais automaticamente
    await sql`DELETE FROM aulas WHERE id = ${aulaId}`

    return NextResponse.json({ message: "Aula deletada com sucesso" })
  } catch (error) {
    console.error("[v0] Erro ao deletar aula:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
