# 📧 Como Configurar Emails Automáticos para Leads

Este guia mostra como configurar o envio automático de emails quando um novo lead é criado.

## 📋 Pré-requisitos

1. **Conta Supabase** (você já tem)
2. **Conta Resend.com** (serviço gratuito de email)
3. **Supabase CLI** instalado

---

## 🚀 Passo a Passo

### **1. Criar conta no Resend.com**

1. Acesse [https://resend.com](https://resend.com)
2. Crie uma conta gratuita (100 emails/dia grátis)
3. Verifique seu domínio `transpontualexpress.com.br` (ou use o domínio de teste do Resend)
4. Gere uma **API Key** em: Settings → API Keys → Create API Key
5. **Copie a chave** (ela só aparece uma vez!)

---

### **2. Instalar Supabase CLI**

```bash
# Windows (via npm)
npm install -g supabase

# Ou via Scoop
scoop install supabase
```

---

### **3. Fazer Login no Supabase**

```bash
# Login
supabase login

# Linkar seu projeto
supabase link --project-ref pzeftulbtkebcfzjihvc
```

---

### **4. Configurar a API Key do Resend**

```bash
# No terminal, configure a variável de ambiente
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
```

**Substitua** `re_xxxxxxxxxxxxxxxxxxxx` pela sua chave do Resend.

---

### **5. Deploy da Edge Function**

```bash
# No diretório do projeto
cd C:\Users\Geovane\Documents\Transpontual\landing-transpontual

# Deploy da função
supabase functions deploy send-lead-email
```

Se der erro, tente:
```bash
supabase functions deploy send-lead-email --no-verify-jwt
```

---

### **6. Criar o Trigger no Banco de Dados**

1. Acesse o **Supabase Dashboard**: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Vá em **SQL Editor** (menu lateral esquerdo)
3. Clique em **New Query**
4. Copie e cole o conteúdo do arquivo `supabase/trigger-lead-email.sql`
5. Clique em **RUN** (ou pressione Ctrl+Enter)

---

### **7. Habilitar a extensão pg_net** (necessária para chamadas HTTP)

No SQL Editor do Supabase, execute:

```sql
-- Habilitar extensão HTTP
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Verificar se foi instalada
SELECT * FROM pg_available_extensions WHERE name = 'pg_net';
```

---

### **8. Atualizar o Trigger com a Service Role Key**

O trigger precisa da **Service Role Key** para chamar a Edge Function.

1. Vá em **Settings** → **API** no Supabase Dashboard
2. Copie a **service_role key** (secret)
3. Execute no SQL Editor:

```sql
-- Configure a service role key
ALTER DATABASE postgres SET app.settings.service_role_key = 'eyJhbGc...SUA_CHAVE_AQUI';
```

**IMPORTANTE:** Substitua `SUA_CHAVE_AQUI` pela sua service_role key.

---

## ✅ Testar o Sistema

### **Teste 1: Inserir um lead manualmente**

No SQL Editor do Supabase:

```sql
INSERT INTO leads (
  nome, empresa, email, telefone,
  necessidade, origem, destino, tipo_carga
) VALUES (
  'João Teste',
  'Empresa Teste LTDA',
  'seu-email@gmail.com',
  '22999999999',
  'Transporte urgente (D+0/D+1)',
  'Macaé',
  'Rio de Janeiro',
  'Container/Peças especiais'
);
```

Você deve receber um email em **financeiro@transpontualexpress.com.br** em alguns segundos.

---

### **Teste 2: Preencher o formulário da landing page**

1. Abra `index.html` no navegador
2. Preencha todos os campos do formulário
3. Clique em "Enviar"
4. Verifique se o email chegou

---

## 🔧 Solução de Problemas

### **Email não chegou?**

1. **Verifique os logs da Edge Function:**
   ```bash
   supabase functions logs send-lead-email
   ```

2. **Teste a função diretamente:**
   ```bash
   curl -i --location --request POST \
     'https://pzeftulbtkebcfzjihvc.supabase.co/functions/v1/send-lead-email' \
     --header 'Authorization: Bearer SUA_ANON_KEY' \
     --header 'Content-Type: application/json' \
     --data '{"record":{"nome":"Teste","email":"teste@test.com","telefone":"22999999999","empresa":"Empresa X","necessidade":"Teste","origem":"A","destino":"B","tipo_carga":"Container"}}'
   ```

3. **Verifique se o trigger está ativo:**
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_lead_created';
   ```

4. **Verifique os logs do Resend:**
   - Acesse [https://resend.com/emails](https://resend.com/emails)
   - Veja se há emails falhados

---

### **Erro de permissão no trigger?**

Execute no SQL Editor:

```sql
-- Habilitar pg_net para o postgres
GRANT USAGE ON SCHEMA net TO postgres;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA net TO postgres;
```

---

### **Mudar o email de destino**

Edite o arquivo `supabase/functions/send-lead-email/index.ts`, linha 124:

```typescript
to: ['seu-novo-email@exemplo.com'], // Altere aqui
```

Depois faça deploy novamente:
```bash
supabase functions deploy send-lead-email
```

---

## 📊 Monitoramento

Para ver todos os emails enviados:

1. Acesse [Resend Dashboard](https://resend.com/emails)
2. Veja status, aberturas e cliques

Para ver logs da Edge Function:
```bash
supabase functions logs send-lead-email --tail
```

---

## 💰 Limites Gratuitos

- **Resend**: 100 emails/dia (3.000/mês)
- **Supabase Edge Functions**: 500.000 invocações/mês

Se precisar de mais, considere upgrade nos planos.

---

## 🔐 Segurança

- ✅ API Keys armazenadas como **secrets** no Supabase
- ✅ Service Role Key nunca exposta no frontend
- ✅ Trigger executa no servidor (não no cliente)
- ✅ Edge Function valida dados antes de enviar

---

## 📞 Suporte

Se tiver problemas:
1. Verifique os logs: `supabase functions logs send-lead-email`
2. Teste inserção manual no banco
3. Verifique configuração DNS do domínio no Resend

---

## 🎉 Pronto!

Agora você receberá um email automático toda vez que alguém preencher o formulário da landing page! 🚀
