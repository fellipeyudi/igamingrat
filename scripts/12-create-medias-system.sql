-- Criar tabela de mídias de campanhas/métricas para mentorados
CREATE TABLE IF NOT EXISTS mentorado_midias (
  id SERIAL PRIMARY KEY,
  mentorado_id INTEGER NOT NULL REFERENCES mentorados(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL, -- 'imagem', 'video', 'documento', 'metrica'
  categoria VARCHAR(50) DEFAULT 'campanha', -- 'campanha', 'metrica', 'resultado', 'outro'
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  nome_arquivo VARCHAR(255),
  url TEXT NOT NULL, -- URL da mídia armazenada
  tamanho INTEGER, -- em bytes
  data_midia DATE, -- Dia em que a mídia/métrica foi gerada
  horario_midia TIME, -- Horário da mídia/métrica
  reuniao_id INTEGER REFERENCES reunioes(id) ON DELETE SET NULL, -- Mídia vinculada a uma call
  metricas JSONB, -- Métricas adicionais: {alcance: 1000, conversao: 5.2, roi: 250}
  uploaded_by VARCHAR(255), -- Quem fez upload
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_mentorado_midias_mentorado ON mentorado_midias(mentorado_id);
CREATE INDEX IF NOT EXISTS idx_mentorado_midias_tipo ON mentorado_midias(tipo);
CREATE INDEX IF NOT EXISTS idx_mentorado_midias_categoria ON mentorado_midias(categoria);
CREATE INDEX IF NOT EXISTS idx_mentorado_midias_reuniao ON mentorado_midias(reuniao_id);
CREATE INDEX IF NOT EXISTS idx_mentorado_midias_data ON mentorado_midias(data_midia DESC);

-- Comentários explicativos
COMMENT ON TABLE mentorado_midias IS 'Armazena mídias, campanhas e métricas dos mentorados';
COMMENT ON COLUMN mentorado_midias.tipo IS 'Tipo de arquivo: imagem, video, documento, metrica';
COMMENT ON COLUMN mentorado_midias.categoria IS 'Categoria da mídia: campanha, metrica, resultado, outro';
COMMENT ON COLUMN mentorado_midias.metricas IS 'Métricas JSON: alcance, conversao, roi, cliques, impressoes, etc';
COMMENT ON COLUMN mentorado_midias.data_midia IS 'Data em que a campanha/métrica foi executada';
COMMENT ON COLUMN mentorado_midias.reuniao_id IS 'Vincula a mídia a uma reunião específica';
