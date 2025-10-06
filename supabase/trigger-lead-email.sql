-- Trigger SQL para chamar a Edge Function quando um novo lead for inserido
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Primeiro, crie a função que será chamada pelo trigger
CREATE OR REPLACE FUNCTION trigger_send_lead_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Chama a Edge Function via pg_net (extensão HTTP do Supabase)
  PERFORM
    net.http_post(
      url := 'https://pzeftulbtkebcfzjihvc.supabase.co/functions/v1/send-lead-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object('record', row_to_json(NEW))
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Crie o trigger que executa após INSERT na tabela leads
DROP TRIGGER IF EXISTS on_lead_created ON leads;

CREATE TRIGGER on_lead_created
  AFTER INSERT ON leads
  FOR EACH ROW
  EXECUTE FUNCTION trigger_send_lead_email();

-- 3. Conceda permissões necessárias
GRANT USAGE ON SCHEMA net TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA net TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA net TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA net TO postgres, anon, authenticated, service_role;

-- Verificar se o trigger foi criado
SELECT * FROM pg_trigger WHERE tgname = 'on_lead_created';
