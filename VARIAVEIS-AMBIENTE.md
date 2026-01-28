# Variáveis de Ambiente

## Para Desenvolvimento Local

Use o arquivo `.env.local`:
```env
VITE_API_URL=http://localhost:3001
```

## Para Produção (Vercel)

No Vercel, configure as variáveis de ambiente:

### Variáveis do Frontend (Build)
- `VITE_API_URL` = `/api`

### Variáveis do Backend (Serverless Functions)
- `DATABASE_URL` = sua connection string do Supabase
- `CLOUDINARY_CLOUD_NAME` = seu cloud name
- `CLOUDINARY_API_KEY` = sua api key  
- `CLOUDINARY_API_SECRET` = seu api secret

---

## Como Configurar no Vercel

1. Vá em **Settings** → **Environment Variables**
2. Adicione cada variável
3. Marque: **Production**, **Preview**, **Development**
4. Clique em **Save**
5. Faça **Redeploy**

---

## Importante

⚠️ **NÃO** mude o `.env.local` para `/api` localmente!  
✅ Isso só funciona em produção (Vercel)  
✅ Para desenvolvimento local, use `http://localhost:3001`
