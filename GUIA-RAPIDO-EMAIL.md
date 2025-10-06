# 🚀 Guia Rápido: Configurar Emails (SEM Supabase CLI)

Como você está em ambiente não-interativo, vamos usar a abordagem **mais simples**: configurar tudo direto no Dashboard do Supabase.

---

## ✅ Passo 1: Criar conta no Resend.com

1. Acesse: https://resend.com/signup
2. Crie conta gratuita (100 emails/dia)
3. **Pule a verificação de domínio por enquanto** (você pode usar o email de teste)
4. Vá em **API Keys** → **Create API Key**
5. **Nome**: `Transpontual Leads`
6. **Permissão**: `Sending access`
7. **Copie a chave** (começa com `re_...`)

---

## ✅ Passo 2: Criar a Edge Function no Dashboard

1. Acesse: https://supabase.com/dashboard/project/pzeftulbtkebcfzjihvc
2. No menu lateral, clique em **Edge Functions**
3. Clique em **Create a new function**
4. **Nome**: `send-lead-email`
5. No editor que abrir, **delete tudo** e cole o código abaixo:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  try {
    const { record } = await req.json()
    const lead = record

    const emailHtml = \`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #003d7a; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .section { margin-bottom: 20px; }
          .section-title { font-weight: bold; color: #003d7a; margin-bottom: 10px; border-bottom: 2px solid #003d7a; padding-bottom: 5px; }
          .field { margin: 8px 0; }
          .label { font-weight: bold; color: #555; }
          .value { color: #333; }
          .urgent { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚚 TRANSPONTUAL EXPRESS</h1>
            <p>Nova Solicitação de Cotação</p>
          </div>

          <div class="content">
            <div class="urgent">
              ⏱️ <strong>Atenção:</strong> Lead recebido em \${new Date(lead.created_at).toLocaleString('pt-BR')}
              <br>Prazo de resposta: <strong>15 minutos</strong>
            </div>

            <div class="section">
              <div class="section-title">📋 DETALHES DA OPERAÇÃO</div>
              <div class="field"><span class="label">Necessidade:</span> <span class="value">\${lead.necessidade || 'Não informado'}</span></div>
              <div class="field"><span class="label">Origem:</span> <span class="value">\${lead.origem || 'Não informado'}</span></div>
              <div class="field"><span class="label">Destino:</span> <span class="value">\${lead.destino || 'Não informado'}</span></div>
            </div>

            <div class="section">
              <div class="section-title">📦 INFORMAÇÕES DA CARGA</div>
              <div class="field"><span class="label">Tipo:</span> <span class="value">\${lead.tipo_carga || 'Não informado'}</span></div>
              <div class="field"><span class="label">Data prevista:</span> <span class="value">\${lead.data_coleta || 'Não informado'}</span></div>
              <div class="field"><span class="label">Peso:</span> <span class="value">\${lead.peso || 'Não informado'}</span></div>
              <div class="field"><span class="label">Observações:</span> <span class="value">\${lead.observacoes || 'Nenhuma'}</span></div>
            </div>

            <div class="section">
              <div class="section-title">👤 DADOS DE CONTATO</div>
              <div class="field"><span class="label">Nome:</span> <span class="value">\${lead.nome}</span></div>
              <div class="field"><span class="label">Empresa:</span> <span class="value">\${lead.empresa}</span></div>
              <div class="field"><span class="label">E-mail:</span> <span class="value"><a href="mailto:\${lead.email}">\${lead.email}</a></span></div>
              <div class="field"><span class="label">Telefone:</span> <span class="value"><a href="tel:\${lead.telefone}">\${lead.telefone}</a></span></div>
            </div>
          </div>
        </div>
      </body>
      </html>
    \`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${RESEND_API_KEY}\`
      },
      body: JSON.stringify({
        from: 'Transpontual <onboarding@resend.dev>',
        to: ['financeiro@transpontualexpress.com.br'],
        subject: \`🚨 Novo Lead: \${lead.nome} - \${lead.empresa}\`,
        html: emailHtml,
        reply_to: lead.email
      })
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(\`Resend API error: \${JSON.stringify(data)}\`)
    }

    return new Response(
      JSON.stringify({ success: true, emailId: data.id }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

6. Clique em **Deploy**

---

## ✅ Passo 3: Configurar a API Key do Resend

1. Ainda no Dashboard do Supabase, vá em **Settings** (menu lateral)
2. Clique em **Edge Functions**
3. Na seção **Secrets**, clique em **Add secret**
4. **Name**: `RESEND_API_KEY`
5. **Value**: Cole a chave que você copiou do Resend (começa com `re_...`)
6. Clique em **Save**

---

## ✅ Passo 4: Habilitar a extensão pg_net

1. No Dashboard do Supabase, vá em **SQL Editor**
2. Clique em **New query**
3. Cole este código:

```sql
-- Habilitar extensão HTTP
CREATE EXTENSION IF NOT EXISTS pg_net;
```

4. Clique em **RUN** (ou Ctrl+Enter)

---

## ✅ Passo 5: Criar o Database Trigger

1. Ainda no **SQL Editor**, clique em **New query** novamente
2. Cole este código:

```sql
-- Função que será chamada pelo trigger
CREATE OR REPLACE FUNCTION trigger_send_lead_email()
RETURNS TRIGGER AS $$
DECLARE
  request_id bigint;
  payload jsonb;
BEGIN
  -- Prepara o payload
  payload := jsonb_build_object('record', row_to_json(NEW));

  -- Faz a requisição HTTP assíncrona
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

-- Cria o trigger
DROP TRIGGER IF EXISTS on_lead_created ON leads;

CREATE TRIGGER on_lead_created
  AFTER INSERT ON leads
  FOR EACH ROW
  EXECUTE FUNCTION trigger_send_lead_email();
```

3. Clique em **RUN**

---

## ✅ Passo 6: Testar!

### Teste 1: Inserir lead manual

No SQL Editor, execute:

```sql
INSERT INTO leads (
  nome, empresa, email, telefone,
  necessidade, origem, destino, tipo_carga
) VALUES (
  'Teste Sistema',
  'Empresa Teste',
  'seu-email-pessoal@gmail.com',
  '22999999999',
  'Transporte urgente (D+0/D+1)',
  'Macaé',
  'Rio de Janeiro',
  'Container'
);
```

**Você deve receber um email em `financeiro@transpontualexpress.com.br` em 5-10 segundos!**

### Teste 2: Formulário da landing page

1. Abra `index.html` no navegador
2. Preencha o formulário
3. Clique em "Enviar"
4. Verifique o email

---

## 🔍 Ver Logs (se não funcionar)

1. Vá em **Edge Functions** no Dashboard
2. Clique na função `send-lead-email`
3. Vá na aba **Logs**
4. Veja os erros (se houver)

Também verifique os emails no Resend:
- https://resend.com/emails

---

## ⚠️ IMPORTANTE: Trocar o email "from"

Por padrão, a função usa `onboarding@resend.dev`. Para usar seu próprio domínio:

1. No Resend, vá em **Domains**
2. Clique em **Add Domain**
3. Adicione `transpontualexpress.com.br`
4. Configure os registros DNS que o Resend mostrar
5. Depois de verificado, edite a Edge Function e troque:
   ```typescript
   from: 'Transpontual <noreply@transpontualexpress.com.br>',
   ```

---

## 🎉 Pronto!

Agora você receberá emails automaticamente toda vez que alguém preencher o formulário! 🚀

**Dúvidas?** Verifique os logs da Edge Function ou do Resend.
