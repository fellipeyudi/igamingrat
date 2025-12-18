-- Criar tabela de aulas
CREATE TABLE IF NOT EXISTS aulas (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  video_url TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  duracao VARCHAR(50),
  thumbnail_url TEXT,
  ativa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índice para ordenação
CREATE INDEX IF NOT EXISTS idx_aulas_ordem ON aulas(ordem);
CREATE INDEX IF NOT EXISTS idx_aulas_ativa ON aulas(ativa);

-- Inserir aulas de exemplo
INSERT INTO aulas (titulo, descricao, video_url, ordem, duracao) VALUES
('Bem-vindo ao Programa de Mentoria', 'Introdução ao programa e como aproveitar ao máximo sua jornada', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 1, '15:30'),
('Fundamentos do iGaming', 'Entenda os conceitos básicos da indústria de iGaming', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 2, '25:45'),
('Estratégias de Crescimento', 'Aprenda as melhores práticas para crescer seu negócio', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 3, '32:10');
