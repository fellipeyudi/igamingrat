-- Normalizar todos os emails existentes para lowercase
UPDATE mentorados SET email = LOWER(email);
UPDATE admins SET email = LOWER(email);

-- Adicionar constraint para garantir que novos emails sejam sempre lowercase
-- Criar função para validar email em lowercase
CREATE OR REPLACE FUNCTION check_email_lowercase()
RETURNS TRIGGER AS $$
BEGIN
  NEW.email = LOWER(NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Adicionar trigger para mentorados
DROP TRIGGER IF EXISTS mentorados_email_lowercase ON mentorados;
CREATE TRIGGER mentorados_email_lowercase
  BEFORE INSERT OR UPDATE ON mentorados
  FOR EACH ROW
  EXECUTE FUNCTION check_email_lowercase();

-- Adicionar trigger para admins
DROP TRIGGER IF EXISTS admins_email_lowercase ON admins;
CREATE TRIGGER admins_email_lowercase
  BEFORE INSERT OR UPDATE ON admins
  FOR EACH ROW
  EXECUTE FUNCTION check_email_lowercase();

-- Comentários
COMMENT ON FUNCTION check_email_lowercase IS 'Garante que emails sejam sempre armazenados em lowercase';
