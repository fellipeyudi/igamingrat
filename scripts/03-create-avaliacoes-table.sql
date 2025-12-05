-- Criar tabela de avaliações de satisfação
CREATE TABLE IF NOT EXISTS avaliacoes_satisfacao (
  id SERIAL PRIMARY KEY,
  mentorado_id INTEGER NOT NULL REFERENCES mentorados(id) ON DELETE CASCADE,
  data_avaliacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Perguntas sobre faturamento
  faturamento_atual TEXT,
  meta_faturamento TEXT,
  
  -- Avaliações gerais (escala 1-5)
  satisfacao_geral INTEGER CHECK (satisfacao_geral >= 1 AND satisfacao_geral <= 5),
  qualidade_calls INTEGER CHECK (qualidade_calls >= 1 AND qualidade_calls <= 5),
  qualidade_suporte INTEGER CHECK (qualidade_suporte >= 1 AND qualidade_suporte <= 5),
  qualidade_entregaveis INTEGER CHECK (qualidade_entregaveis >= 1 AND qualidade_entregaveis <= 5),
  clareza_comunicacao INTEGER CHECK (clareza_comunicacao >= 1 AND clareza_comunicacao <= 5),
  utilidade_conteudo INTEGER CHECK (utilidade_conteudo >= 1 AND utilidade_conteudo <= 5),
  
  -- Perguntas abertas
  principal_desafio TEXT,
  maior_conquista TEXT,
  expectativas_atendidas TEXT,
  sugestoes_melhoria TEXT,
  proximo_objetivo TEXT,
  feedback_adicional TEXT,
  
  -- Perguntas sobre tempo
  tempo_resposta_suporte TEXT,
  frequencia_calls_ideal TEXT,
  
  -- NPS
  recomendaria_mentoria INTEGER CHECK (recomendaria_mentoria >= 0 AND recomendaria_mentoria <= 10),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_avaliacoes_mentorado ON avaliacoes_satisfacao(mentorado_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_data ON avaliacoes_satisfacao(data_avaliacao DESC);

-- Comentários
COMMENT ON TABLE avaliacoes_satisfacao IS 'Armazena avaliações de satisfação dos mentorados';
COMMENT ON COLUMN avaliacoes_satisfacao.satisfacao_geral IS 'Satisfação geral com a mentoria (1-5)';
COMMENT ON COLUMN avaliacoes_satisfacao.recomendaria_mentoria IS 'Net Promoter Score (0-10)';
