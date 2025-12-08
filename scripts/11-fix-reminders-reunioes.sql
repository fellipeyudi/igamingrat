-- Corrigir: Adicionar campos de lembretes na tabela REUNIOES (não meetings)
ALTER TABLE reunioes ADD COLUMN IF NOT EXISTS lembrete_30min_enviado BOOLEAN DEFAULT FALSE;
ALTER TABLE reunioes ADD COLUMN IF NOT EXISTS lembrete_inicio_enviado BOOLEAN DEFAULT FALSE;

-- Criar índices para melhorar performance das consultas de lembretes
CREATE INDEX IF NOT EXISTS idx_reunioes_lembretes ON reunioes(data, horario, status, lembrete_30min_enviado, lembrete_inicio_enviado);

-- Tasks já estão corretas (verificar se existem)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS horario_limite TIME;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS lembrete_10min_enviado BOOLEAN DEFAULT FALSE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS lembrete_vencimento_enviado BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_tasks_lembretes ON tasks(data_limite, horario_limite, status, lembrete_10min_enviado, lembrete_vencimento_enviado);
