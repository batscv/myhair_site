# 🚀 Deploy com Vercel + Supabase - Guia Completo

## Por que Vercel?
- ✅ Mais fácil que Netlify
- ✅ Deploy automático a cada push
- ✅ Grátis para sempre
- ✅ Mais rápido e estável
- ✅ Interface super intuitiva

---

## 📋 Pré-requisitos
- [ ] Banco de dados Supabase configurado (siga `DEPLOY-SUPABASE.md` seção 1)
- [ ] Cloudinary configurado (siga `DEPLOY-SUPABASE.md` seção 2)
- [ ] Código no GitHub/GitLab/Bitbucket

---

## 1️⃣ Preparar o Projeto para Vercel

Primeiro, precisamos fazer pequenas adaptações no código:

### Passo 1: Criar arquivo de configuração do Vercel

Vou criar o arquivo `vercel.json` para você:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Passo 2: Criar função serverless para Vercel

Crie a pasta e arquivo: `api/index.js`

```javascript
// Este arquivo adapta o servidor Express para Vercel
const { app } = require('../server/index.cjs');

module.exports = app;
```

---

## 2️⃣ Fazer Deploy no Vercel (5 min)

### Passo 1: Criar Conta
1. Acesse: https://vercel.com
2. Clique em **"Sign Up"**
3. Escolha **"Continue with GitHub"** (recomendado)
4. Autorize o Vercel a acessar seus repositórios

### Passo 2: Importar Projeto
1. No dashboard, clique em **"Add New..."** → **"Project"**
2. Encontre o repositório `my-hair-beauty-hub-main`
3. Clique em **"Import"**

### Passo 3: Configurar Build
Na tela de configuração:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

Clique em **"Deploy"** (NÃO configure variáveis ainda)

### Passo 4: Aguardar Primeiro Deploy
- O primeiro deploy vai **falhar** (é normal!)
- Aguarde até aparecer "Build Failed" ou "Deployment Failed"
- Não se preocupe, vamos configurar as variáveis agora

### Passo 5: Configurar Variáveis de Ambiente
1. No projeto, clique em **"Settings"** (no topo)
2. No menu lateral, clique em **"Environment Variables"**
3. Adicione as seguintes variáveis:

| Key | Value | Onde pegar |
|-----|-------|------------|
| `DATABASE_URL` | `postgresql://postgres:senha@...` | Supabase → Settings → Database → URI |
| `CLOUDINARY_CLOUD_NAME` | `seu-cloud-name` | Cloudinary Dashboard |
| `CLOUDINARY_API_KEY` | `123456789012345` | Cloudinary Dashboard |
| `CLOUDINARY_API_SECRET` | `abcdefg...` | Cloudinary Dashboard |

**Para cada variável:**
1. Cole o **Key** (nome)
2. Cole o **Value** (valor)
3. Marque todas as opções: **Production**, **Preview**, **Development**
4. Clique em **"Save"**

### Passo 6: Fazer Redeploy
1. Vá em **"Deployments"** (no topo)
2. Clique nos 3 pontinhos (...) do último deploy
3. Clique em **"Redeploy"**
4. Confirme clicando em **"Redeploy"** novamente
5. Aguarde 2-3 minutos

---

## 3️⃣ Testar a Aplicação

### Acessar o Site
Após o deploy, você verá:
- **URL do site**: `https://seu-projeto.vercel.app`

### Testar Funcionalidades
1. Clique no link do deploy
2. Acesse `/admin/login`
   - Email: `admin@beautyhub.com`
   - Senha: `admin123`
3. Adicione um produto de teste
4. Verifique se aparece na página de produtos

---

## 🔧 Troubleshooting

### Erro: "Build Failed"
**Solução**:
1. Vá em **"Deployments"** → clique no deploy com erro
2. Veja os logs para identificar o problema
3. Geralmente é falta de variável de ambiente

### Erro: "Function Invocation Failed"
**Solução**:
1. Verifique se criou a pasta `api/` com o arquivo `index.js`
2. Verifique se o arquivo `vercel.json` está na raiz do projeto
3. Faça commit e push das mudanças

### Erro: "DATABASE_URL não configurada"
**Solução**:
1. Vá em **"Settings"** → **"Environment Variables"**
2. Verifique se `DATABASE_URL` está lá
3. Certifique-se de marcar **Production**
4. Faça redeploy

### API não funciona (404)
**Solução**:
1. Verifique se o arquivo `api/index.js` existe
2. Verifique se `vercel.json` está correto
3. Teste acessando: `https://seu-site.vercel.app/api/`
   - Deve retornar: "API Hair Beauty Hub está rodando com Postgres!"

---

## 📁 Estrutura de Arquivos Necessária

Certifique-se de ter:

```
my-hair-beauty-hub-main/
├── api/
│   └── index.js          ← NOVO (criar este arquivo)
├── server/
│   ├── index.cjs
│   └── db.cjs
├── src/
├── netlify/              ← Pode deletar esta pasta
├── vercel.json           ← NOVO (criar este arquivo)
├── package.json
└── ...
```

---

## ✅ Checklist Final

- [ ] Arquivo `vercel.json` criado na raiz
- [ ] Pasta `api/` criada com `index.js`
- [ ] Código commitado e pushado para GitHub
- [ ] Projeto importado no Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Redeploy feito
- [ ] Site acessível
- [ ] Login admin funcionando
- [ ] Produto de teste adicionado com sucesso

---

## 🎉 Vantagens do Vercel

✅ **Deploy automático**: A cada push no GitHub, deploy automático  
✅ **Preview deployments**: Cada branch tem sua própria URL de preview  
✅ **Rollback fácil**: Voltar para versão anterior com 1 clique  
✅ **Analytics grátis**: Veja quantas pessoas acessam seu site  
✅ **Domínio grátis**: `seu-projeto.vercel.app`  

---

## 📱 Próximos Passos

### Domínio Personalizado
1. No Vercel, vá em **"Settings"** → **"Domains"**
2. Clique em **"Add"**
3. Digite seu domínio e siga as instruções

### Deploy Automático
Já está configurado! ✅
- Faça `git push` e o Vercel faz deploy automaticamente

### Ver Logs em Tempo Real
1. Vá em **"Deployments"**
2. Clique no deploy ativo
3. Veja **"Function Logs"** para ver erros da API

---

## 🆘 Precisa de Ajuda?

Se tiver problemas:
1. Veja os logs do deploy no Vercel
2. Teste a API: `https://seu-site.vercel.app/api/`
3. Verifique as variáveis de ambiente

**Tempo total: ~15 minutos**

**Muito mais fácil que Netlify! 🚀**
