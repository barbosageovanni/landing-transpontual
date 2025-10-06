-- Verificar se o lead foi inserido
SELECT * FROM leads
ORDER BY created_at DESC
LIMIT 5;

-- Verificar se o trigger existe
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_lead_created';

-- Verificar requisições HTTP (pg_net)
SELECT * FROM net._http_response
ORDER BY id DESC
LIMIT 10;
