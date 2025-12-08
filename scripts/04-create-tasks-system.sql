-- Criar tabela de etiquetas/tags personalizáveis
CREATE TABLE IF NOT EXISTS task_tags (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  cor VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de tasks
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  status VARCHAR(50) DEFAULT 'todo', -- todo, em_progresso, concluido, cancelado
  prioridade VARCHAR(50) DEFAULT 'media', -- baixa, media, alta, urgente
  atribuido_para VARCHAR(255), -- Nome do admin responsável
  mentorado_id INTEGER REFERENCES mentorados(id) ON DELETE SET NULL,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_limite DATE,
  data_conclusao TIMESTAMP,
  criado_por VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de relacionamento entre tasks e tags
CREATE TABLE IF NOT EXISTS task_tag_relations (
  id SERIAL PRIMARY KEY,
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES task_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(task_id, tag_id)
);

-- Criar tabela de checklist items dentro de cada task
CREATE TABLE IF NOT EXISTS task_checklist_items (
  id SERIAL PRIMARY KEY,
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  concluido BOOLEAN DEFAULT FALSE,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de comentários nas tasks
CREATE TABLE IF NOT EXISTS task_comments (
  id SERIAL PRIMARY KEY,
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  autor VARCHAR(255) NOT NULL,
  comentario TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir etiquetas padrão
INSERT INTO task_tags (nome, cor) VALUES 
  ('Urgente', 'red'),
  ('Call', 'blue'),
  ('Dúvida', 'yellow'),
  ('Suporte', 'green'),
  ('Mentoria', 'purple'),
  ('Técnico', 'gray'),
  ('Financeiro', 'orange'),
  ('Follow-up', 'pink')
ON CONFLICT DO NOTHING;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_prioridade ON tasks(prioridade);
CREATE INDEX IF NOT EXISTS idx_tasks_atribuido ON tasks(atribuido_para);
CREATE INDEX IF NOT EXISTS idx_tasks_mentorado ON tasks(mentorado_id);
CREATE INDEX IF NOT EXISTS idx_tasks_data_limite ON tasks(data_limite);
CREATE INDEX IF NOT EXISTS idx_task_checklist_task ON task_checklist_items(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_task ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_tag_relations_task ON task_tag_relations(task_id);
CREATE INDEX IF NOT EXISTS idx_task_tag_relations_tag ON task_tag_relations(tag_id);
