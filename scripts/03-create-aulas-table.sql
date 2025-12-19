-- Tabela de Aulas
CREATE TABLE IF NOT EXISTS aulas (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  modulo VARCHAR(100) NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  duracao INTEGER NOT NULL, -- em minutos
  thumbnail_url TEXT,
  video_url TEXT,
  sobre_aula TEXT, -- Descrição expandida para "Sobre esta aula"
  status VARCHAR(20) DEFAULT 'rascunho', -- rascunho, publicado
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Objetivos de Aprendizado ("O que você vai aprender")
CREATE TABLE IF NOT EXISTS aula_objetivos (
  id SERIAL PRIMARY KEY,
  aula_id INTEGER NOT NULL REFERENCES aulas(id) ON DELETE CASCADE,
  objetivo TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Materiais Complementares
CREATE TABLE IF NOT EXISTS aula_materiais (
  id SERIAL PRIMARY KEY,
  aula_id INTEGER NOT NULL REFERENCES aulas(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- pdf, link, imagem, video, etc
  url TEXT NOT NULL,
  tamanho VARCHAR(50), -- ex: "2.5 MB" para arquivos
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Progresso do Aluno
CREATE TABLE IF NOT EXISTS aula_progresso (
  id SERIAL PRIMARY KEY,
  aula_id INTEGER NOT NULL REFERENCES aulas(id) ON DELETE CASCADE,
  mentorado_id INTEGER NOT NULL REFERENCES mentorados(id) ON DELETE CASCADE,
  concluida BOOLEAN DEFAULT FALSE,
  data_conclusao TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(aula_id, mentorado_id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_aulas_modulo ON aulas(modulo);
CREATE INDEX IF NOT EXISTS idx_aulas_ordem ON aulas(ordem);
CREATE INDEX IF NOT EXISTS idx_aula_objetivos_aula_id ON aula_objetivos(aula_id);
CREATE INDEX IF NOT EXISTS idx_aula_materiais_aula_id ON aula_materiais(aula_id);
CREATE INDEX IF NOT EXISTS idx_aula_progresso_mentorado ON aula_progresso(mentorado_id);
CREATE INDEX IF NOT EXISTS idx_aula_progresso_aula ON aula_progresso(aula_id);

-- Inserir dados de exemplo
INSERT INTO aulas (titulo, descricao, modulo, ordem, duracao, thumbnail_url, video_url, sobre_aula, status) VALUES
('Introdução ao iGaming', 'Conceitos básicos e fundamentos do mercado de iGaming', 'Módulo 1 - Fundamentos', 1, 60, '/placeholder.svg?height=200&width=350', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Conceitos básicos e fundamentos do mercado de iGaming', 'publicado'),
('Regulamentação e Compliance', 'Entenda as leis e regulamentações do setor', 'Módulo 1 - Fundamentos', 2, 45, '/placeholder.svg?height=200&width=350', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Entenda as principais regulamentações do mercado de iGaming e como garantir compliance', 'publicado'),
('Análise de Dados e Métricas', 'Como interpretar dados e tomar decisões', 'Módulo 2 - Marketing', 3, 75, '/placeholder.svg?height=200&width=350', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Aprenda a analisar dados de jogadores e métricas de performance', 'publicado');

-- Inserir objetivos de aprendizado
INSERT INTO aula_objetivos (aula_id, objetivo, ordem) VALUES
(1, 'Fundamentos essenciais do tema', 1),
(1, 'Aplicações práticas no dia a dia', 2),
(1, 'Estratégias avançadas e cases de sucesso', 3),
(2, 'Principais regulamentações do setor', 1),
(2, 'Como garantir compliance', 2),
(3, 'Análise de métricas de performance', 1),
(3, 'Tomada de decisões baseada em dados', 2);

-- Inserir materiais complementares
INSERT INTO aula_materiais (aula_id, titulo, tipo, url, tamanho) VALUES
(1, 'Guia Completo de iGaming', 'pdf', '/materiais/guia-igaming.pdf', '2.5 MB'),
(1, 'Checklist de Implementação', 'pdf', '/materiais/checklist.pdf', '500 KB'),
(2, 'Documentação Oficial de Regulamentação', 'link', 'https://example.com/regulamentacao', NULL),
(3, 'Template de Dashboard Analytics', 'pdf', '/materiais/dashboard-template.pdf', '1.2 MB');
