-- Adiciona campo arquivado às tasks
ALTER TABLE tasks ADD COLUMN arquivado BOOLEAN DEFAULT FALSE;

-- Criar índice para melhorar performance de queries
CREATE INDEX idx_tasks_arquivado ON tasks(arquivado);
