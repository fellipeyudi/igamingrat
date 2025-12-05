-- Adicionar novo admin
INSERT INTO admins (email, nome) VALUES 
  ('luiddy.prek@gmail.com', 'Luiddy Prek')
ON CONFLICT (email) DO NOTHING;

-- Adicionar colunas de auditoria nas tabelas existentes
ALTER TABLE mentorados 
  ADD COLUMN IF NOT EXISTS created_by VARCHAR(255),
  ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

ALTER TABLE reunioes 
  ADD COLUMN IF NOT EXISTS created_by VARCHAR(255),
  ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255),
  ADD COLUMN IF NOT EXISTS completed_by VARCHAR(255);

-- Criar tabela de log de auditoria para rastrear todas as ações
CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  admin_email VARCHAR(255) NOT NULL,
  admin_nome VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  record_id INTEGER,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance nas consultas de auditoria
CREATE INDEX IF NOT EXISTS idx_audit_admin ON audit_log(admin_email);
CREATE INDEX IF NOT EXISTS idx_audit_table ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_mentorados_created_by ON mentorados(created_by);
CREATE INDEX IF NOT EXISTS idx_reunioes_created_by ON reunioes(created_by);
