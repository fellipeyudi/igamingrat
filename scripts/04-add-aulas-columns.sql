-- Adicionar colunas que estão faltando na tabela aulas
ALTER TABLE aulas 
ADD COLUMN IF NOT EXISTS modulo VARCHAR(255),
ADD COLUMN IF NOT EXISTS descricao_curta TEXT,
ADD COLUMN IF NOT EXISTS descricao_detalhada TEXT,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'rascunho';

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_aulas_status ON aulas(status);
CREATE INDEX IF NOT EXISTS idx_aulas_modulo ON aulas(modulo);
CREATE INDEX IF NOT EXISTS idx_aulas_ordem ON aulas(ordem);

-- Criar tabela de objetivos de aprendizado
CREATE TABLE IF NOT EXISTS objetivos_aprendizado (
    id SERIAL PRIMARY KEY,
    aula_id INTEGER NOT NULL REFERENCES aulas(id) ON DELETE CASCADE,
    texto TEXT NOT NULL,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_objetivos_aula_id ON objetivos_aprendizado(aula_id);

-- Criar tabela de materiais complementares
CREATE TABLE IF NOT EXISTS materiais_complementares (
    id SERIAL PRIMARY KEY,
    aula_id INTEGER NOT NULL REFERENCES aulas(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- 'pdf', 'link', 'imagem', 'video', 'arquivo'
    url TEXT,
    arquivo_base64 TEXT,
    arquivo_nome VARCHAR(255),
    arquivo_tamanho INTEGER,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_materiais_aula_id ON materiais_complementares(aula_id);

-- Criar tabela de progresso dos alunos
CREATE TABLE IF NOT EXISTS progresso_aulas (
    id SERIAL PRIMARY KEY,
    mentorado_id INTEGER NOT NULL REFERENCES mentorado(id) ON DELETE CASCADE,
    aula_id INTEGER NOT NULL REFERENCES aulas(id) ON DELETE CASCADE,
    concluida BOOLEAN DEFAULT FALSE,
    data_conclusao TIMESTAMP,
    tempo_assistido INTEGER DEFAULT 0, -- em segundos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(mentorado_id, aula_id)
);

CREATE INDEX IF NOT EXISTS idx_progresso_mentorado ON progresso_aulas(mentorado_id);
CREATE INDEX IF NOT EXISTS idx_progresso_aula ON progresso_aulas(aula_id);

-- Comentários nas colunas para documentação
COMMENT ON COLUMN aulas.modulo IS 'Nome do módulo ou categoria da aula (ex: Módulo 1 - Fundamentos)';
COMMENT ON COLUMN aulas.descricao_curta IS 'Descrição breve exibida na lista de aulas';
COMMENT ON COLUMN aulas.descricao_detalhada IS 'Descrição completa exibida na seção "Sobre esta aula"';
COMMENT ON COLUMN aulas.status IS 'Status da aula: rascunho, publicada, arquivada';
COMMENT ON TABLE objetivos_aprendizado IS 'Lista de objetivos exibida na seção "O que você vai aprender"';
COMMENT ON TABLE materiais_complementares IS 'PDFs, links e arquivos complementares da aula';
COMMENT ON TABLE progresso_aulas IS 'Tracking do progresso de cada aluno em cada aula';
