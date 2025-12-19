-- Script para criar/atualizar tabela de progresso de aulas dos mentorados
-- Este script garante que o progresso seja salvo permanentemente

-- Criar tabela de progresso se não existir
CREATE TABLE IF NOT EXISTS progresso_aulas (
    id SERIAL PRIMARY KEY,
    mentorado_id INTEGER NOT NULL,
    aula_id INTEGER NOT NULL,
    concluida BOOLEAN DEFAULT false,
    data_conclusao TIMESTAMP,
    tempo_assistido INTEGER DEFAULT 0, -- em segundos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(mentorado_id, aula_id),
    FOREIGN KEY (mentorado_id) REFERENCES mentorados(id) ON DELETE CASCADE,
    FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE CASCADE
);

-- Criar índices para melhorar performance das consultas
CREATE INDEX IF NOT EXISTS idx_progresso_mentorado ON progresso_aulas(mentorado_id);
CREATE INDEX IF NOT EXISTS idx_progresso_aula ON progresso_aulas(aula_id);
CREATE INDEX IF NOT EXISTS idx_progresso_concluida ON progresso_aulas(concluida);
CREATE INDEX IF NOT EXISTS idx_progresso_mentorado_concluida ON progresso_aulas(mentorado_id, concluida);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_progresso_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_progresso_updated_at ON progresso_aulas;
CREATE TRIGGER trigger_update_progresso_updated_at
    BEFORE UPDATE ON progresso_aulas
    FOR EACH ROW
    EXECUTE FUNCTION update_progresso_updated_at();

-- View para facilitar consultas de progresso por mentorado
CREATE OR REPLACE VIEW vw_progresso_mentorados AS
SELECT 
    m.id as mentorado_id,
    m.nome as mentorado_nome,
    m.slug as mentorado_slug,
    COUNT(DISTINCT a.id) as total_aulas,
    COUNT(DISTINCT CASE WHEN pa.concluida = true THEN pa.aula_id END) as aulas_concluidas,
    ROUND(
        (COUNT(DISTINCT CASE WHEN pa.concluida = true THEN pa.aula_id END)::DECIMAL / 
        NULLIF(COUNT(DISTINCT a.id), 0)) * 100, 
        2
    ) as percentual_conclusao,
    SUM(CASE WHEN pa.concluida = true THEN a.duracao ELSE 0 END) as minutos_assistidos
FROM mentorados m
CROSS JOIN aulas a
LEFT JOIN progresso_aulas pa ON pa.mentorado_id = m.id AND pa.aula_id = a.id
WHERE a.ativa = true
GROUP BY m.id, m.nome, m.slug;

-- Comentários para documentação
COMMENT ON TABLE progresso_aulas IS 'Armazena o progresso de cada mentorado em cada aula';
COMMENT ON COLUMN progresso_aulas.mentorado_id IS 'ID do mentorado';
COMMENT ON COLUMN progresso_aulas.aula_id IS 'ID da aula';
COMMENT ON COLUMN progresso_aulas.concluida IS 'Se a aula foi marcada como concluída';
COMMENT ON COLUMN progresso_aulas.data_conclusao IS 'Data e hora em que a aula foi concluída';
COMMENT ON COLUMN progresso_aulas.tempo_assistido IS 'Tempo total assistido em segundos';
