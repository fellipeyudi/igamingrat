-- Adiciona coluna planejamento para comentários antes da call
ALTER TABLE reunioes ADD COLUMN IF NOT EXISTS planejamento TEXT;

-- Comentário explicativo
COMMENT ON COLUMN reunioes.planejamento IS 'Planejamento e observações sobre o que deve ser feito na call (antes da reunião)';
