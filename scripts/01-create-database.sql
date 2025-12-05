-- Criar tabela de usuários admin
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de mentorados
CREATE TABLE IF NOT EXISTS mentorados (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  fase_atual VARCHAR(100) DEFAULT 'Alinhamento',
  foto_perfil TEXT,
  cards_status JSONB DEFAULT '{"concluido": {"titulo": "Concluído recentemente", "texto": "Definição inicial dos objetivos"}, "trabalhando": {"titulo": "Trabalhando agora", "texto": "Mapeamento do cenário atual"}}',
  status_empresa JSONB DEFAULT '{"estagio_atual": "Alinhamento", "descricao": "Sua empresa está em fase inicial.", "proxima_fase": "Planejamento", "descricao_proxima": "Próxima etapa de desenvolvimento.", "acao_prioritaria": "Definir objetivos claros"}',
  agenda_mentoria JSONB DEFAULT '{"calls_realizadas": 0, "proxima_call": null, "call_pendente": null}',
  comentarios TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de reuniões/calls
CREATE TABLE IF NOT EXISTS meetings (
  id SERIAL PRIMARY KEY,
  mentorado_id INTEGER REFERENCES mentorados(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  data DATE NOT NULL,
  horario TIME NOT NULL,
  duracao INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'agendada',
  tipo VARCHAR(100) DEFAULT 'Mentoria',
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir usuário admin padrão (senha: admin123)
INSERT INTO admin_users (username, password) VALUES ('igamingrat', 'admin123') ON CONFLICT (username) DO NOTHING;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_mentorados_slug ON mentorados(slug);
CREATE INDEX IF NOT EXISTS idx_meetings_mentorado ON meetings(mentorado_id);
CREATE INDEX IF NOT EXISTS idx_meetings_data ON meetings(data);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
