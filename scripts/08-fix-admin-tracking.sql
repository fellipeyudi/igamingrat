-- Adicionar colunas de rastreamento por admin_id e limpar dados "sistema"

-- Adicionar colunas de admin_id para auditoria em reunioes
ALTER TABLE reunioes ADD COLUMN IF NOT EXISTS created_by_admin_id INTEGER REFERENCES admins(id);
ALTER TABLE reunioes ADD COLUMN IF NOT EXISTS updated_by_admin_id INTEGER REFERENCES admins(id);
ALTER TABLE reunioes ADD COLUMN IF NOT EXISTS completed_by_admin_id INTEGER REFERENCES admins(id);

-- Adicionar colunas de admin_id para auditoria em tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS admin_id INTEGER REFERENCES admins(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_by_admin_id INTEGER REFERENCES admins(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS updated_by_admin_id INTEGER REFERENCES admins(id);

-- Adicionar colunas de admin_id para auditoria em mentorados
ALTER TABLE mentorados ADD COLUMN IF NOT EXISTS admin_id INTEGER REFERENCES admins(id);
ALTER TABLE mentorados ADD COLUMN IF NOT EXISTS created_by_admin_id INTEGER REFERENCES admins(id);
ALTER TABLE mentorados ADD COLUMN IF NOT EXISTS updated_by_admin_id INTEGER REFERENCES admins(id);

-- Migrar dados existentes "sistema" para admin_id 1 (admin principal) em reunioes
UPDATE reunioes 
SET created_by_admin_id = 1,
    updated_by_admin_id = COALESCE(admin_id, 1),
    created_by = (SELECT email FROM admins WHERE id = 1 LIMIT 1),
    updated_by = (SELECT email FROM admins WHERE id = COALESCE(reunioes.admin_id, 1) LIMIT 1)
WHERE created_by = 'sistema' OR created_by IS NULL;

UPDATE reunioes 
SET completed_by_admin_id = COALESCE(admin_id, 1),
    completed_by = (SELECT email FROM admins WHERE id = COALESCE(reunioes.admin_id, 1) LIMIT 1)
WHERE completed_by = 'sistema';

-- Migrar dados existentes em tasks
UPDATE tasks 
SET admin_id = 1,
    created_by_admin_id = 1,
    updated_by_admin_id = 1
WHERE criado_por = 'sistema' OR criado_por IS NULL;

-- Migrar dados existentes em mentorados
UPDATE mentorados 
SET admin_id = 1,
    created_by_admin_id = 1,
    updated_by_admin_id = 1,
    created_by = (SELECT email FROM admins WHERE id = 1 LIMIT 1),
    updated_by = (SELECT email FROM admins WHERE id = 1 LIMIT 1)
WHERE created_by = 'sistema' OR created_by IS NULL;

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_reunioes_created_by_admin_id ON reunioes(created_by_admin_id);
CREATE INDEX IF NOT EXISTS idx_reunioes_updated_by_admin_id ON reunioes(updated_by_admin_id);
CREATE INDEX IF NOT EXISTS idx_reunioes_completed_by_admin_id ON reunioes(completed_by_admin_id);
CREATE INDEX IF NOT EXISTS idx_tasks_admin_id ON tasks(admin_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by_admin_id ON tasks(created_by_admin_id);
CREATE INDEX IF NOT EXISTS idx_mentorados_admin_id ON mentorados(admin_id);
CREATE INDEX IF NOT EXISTS idx_mentorados_created_by_admin_id ON mentorados(created_by_admin_id);
