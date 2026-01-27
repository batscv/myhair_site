-- Adaptação para PostgreSQL

-- Tabela de Usuários (Clientes e Admins)
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) DEFAULT 'cliente' CHECK (tipo IN ('cliente', 'admin')),
    telefone VARCHAR(20),
    morada TEXT,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Categorias
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    descricao TEXT
);

-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS produtos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    marca VARCHAR(100),
    preco DECIMAL(10, 2) NOT NULL,
    preco_original DECIMAL(10, 2),
    imagem VARCHAR(255),
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

-- Tabela de Variações de Produtos
CREATE TABLE IF NOT EXISTS produtos_variacoes (
    id SERIAL PRIMARY KEY,
    produto_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    estoque INT DEFAULT 0,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
);

-- Tabela de Serviços
CREATE TABLE IF NOT EXISTS servicos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10, 2) NOT NULL,
    duracao_minutos INT,
    categoria_id INT,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

-- Tabela de Agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    servico_id INT NOT NULL,
    data_agendamento TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'cancelado', 'concluido')),
    valor_total DECIMAL(10, 2) NOT NULL,
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (servico_id) REFERENCES servicos(id)
);

-- Tabela de Pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'processando' CHECK (status IN ('processando', 'pago', 'enviado', 'entregue', 'cancelado')),
    valor_total DECIMAL(10, 2) NOT NULL,
    endereco_entrega TEXT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabela de Itens do Pedido
CREATE TABLE IF NOT EXISTS itens_pedido (
    id SERIAL PRIMARY KEY,
    pedido_id INT NOT NULL,
    produto_id INT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

-- Tabela de Banners
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

-- Tabela de Marcas
CREATE TABLE IF NOT EXISTS marcas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    imagem_url VARCHAR(255) NOT NULL,
    ordem INT DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Avaliações
CREATE TABLE IF NOT EXISTS avaliacoes (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    produto_id INT NOT NULL,
    estrelas INT NOT NULL CHECK (estrelas BETWEEN 1 AND 5),
    titulo VARCHAR(100),
    comentario TEXT,
    aprovado BOOLEAN DEFAULT FALSE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

-- Tabela de Configurações
CREATE TABLE IF NOT EXISTS configuracoes (
    chave VARCHAR(50) PRIMARY KEY,
    valor TEXT
);

-- Tabela de Cupons
CREATE TABLE IF NOT EXISTS cupons (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('porcentagem', 'fixo')),
    valor DECIMAL(10, 2) NOT NULL,
    minimo_compra DECIMAL(10, 2) DEFAULT 0,
    data_validade TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE,
    usos_atuais INT DEFAULT 0,
    limite_usos INT DEFAULT NULL
);

-- Tabela de Popups
CREATE TABLE IF NOT EXISTS popups (
    id SERIAL PRIMARY KEY,
    imagem_url VARCHAR(255) NOT NULL,
    link VARCHAR(255),
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserindo Categorias Iniciais
INSERT INTO categorias (nome, descricao) VALUES 
('Cabelos', 'Produtos para tratamento e cuidado capilar'),
('Skincare', 'Cuidados com a pele facial e corporal'),
('Perfumes', 'Fragrâncias masculinas e femininas'),
('Maquiagem', 'Produtos de beleza e maquiagem')
ON CONFLICT (nome) DO NOTHING;

-- Inserindo Usuário Admin Padrão (Senha: admin123)
-- Nota: A senha deve ser hashada corretamenta na aplicação se possível, mas mantendo o padrão do seed.
INSERT INTO usuarios (nome, email, senha, tipo) VALUES 
('Administrador', 'admin@beautyhub.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Configurações Iniciais
INSERT INTO configuracoes (chave, valor) VALUES
('frete_gratis_minimo', '150.00'),
('mensagem_aviso', 'Promoção de Inauguração!'),
('cor_primaria', '#000000')
ON CONFLICT (chave) DO NOTHING;
