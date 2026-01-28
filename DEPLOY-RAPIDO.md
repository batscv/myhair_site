# 🚀 Deploy Rápido - Vercel + Supabase

## ⚡ Passos Rápidos (15 minutos)

### 1. Configurar Supabase (5 min)
1. Acesse: https://supabase.com
2. Crie projeto: `hair-beauty-hub`
3. Copie Connection String (URI)
4. Execute o SQL do arquivo `DEPLOY-SUPABASE.md` (seção 1, passo 4)

### 2. Configurar Cloudinary (3 min)
1. Acesse: https://cloudinary.com
2. Copie: Cloud Name, API Key, API Secret

### 3. Fazer Commit (1 min)
```bash
git add .
git commit -m "Configurado para Vercel"
git push
```

### 4. Deploy no Vercel (5 min)
1. Acesse: https://vercel.com
2. Login com GitHub
3. **"Add New..."** → **"Project"**
4. Importar `my-hair-beauty-hub-main`
5. **Deploy** (vai falhar - é normal!)

### 5. Configurar Variáveis (2 min)
No Vercel:
1. **"Settings"** → **"Environment Variables"**
2. Adicionar:
   - `DATABASE_URL` = sua connection string do Supabase
   - `CLOUDINARY_CLOUD_NAME` = seu cloud name
   - `CLOUDINARY_API_KEY` = sua api key
   - `CLOUDINARY_API_SECRET` = seu api secret
3. Marcar: Production, Preview, Development
4. **"Deployments"** → **"Redeploy"**

### 6. Testar
1. Acessar: `https://seu-projeto.vercel.app/admin/login`
2. Login: `admin@beautyhub.com` / `admin123`
3. Adicionar produto

## ✅ Pronto!

**Seu site está no ar! 🎉**

Veja `DEPLOY-VERCEL.md` para detalhes completos.
