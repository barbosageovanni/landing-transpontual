# Configuração do Supabase para Landing Page

## Problema: Leads não estão sendo salvos no Supabase

### Solução 1: Criar/Verificar a Tabela `leads`

1. Acesse o Supabase Dashboard: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** (ícone de código no menu lateral)
4. Execute este SQL:

```sql
-- Criar tabela leads (se não existir)
CREATE TABLE IF NOT EXISTS public.leads (
  id BIGSERIAL PRIMARY KEY,
  necessidade TEXT,
  origem TEXT,
  destino TEXT,
  tipo_carga TEXT,
  data_coleta TEXT,
  peso TEXT,
  observacoes TEXT,
  nome TEXT NOT NULL,
  empresa TEXT,
  email TEXT NOT NULL,
  telefone TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
```

### Solução 2: Configurar Políticas RLS (Row Level Security)

**IMPORTANTE:** O erro mais comum é o RLS bloqueando inserções públicas.

Execute este SQL para permitir inserções públicas:

```sql
-- Habilitar RLS na tabela
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Enable insert for all users" ON public.leads;
DROP POLICY IF EXISTS "Enable read for all users" ON public.leads;

-- Criar política para permitir INSERT público
CREATE POLICY "Enable insert for all users"
ON public.leads
FOR INSERT
WITH CHECK (true);

-- Criar política para permitir SELECT público (opcional, para visualização)
CREATE POLICY "Enable read for all users"
ON public.leads
FOR SELECT
USING (true);
```

### Solução 3: Verificar Estrutura da Tabela

No **Table Editor**, verifique se a tabela `leads` tem estas colunas:

| Coluna | Tipo | Nullable |
|--------|------|----------|
| id | int8 | NO (auto-increment) |
| necessidade | text | YES |
| origem | text | YES |
| destino | text | YES |
| tipo_carga | text | YES |
| data_coleta | text | YES |
| peso | text | YES |
| observacoes | text | YES |
| nome | text | NO |
| empresa | text | YES |
| email | text | NO |
| telefone | text | YES |
| utm_source | text | YES |
| utm_medium | text | YES |
| utm_campaign | text | YES |
| utm_term | text | YES |
| utm_content | text | YES |
| created_at | timestamptz | YES (default: NOW()) |

### Solução 4: Testar a Conexão

1. Abra o console do navegador (F12)
2. Execute: `testSupabase()`
3. Verifique os logs:
   - ✅ Status 200 ou 201 = Sucesso!
   - ❌ Status 401/403 = Problema de RLS (volte para Solução 2)
   - ❌ Status 400 = Problema de estrutura (volte para Solução 1)
   - ❌ Status 404 = Tabela não existe (volte para Solução 1)

### Verificação Final

Após executar os SQLs acima:

1. Vá em **Authentication** > **Policies** (no menu da tabela)
2. Você deve ver as políticas:
   - ✅ "Enable insert for all users" (INSERT)
   - ✅ "Enable read for all users" (SELECT)

3. Teste novamente preenchendo o formulário na landing page

## Status Atual

- ✅ E-mail funcionando (Web3Forms)
- ❌ Supabase com erro (corrigir políticas RLS)

## Contato

Se persistir o erro, execute `testSupabase()` no console e envie a mensagem de erro completa.
