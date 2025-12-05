-- Adicionar campo telefone na tabela mentorados
ALTER TABLE mentorados 
  ADD COLUMN IF NOT EXISTS telefone VARCHAR(20);

-- Adicionar campo meet_link na tabela reunioes
ALTER TABLE reunioes 
  ADD COLUMN IF NOT EXISTS meet_link TEXT;

-- Comentários explicativos
COMMENT ON COLUMN mentorados.telefone IS 'Telefone de contato do mentorado';
COMMENT ON COLUMN reunioes.meet_link IS 'Link do Google Meet ou outra plataforma de videoconferência';
