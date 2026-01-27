-- Criação da Base de Dados
CREATE DATABASE IF NOT EXISTS hair_beauty_hub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hair_beauty_hub;

-- Tabela de Usuários (Clientes e Admins)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('cliente', 'admin') DEFAULT 'cliente',
    telefone VARCHAR(20),
    morada TEXT,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Categorias
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    descricao TEXT
);

-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
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
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

-- Tabela de Serviços
CREATE TABLE IF NOT EXISTS servicos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10, 2) NOT NULL,
    duracao_minutos INT,
    categoria_id INT,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

-- Tabela de Agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    servico_id INT NOT NULL,
    data_agendamento DATETIME NOT NULL,
    status ENUM('pendente', 'confirmado', 'cancelado', 'concluido') DEFAULT 'pendente',
    valor_total DECIMAL(10, 2) NOT NULL,
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (servico_id) REFERENCES servicos(id)
);

-- Tabela de Pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('processando', 'pago', 'enviado', 'entregue', 'cancelado') DEFAULT 'processando',
    valor_total DECIMAL(10, 2) NOT NULL,
    endereco_entrega TEXT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabela de Itens do Pedido
CREATE TABLE IF NOT EXISTS itens_pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    produto_id INT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

-- Inserindo Categorias Iniciais
INSERT INTO categorias (nome, descricao) VALUES 
('Cabelos', 'Produtos para tratamento e cuidado capilar'),
('Skincare', 'Cuidados com a pele facial e corporal'),
('Perfumes', 'Fragrâncias masculinas e femininas'),
('Maquiagem', 'Produtos de beleza e maquiagem');

-- Inserindo Usuário Admin Padrão (Senha: admin123)
INSERT INTO usuarios (nome, email, senha, tipo) VALUES 
('Administrador', 'admin@beautyhub.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Inserindo Produtos Iniciais (Baseado no projeto existente)
INSERT INTO produtos (nome, marca, preco, preco_original, imagem, tag, rating, review_count, categoria_id, sku, descricao, estoque) VALUES 
('Shampoo Absolut Repair Molecular L\'Oréal 300ml', 'L\'Oréal Professionnel', 189.90, 249.90, 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400&h=400&fit=crop', 'bestseller', 5, 172, 1, 'LOR-ABS-300', 'Tratamento reparador intensivo para cabelos extremamente danificados. Fórmula com aminoácidos que reconstrói a fibra capilar.', 50),
('Máscara Nutritive 500ml Kérastase', 'Kérastase', 299.90, NULL, 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400&h=400&fit=crop', 'bestseller', 5, 89, 1, 'KER-NUT-500', 'Máscara de nutrição profunda para cabelos secos e ressecados. Proporciona maciez e brilho intenso.', 30),
('Óleo Moroccanoil Treatment 100ml', 'Moroccanoil', 259.90, 319.90, 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&h=400&fit=crop', 'bestseller', 4, 234, 1, 'MOR-TRT-100', 'Óleo de tratamento multifuncional infundido com óleo de argan e vitaminas para nutrir e dar brilho.', 40),
('Leave-in One United Redken 150ml', 'Redken', 179.90, NULL, 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&h=400&fit=crop', 'bestseller', 5, 156, 1, 'RED-UNI-150', 'Leave-in multibenefício com 25 benefícios em um só produto. Proteção térmica e tratamento.', 60),
('Sérum Facial Vitamina C 30ml', 'Dermage', 159.90, NULL, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop', 'new', 4, 28, 2, 'DER-VTC-30', 'Sérum antioxidante com vitamina C pura para uniformizar e iluminar a pele.', 100),
('Perfume 212 VIP Rosé Carolina Herrera 80ml', 'Carolina Herrera', 589.90, 699.90, 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop', 'new', 5, 67, 3, 'CAH-VIP-80', 'Fragrância floral frutada com notas de champagne rosé. Sofisticado e marcante.', 20),
('Protetor Térmico Joico K-Pak 150ml', 'Joico', 189.90, NULL, 'https://images.unsplash.com/photo-1556227834-09f1de7a7d14?w=400&h=400&fit=crop', 'new', 4, 42, 1, 'JOI-KPK-150', 'Protetor térmico profissional que protege os fios de danos causados pelo calor até 230°C.', 45),
('Paleta de Sombras Nude Essential', 'MAC', 329.90, NULL, 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=400&fit=crop', 'new', 5, 91, 4, 'MAC-NDE-12', 'Paleta com 12 tons nude essenciais para looks versáteis do dia a noite.', 25);

-- Tabela de Banners
CREATE TABLE IF NOT EXISTS banners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    imagem_url VARCHAR(255) NOT NULL,
    imagem_mobile_url VARCHAR(255),
    titulo VARCHAR(100),
    subtitulo VARCHAR(200),
    link VARCHAR(255),
    tag VARCHAR(50),
    ordem INT DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserindo Banners Iniciais
INSERT INTO banners (imagem_url, titulo, subtitulo, link) VALUES 
('https://images.unsplash.com/photo-1562322140-8baeececf3df?w=1600&h=600&fit=crop', 'Coleção Profissional', 'Os melhores produtos para o seu cabelo', '#'),
('https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1600&h=600&fit=crop', 'Maquiagem & Beleza', 'Realce sua beleza natural com marcas premium', '#');

-- Tabela de Avaliações
CREATE TABLE IF NOT EXISTS avaliacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
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
