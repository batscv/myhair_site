# 🚀 Guia de Deploy - My Hair Beauty Hub

Este guia irá ajudá-lo a fazer o deploy completo da aplicação no Netlify.

## 📋 Pré-requisitos

- [ ] Conta no [Netlify](https://netlify.com) (gratuita)
- [ ] Conta no [Neon](https://neon.tech) (PostgreSQL gratuito)
- [ ] Conta no [Cloudinary](https://cloudinary.com) (armazenamento de imagens gratuito)
- [ ] Código versionado no Git (GitHub, GitLab, ou Bitbucket)

---

## 1️⃣ Configurar Banco de Dados PostgreSQL (Neon)

### Passo 1: Criar Projeto no Neon

1. Acesse [https://neon.tech](https://neon.tech) e faça login
2. Clique em **"Create Project"**
3. Escolha um nome para o projeto (ex: `hair-beauty-hub`)
4. Selecione a região mais próxima
5. Clique em **"Create Project"**

### Passo 2: Obter String de Conexão

1. No dashboard do projeto, clique em **"Connection Details"**
2. Copie a **Connection String** (formato: `postgresql://user:password@host/database`)
3. Guarde essa string - você vai precisar dela!

### Passo 3: Criar Tabelas no Banco

1. No Neon, clique em **"SQL Editor"**
2. Cole o seguinte SQL e execute:

```sql
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

---

## 2️⃣ Configurar Cloudinary (Upload de Imagens)

### Passo 1: Criar Conta

1. Acesse [https://cloudinary.com](https://cloudinary.com)
2. Crie uma conta gratuita
3. Após login, vá para **Dashboard**

### Passo 2: Obter Credenciais

No Dashboard, você verá:
- **Cloud Name**: `seu-cloud-name`
- **API Key**: `123456789012345`
- **API Secret**: `abcdefghijklmnopqrstuvwxyz`

Guarde essas informações!

---

## 3️⃣ Deploy no Netlify

### Passo 1: Conectar Repositório

1. Acesse [https://app.netlify.com](https://app.netlify.com)
2. Clique em **"Add new site"** → **"Import an existing project"**
3. Escolha seu provedor Git (GitHub, GitLab, etc.)
4. Selecione o repositório `my-hair-beauty-hub`

### Passo 2: Configurar Build

Na tela de configuração:

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Functions directory**: `netlify/functions`

Clique em **"Deploy site"**

### Passo 3: Configurar Variáveis de Ambiente

1. No dashboard do site, vá em **"Site settings"** → **"Environment variables"**
2. Clique em **"Add a variable"**
3. Adicione as seguintes variáveis:

| Key | Value | Descrição |
|-----|-------|-----------|
| `DATABASE_URL` | `postgresql://user:pass@host/db` | String de conexão do Neon |
| `CLOUDINARY_CLOUD_NAME` | `seu-cloud-name` | Nome do cloud Cloudinary |
| `CLOUDINARY_API_KEY` | `123456789012345` | API Key do Cloudinary |
| `CLOUDINARY_API_SECRET` | `abcdefg...` | API Secret do Cloudinary |

### Passo 4: Fazer Redeploy

1. Vá em **"Deploys"**
2. Clique em **"Trigger deploy"** → **"Deploy site"**
3. Aguarde o deploy finalizar (2-5 minutos)

---

## 4️⃣ Testar a Aplicação

### Acessar o Site

Seu site estará disponível em: `https://seu-site.netlify.app`

### Testar Funcionalidades

1. **Página Inicial**: Deve carregar normalmente
2. **Produtos**: Devem aparecer (inicialmente vazio)
3. **Admin**: Acesse `/admin/login`
   - Email: `admin@beautyhub.com`
   - Senha: `admin123`

### Configurar Banco (Primeira Vez)

Se as tabelas não foram criadas automaticamente:

1. Acesse: `https://seu-site.netlify.app/api/setup-db`
2. Você verá: `{"message": "Banco de dados configurado com sucesso!"}`

---

## 5️⃣ Migrar Dados do MySQL Local (Opcional)

Se você tem produtos no MySQL local e quer migrar:

### Exportar Produtos

```bash
# No seu computador local
node export-products.js
```

Isso criará um arquivo `produtos.json` com todos os produtos.

### Importar no Neon

1. Acesse o painel admin do site em produção
2. Adicione os produtos manualmente OU
3. Use o script de importação (vou criar para você se precisar)

---

## 🔧 Troubleshooting

### Erro: "DATABASE_URL não configurada"

**Solução**: Verifique se você adicionou a variável `DATABASE_URL` nas configurações do Netlify.

### Erro: "Failed to fetch"

**Solução**: Verifique se as funções serverless estão funcionando acessando:
`https://seu-site.netlify.app/api/`

Deve retornar: `"API Hair Beauty Hub está rodando com Postgres!"`

### Imagens não aparecem

**Solução**: 
1. Verifique se configurou o Cloudinary corretamente
2. As imagens antigas (localhost) não funcionarão em produção
3. Faça re-upload das imagens pelo painel admin

### Erro 500 no Admin

**Solução**:
1. Acesse **"Functions"** no Netlify
2. Clique na função `api`
3. Veja os logs para identificar o erro
4. Geralmente é problema de variável de ambiente

---

## 📱 Próximos Passos

### Domínio Personalizado

1. No Netlify, vá em **"Domain settings"**
2. Clique em **"Add custom domain"**
3. Siga as instruções para configurar DNS

### SSL/HTTPS

O Netlify fornece SSL gratuito automaticamente! ✅

### Monitoramento

- **Logs**: Netlify → Functions → api → Logs
- **Analytics**: Netlify → Analytics (plano pago)

---

## 🆘 Precisa de Ajuda?

Se encontrar problemas:

1. Verifique os logs no Netlify
2. Teste a conexão do banco: `https://seu-site.netlify.app/api/debug-db`
3. Verifique se todas as variáveis de ambiente estão configuradas

---

## ✅ Checklist Final

- [ ] Banco de dados Neon criado e configurado
- [ ] Cloudinary configurado
- [ ] Site deployado no Netlify
- [ ] Variáveis de ambiente configuradas
- [ ] Teste de login admin funcionando
- [ ] Produtos podem ser adicionados
- [ ] Imagens podem ser enviadas

**Parabéns! Seu site está no ar! 🎉**
