-- Adicionar campo comentarios na tabela mentorados para salvar anotações iniciais
ALTER TABLE mentorados 
  ADD COLUMN IF NOT EXISTS comentarios TEXT;

-- Comentário explicativo
COMMENT ON COLUMN mentorados.comentarios IS 'Anotações iniciais sobre o mentorado adicionadas durante o cadastro';

-- Criar índice para busca de texto em comentarios (opcional, para melhor performance)
CREATE INDEX IF NOT EXISTS idx_mentorados_comentarios ON mentorados USING gin(to_tsvector('portuguese', comentarios));
