-- Criar tabela para logs de mensagens WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_logs (
  id SERIAL PRIMARY KEY,
  telefone VARCHAR(20) NOT NULL,
  mensagem TEXT NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- 'reuniao_criada', 'lembrete', 'teste', etc
  status VARCHAR(50) DEFAULT 'enviando', -- 'enviando', 'sucesso', 'erro'
  response_data JSONB,
  error_message TEXT,
  reuniao_id INTEGER REFERENCES reunioes(id) ON DELETE SET NULL,
  mentorado_id INTEGER REFERENCES mentorados(id) ON DELETE SET NULL,
  enviado_por VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_telefone ON whatsapp_logs(telefone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_tipo ON whatsapp_logs(tipo);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_status ON whatsapp_logs(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_created_at ON whatsapp_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_reuniao_id ON whatsapp_logs(reuniao_id);
