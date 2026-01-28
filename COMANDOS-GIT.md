# 🚀 Comandos para Deploy

## 1. Fazer Commit das Mudanças

Execute estes comandos na pasta do projeto:

```bash
# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Configurado para deploy no Vercel com Supabase"

# Enviar para GitHub
git push
```

## 2. Se der erro "not a git repository"

Inicialize o Git:

```bash
# Inicializar repositório
git init

# Adicionar remote (substitua pela URL do seu repositório)
git remote add origin https://github.com/seu-usuario/seu-repositorio.git

# Adicionar arquivos
git add .

# Fazer commit
git commit -m "Configurado para deploy no Vercel"

# Enviar para GitHub
git push -u origin main
```

## 3. Se não tiver repositório no GitHub

1. Acesse: https://github.com
2. Clique em **"New repository"**
3. Nome: `my-hair-beauty-hub`
4. Clique em **"Create repository"**
5. Copie a URL que aparecer
6. Execute os comandos da seção 2 acima

## 4. Depois do Push

Siga o arquivo **DEPLOY-RAPIDO.md** para fazer o deploy no Vercel!

---

**Dica**: Se estiver com dificuldade no Git, me avise que te ajudo! 😊
