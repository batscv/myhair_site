# 🚀 Deploy com Supabase - Guia Completo

## Por que Supabase?
- ✅ 500MB de banco de dados grátis
- ✅ Interface visual super fácil
- ✅ Configuração em 3 minutos
- ✅ Mais estável que Neon

---

## 1️⃣ Criar Banco de Dados no Supabase (3 min)

### Passo 1: Criar Conta
1. Acesse: https://supabase.com
2. Clique em **"Start your project"**
3. Faça login com GitHub (recomendado) ou email

### Passo 2: Criar Projeto
1. Clique em **"New Project"**
2. Preencha:
   - **Name**: `hair-beauty-hub`
   - **Database Password**: Crie uma senha forte (GUARDE ESSA SENHA!)
   - **Region**: Escolha a mais próxima (ex: South America - São Paulo)
3. Clique em **"Create new project"**
4. Aguarde 2 minutos (o projeto está sendo criado)

### Passo 3: Obter Connection String
1. No menu lateral, clique em **"Project Settings"** (ícone de engrenagem)
2. Clique em **"Database"**
3. Role até **"Connection string"**
4. Selecione **"URI"** (não Pooler)
5. Copie a string (formato: `postgresql://postgres:[YOUR-PASSWORD]@...`)
6. **IMPORTANTE**: Substitua `[YOUR-PASSWORD]` pela senha que você criou

Exemplo:
```
postgresql://postgres:SuaSenhaAqui@db.abc123.supabase.co:5432/postgres
```

### Passo 4: Criar Tabelas
1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New query"**
3. Cole o SQL abaixo e clique em **"Run"**:

```sql
-- Criar tabelas
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    descricao TEXT
);

CREATE TABLE IF NOT EXISTS produtos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    marca VARCHAR(100),
    preco DECIMAL(10, 2) NOT NULL,
    preco_original DECIMAL(10, 2),
    imagem TEXT,
    tag VARCHAR(50),
    rating INT DEFAULT 5,
    review_count INT DEFAULT 0,
    categoria_id INT,
    sku VARCHAR(50) UNIQUE,
    descricao TEXT,
    estoque INT DEFAULT 0,
    modo_uso TEXT,
    mostrar_modo_uso BOOLEAN DEFAULT FALSE,
    tem_variacoes BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

CREATE TABLE IF NOT EXISTS produtos_variacoes (
    id SERIAL PRIMARY KEY,
    produto_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    estoque INT DEFAULT 0,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) DEFAULT 'cliente',
    telefone VARCHAR(20),
    morada TEXT,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS banners (
    id SERIAL PRIMARY KEY,
    imagem_url VARCHAR(255) NOT NULL,
    imagem_mobile_url VARCHAR(255),
    titulo VARCHAR(100),
    subtitulo VARCHAR(200),
    link VARCHAR(255),
    tag VARCHAR(50),
    ordem INT DEFAULT 0,
    mostrar_texto BOOLEAN DEFAULT TRUE,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS marcas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    imagem_url VARCHAR(255) NOT NULL,
    ordem INT DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS avaliacoes (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    produto_id INT NOT NULL,
    estrelas INT NOT NULL CHECK (estrelas >= 1 AND estrelas <= 5),
    titulo VARCHAR(100),
    comentario TEXT,
    aprovado BOOLEAN DEFAULT FALSE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pedidos (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    valor_total DECIMAL(10, 2) NOT NULL,
    endereco_entrega TEXT,
    status VARCHAR(50) DEFAULT 'processando',
    data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS itens_pedido (
    id SERIAL PRIMARY KEY,
    pedido_id INT NOT NULL,
    produto_id INT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

-- Inserir dados iniciais
INSERT INTO categorias (nome, descricao) VALUES 
('Cabelos', 'Produtos para tratamento e cuidado capilar'),
('Skincare', 'Cuidados com a pele facial e corporal'),
('Perfumes', 'Fragrâncias masculinas e femininas'),
('Maquiagem', 'Produtos de beleza e maquiagem')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO usuarios (nome, email, senha, tipo) VALUES 
('Administrador', 'admin@beautyhub.com', 'admin123', 'admin')
ON CONFLICT (email) DO NOTHING;
```

4. Você verá **"Success. No rows returned"** - está correto! ✅

---

## 2️⃣ Configurar Cloudinary (3 min)

### Passo 1: Criar Conta
1. Acesse: https://cloudinary.com
2. Clique em **"Sign Up for Free"**
3. Preencha o formulário ou use Google/GitHub

### Passo 2: Obter Credenciais
1. Após login, você verá o **Dashboard**
2. Copie as seguintes informações:
   - **Cloud Name**: (exemplo: `dxyz123abc`)
   - **API Key**: (exemplo: `123456789012345`)
   - **API Secret**: (clique no ícone de olho para revelar)

---

## 3️⃣ Deploy no Netlify (10 min)

### Passo 1: Preparar Código
```bash
# Fazer commit das mudanças
git add .
git commit -m "Preparado para deploy com Supabase"
git push
```

### Passo 2: Conectar ao Netlify
1. Acesse: https://app.netlify.com
2. Clique em **"Add new site"** → **"Import an existing project"**
3. Escolha seu provedor Git (GitHub, GitLab, etc.)
4. Selecione o repositório `my-hair-beauty-hub-main`

### Passo 3: Configurar Build
Na tela de configuração:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- Clique em **"Deploy site"**

### Passo 4: Configurar Variáveis de Ambiente
1. Após o primeiro deploy, vá em **"Site settings"**
2. No menu lateral, clique em **"Environment variables"**
3. Clique em **"Add a variable"**
4. Adicione as seguintes variáveis:

| Key | Value | Onde pegar |
|-----|-------|------------|
| `DATABASE_URL` | `postgresql://postgres:senha@...` | Supabase → Settings → Database → Connection String (URI) |
| `CLOUDINARY_CLOUD_NAME` | `seu-cloud-name` | Cloudinary Dashboard |
| `CLOUDINARY_API_KEY` | `123456789012345` | Cloudinary Dashboard |
| `CLOUDINARY_API_SECRET` | `abcdefg...` | Cloudinary Dashboard (clique no olho) |

### Passo 5: Fazer Redeploy
1. Vá em **"Deploys"**
2. Clique em **"Trigger deploy"** → **"Deploy site"**
3. Aguarde 2-5 minutos

---

## 4️⃣ Testar a Aplicação (5 min)

### Acessar o Site
Seu site estará em: `https://seu-site-nome.netlify.app`

### Testar Funcionalidades
1. **Página Inicial**: Deve carregar normalmente ✅
2. **Admin**: Acesse `/admin/login`
   - Email: `admin@beautyhub.com`
   - Senha: `admin123`
3. **Adicionar Produto**: Teste criar um produto com imagem
4. **Ver Produto**: Verifique se aparece na página de produtos

---

## 🔧 Troubleshooting

### Erro: "DATABASE_URL não configurada"
**Solução**: 
1. Verifique se adicionou a variável no Netlify
2. Certifique-se de substituir `[YOUR-PASSWORD]` pela senha real
3. Faça redeploy

### Erro: "Connection refused"
**Solução**:
1. Verifique se o projeto Supabase está ativo (não pausado)
2. Teste a conexão no SQL Editor do Supabase
3. Verifique se a connection string está correta

### Erro ao fazer upload de imagem
**Solução**:
1. Verifique se configurou as 3 variáveis do Cloudinary
2. Teste as credenciais no dashboard do Cloudinary
3. Veja os logs da função no Netlify

### Como ver os logs de erro?
1. No Netlify, vá em **"Functions"**
2. Clique em **"api"**
3. Veja os logs em tempo real

---

## ✅ Checklist Final

- [ ] Projeto Supabase criado
- [ ] Connection string copiada (com senha substituída)
- [ ] Tabelas criadas no SQL Editor
- [ ] Conta Cloudinary criada
- [ ] Credenciais Cloudinary copiadas
- [ ] Código commitado e pushado
- [ ] Site conectado ao Netlify
- [ ] Variáveis de ambiente configuradas
- [ ] Redeploy feito
- [ ] Login admin funcionando
- [ ] Produto de teste adicionado

---

## 🎉 Pronto!

Seu site está no ar com:
- ✅ Banco de dados PostgreSQL (Supabase)
- ✅ Upload de imagens (Cloudinary)
- ✅ Deploy automático (Netlify)
- ✅ SSL/HTTPS grátis

**Tempo total: ~20 minutos**

---

## 📱 Próximos Passos

### Domínio Personalizado
1. No Netlify: **"Domain settings"** → **"Add custom domain"**
2. Siga as instruções

### Mudar Senha do Admin
1. Acesse o Supabase
2. Vá em **"Table Editor"** → **"usuarios"**
3. Edite a linha do admin e mude a senha

### Backup do Banco
O Supabase faz backup automático! ✅

**Qualquer dúvida, me avise!** 🚀
