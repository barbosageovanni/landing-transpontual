-- Atualizar trigger para invocar a função sem verificação JWT
CREATE OR REPLACE FUNCTION trigger_send_lead_email()
RETURNS TRIGGER AS $$
DECLARE
  request_id bigint;
  payload jsonb;
BEGIN
  payload := jsonb_build_object('record', row_to_json(NEW));

  -- Chamar a Edge Function SEM autenticação (invoke interno)
  SELECT net.http_post(
    url := 'https://pzeftulbtkebcfzjihvc.supabase.co/functions/v1/enviar-e-mail-de-lead',
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := payload
  ) INTO request_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
