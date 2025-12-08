-- Adicionar campos para melhorar o sistema de comentários
ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS mencoes TEXT[]; -- Array de emails dos admins mencionados
ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS anexos JSONB; -- Array de anexos {nome, data_base64, tamanho}
ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS autor_email VARCHAR(255); -- Email do autor do comentário

-- Criar índice para buscas
CREATE INDEX IF NOT EXISTS idx_task_comments_autor_email ON task_comments(autor_email);
