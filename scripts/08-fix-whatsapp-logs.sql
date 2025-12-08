-- Adicionar correção do campo telefone que também está limitado a 20 caracteres
-- Corrigir campo tipo da tabela whatsapp_logs para aceitar valores maiores
ALTER TABLE whatsapp_logs ALTER COLUMN tipo TYPE VARCHAR(50);

-- Corrigir campo telefone para aceitar IDs de grupos do WhatsApp (formato: 120363419470266629@g.us)
ALTER TABLE whatsapp_logs ALTER COLUMN telefone TYPE VARCHAR(100);

-- Adicionar comentários
COMMENT ON COLUMN whatsapp_logs.tipo IS 'Tipo da mensagem: nova_reuniao, lembrete_reuniao, nova_task, novo_mentorado, manual';
COMMENT ON COLUMN whatsapp_logs.telefone IS 'Número de telefone ou ID de grupo do WhatsApp (formato: 5561998750875 ou 120363419470266629@g.us)';
