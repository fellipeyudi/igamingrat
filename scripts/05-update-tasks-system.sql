-- Adicionar colunas de horário e anexos às tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS horario TIME;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS anexos JSONB DEFAULT '[]'::jsonb;

-- Criar índice para melhor performance em buscas
CREATE INDEX IF NOT EXISTS idx_tasks_mentorado_id ON tasks(mentorado_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_data_limite ON tasks(data_limite);
