-- Adicionar coluna admin_id na tabela reunioes para rastrear qual admin conduz cada reunião
ALTER TABLE reunioes 
  ADD COLUMN IF NOT EXISTS admin_id INTEGER REFERENCES admins(id) ON DELETE SET NULL;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_reunioes_admin ON reunioes(admin_id);

-- Comentário explicativo
COMMENT ON COLUMN reunioes.admin_id IS 'ID do admin/mentor que conduzirá a reunião';

-- Atualizar reuniões existentes para o admin padrão (ID 1)
UPDATE reunioes 
SET admin_id = 1 
WHERE admin_id IS NULL;
