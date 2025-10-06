-- Função que será chamada pelo trigger
CREATE OR REPLACE FUNCTION trigger_send_lead_email()
RETURNS TRIGGER AS $$
DECLARE
  request_id bigint;
  payload jsonb;
BEGIN
  -- Prepara o payload
  payload := jsonb_build_object('record', row_to_json(NEW));

  -- Faz a requisição HTTP assíncrona para a Edge Function
  SELECT net.http_post(
    url := 'https://pzeftulbtkebcfzjihvc.supabase.co/functions/v1/send-lead-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6ZWZ0dWxidGtlYmNmemppaHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NjM2NzYsImV4cCI6MjA3NTEzOTY3Nn0.kI2He98_sdPL2nr7cP--myyP98-E6KppT1n0vwOI9kM'
    ),
    body := payload
  ) INTO request_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove trigger antigo se existir
DROP TRIGGER IF EXISTS on_lead_created ON leads;

-- Cria o trigger que executa após cada INSERT
CREATE TRIGGER on_lead_created
  AFTER INSERT ON leads
  FOR EACH ROW
  EXECUTE FUNCTION trigger_send_lead_email();

-- Verificar se foi criado
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_lead_created';
