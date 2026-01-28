# 🔍 Checklist de Troubleshooting - Vercel

## Passo 1: Verificar se a API está respondendo

Acesse no navegador:
```
https://SEU-SITE.vercel.app/api/
```

**Resultado esperado:**
```
API Hair Beauty Hub está rodando com Postgres!
```

**Se der erro 404 ou 500:**
- ❌ A função serverless não está funcionando
- Vá para o Passo 2

---

## Passo 2: Verificar Logs da Função

1. No Vercel, vá em **"Deployments"**
2. Clique no deploy mais recente (com ✅ verde)
3. Clique em **"Functions"** (no menu lateral)
4. Clique em **"api"**
5. Veja os **"Logs"**

**O que procurar:**
- ❌ `DATABASE_URL não configurada` → Vá para Passo 3
- ❌ `Connection refused` → Problema no Supabase
- ❌ `Function not found` → Problema no código

---

## Passo 3: Verificar Variáveis de Ambiente

1. No Vercel, vá em **"Settings"**
2. Clique em **"Environment Variables"**
3. Verifique se tem TODAS essas variáveis:

| Variável | Deve ter | Exemplo |
|----------|----------|---------|
| `DATABASE_URL` | ✅ | `postgresql://postgres:senha@...` |
| `CLOUDINARY_CLOUD_NAME` | ✅ | `dxyz123` |
| `CLOUDINARY_API_KEY` | ✅ | `123456789012345` |
| `CLOUDINARY_API_SECRET` | ✅ | `abcdefg...` |

**Para cada variável, verifique:**
- ✅ Marcou **Production**
- ✅ Marcou **Preview**
- ✅ Marcou **Development**

**Se faltou alguma variável:**
1. Adicione a variável
2. Vá em **"Deployments"**
3. Clique nos 3 pontinhos (...) do último deploy
4. Clique em **"Redeploy"**

---

## Passo 4: Testar Conexão com Banco

Acesse:
```
https://SEU-SITE.vercel.app/api/debug-db
```

**Resultado esperado:**
```json
{
  "status": "OK",
  "message": "Conexão com Banco OK!",
  "server_time": "2026-01-27...",
  "db_configured": "SIM (Variável Definida)"
}
```

**Se der erro:**
- ❌ `DATABASE_URL não configurada` → Adicione a variável
- ❌ `Connection refused` → Verifique a connection string do Supabase
- ❌ `password authentication failed` → Senha errada na connection string

---

## Passo 5: Verificar Connection String do Supabase

A connection string deve estar no formato:
```
postgresql://postgres:SUA_SENHA@db.xxx.supabase.co:5432/postgres
```

**Erros comuns:**
- ❌ Esqueceu de substituir `[YOUR-PASSWORD]` pela senha real
- ❌ Copiou a string errada (Pooler ao invés de URI)
- ❌ Tem espaços antes ou depois da string

**Como pegar a string correta:**
1. No Supabase, vá em **"Project Settings"** (engrenagem)
2. Clique em **"Database"**
3. Role até **"Connection string"**
4. Selecione **"URI"** (NÃO Pooler!)
5. Copie a string
6. **IMPORTANTE:** Substitua `[YOUR-PASSWORD]` pela senha que você criou

---

## Passo 6: Verificar se as Tabelas Existem

1. No Supabase, vá em **"SQL Editor"**
2. Execute:
```sql
SELECT * FROM produtos LIMIT 1;
```

**Se der erro "relation does not exist":**
- ❌ As tabelas não foram criadas
- Execute o SQL completo do `DEPLOY-SUPABASE.md` (seção 1, passo 4)

---

## Passo 7: Verificar Estrutura de Arquivos

Certifique-se de que existe:
```
my-hair-beauty-hub-main/
├── api/
│   └── index.js          ← Deve existir!
├── vercel.json           ← Deve existir!
└── server/
    ├── index.cjs
    └── db.cjs
```

**Se faltou algum arquivo:**
1. Crie os arquivos
2. Faça commit e push
3. Vercel fará redeploy automático

---

## 🆘 Ainda com Erro?

Me envie:
1. A URL do seu site no Vercel
2. O que aparece quando acessa: `https://seu-site.vercel.app/api/`
3. O que aparece quando acessa: `https://seu-site.vercel.app/api/debug-db`
4. Screenshot das variáveis de ambiente no Vercel

Com essas informações consigo te ajudar melhor! 😊
