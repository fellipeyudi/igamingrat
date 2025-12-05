-- Renomear tabela meetings para reunioes (nome usado no código)
DROP TABLE IF EXISTS reunioes CASCADE;

-- Criar tabela de reuniões com nome correto
CREATE TABLE reunioes (
  id SERIAL PRIMARY KEY,
  mentorado_id INTEGER REFERENCES mentorados(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  data DATE NOT NULL,
  horario TIME NOT NULL,
  duracao INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'agendada',
  tipo VARCHAR(100) DEFAULT 'Mentoria',
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_reunioes_mentorado ON reunioes(mentorado_id);
CREATE INDEX IF NOT EXISTS idx_reunioes_data ON reunioes(data);
CREATE INDEX IF NOT EXISTS idx_reunioes_status ON reunioes(status);
