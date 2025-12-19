-- Criar tabela de comentários das aulas
CREATE TABLE IF NOT EXISTS comentarios_aulas (
  id SERIAL PRIMARY KEY,
  aula_id INTEGER NOT NULL REFERENCES aulas(id) ON DELETE CASCADE,
  mentorado_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comentario TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_comentarios_aula_id ON comentarios_aulas(aula_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_mentorado_id ON comentarios_aulas(mentorado_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_created_at ON comentarios_aulas(created_at DESC);
