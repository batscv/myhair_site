const express = require('express');
const cors = require('cors');
const db = require('./db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração do Multer para Uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Rota básica
app.get('/', (req, res) => {
    res.send('API Hair Beauty Hub está rodando!');
});

// Listar produtos com filtros e busca
app.get('/api/produtos', async (req, res) => {
    const { search, minPrice, maxPrice, brand, category } = req.query;

    try {
        let query = `
            SELECT 
                p.id, p.nome as name, p.marca as brand, p.preco as price, 
                p.preco_original as originalPrice, p.imagem as image, 
                p.tag, p.rating, p.review_count as reviewCount, 
                p.sku, p.descricao as description, c.nome as category
            FROM produtos p 
            LEFT JOIN categorias c ON p.categoria_id = c.id
            WHERE 1=1
        `;
        const params = [];

        if (search) {
            query += " AND (p.nome LIKE ? OR p.marca LIKE ? OR p.descricao LIKE ?)";
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (minPrice) {
            query += " AND p.preco >= ?";
            params.push(parseFloat(minPrice));
        }

        if (maxPrice) {
            query += " AND p.preco <= ?";
            params.push(parseFloat(maxPrice));
        }

        if (brand) {
            query += " AND p.marca = ?";
            params.push(brand);
        }

        if (category) {
            query += " AND c.nome = ?";
            params.push(category);
        }

        query += " ORDER BY p.id DESC";

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
});

// Sugestões de Busca (Live Search)
app.get('/api/search/suggestions', async (req, res) => {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);

    try {
        const [rows] = await db.query(
            'SELECT id, nome as name, imagem as image, preco as price FROM produtos WHERE nome LIKE ? OR marca LIKE ? LIMIT 5',
            [`%${q}%`, `%${q}%`]
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar sugestões' });
    }
});

// Listar categorias
app.get('/api/categorias', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categorias');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar categorias' });
    }
});

// Buscar produto por ID com Variações
app.get('/api/produtos/:id', async (req, res) => {
    try {
        const [productRows] = await db.query(`
            SELECT 
                p.id, p.nome as name, p.marca as brand, p.preco as price, 
                p.preco_original as originalPrice, p.imagem as image, 
                p.tag, p.rating, p.review_count as reviewCount, 
                p.sku, p.descricao as description, p.estoque, c.nome as category,
                p.modo_uso, p.mostrar_modo_uso, p.tem_variacoes
            FROM produtos p 
            LEFT JOIN categorias c ON p.categoria_id = c.id
            WHERE p.id = ?
        `, [req.params.id]);

        if (productRows.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });

        const [variationRows] = await db.query(
            'SELECT id, nome, estoque FROM produtos_variacoes WHERE produto_id = ?',
            [req.params.id]
        );

        res.json({ ...productRows[0], variations: variationRows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar produto' });
    }
});

// --- ROTAS DE BANNER ---
app.get('/api/banners', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM banners WHERE ativo = 1 ORDER BY ordem ASC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar banners' });
    }
});

// --- ROTAS DE USUÁRIO (CLIENTE) ---

// Registro de Usuário
app.post('/api/usuarios/registro', async (req, res) => {
    const { nome, email, senha, telefone } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO usuarios (nome, email, senha, tipo, telefone) VALUES (?, ?, ?, "cliente", ?)',
            [nome, email, senha, telefone]
        );
        res.json({ id: result.insertId, message: 'Conta criada com sucesso!' });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Este email já está cadastrado' });
        }
        res.status(500).json({ error: 'Erro ao criar conta' });
    }
});

// Login de Usuário (Cliente)
app.post('/api/usuarios/login', async (req, res) => {
    const { email, senha } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ? AND tipo = "cliente"', [email]);
        if (rows.length === 0) return res.status(401).json({ error: 'Usuário não encontrado' });

        const user = rows[0];
        if (senha === user.senha) {
            res.json({
                id: user.id,
                nome: user.nome,
                email: user.email,
                tipo: user.tipo,
                telefone: user.telefone,
                morada: user.morada
            });
        } else {
            res.status(401).json({ error: 'Senha incorreta' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro no login' });
    }
});

// --- ROTAS ADMINISTRATIVAS (CRUD) ---

// Login Admin (Básico)
app.post('/api/admin/login', async (req, res) => {
    const { email, senha } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ? AND tipo = "admin"', [email]);
        if (rows.length === 0) return res.status(401).json({ error: 'Credenciais inválidas' });

        // NOTA: Em produção usar bcrypt.compare!
        const user = rows[0];
        if (senha === 'admin123') { // Senha padrão do seed
            res.json({ id: user.id, nome: user.nome, email: user.email, tipo: user.tipo });
        } else {
            res.status(401).json({ error: 'Senha incorreta' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro no login' });
    }
});

// CRUD Produtos
app.post('/api/produtos', upload.single('image'), async (req, res) => {
    const { name, brand, price, originalPrice, tag, rating, sku, description, category_id, modo_uso, mostrar_modo_uso, tem_variacoes, variations } = req.body;
    const image = req.file ? `http://localhost:3001/uploads/${req.file.filename}` : req.body.image;

    // Parse variations
    let parsedVariations = [];
    try {
        parsedVariations = typeof variations === 'string' ? JSON.parse(variations) : variations;
    } catch (e) { console.error("Error parsing variations", e); }

    try {
        const [result] = await db.query(
            'INSERT INTO produtos (nome, marca, preco, preco_original, imagem, tag, rating, sku, descricao, categoria_id, modo_uso, mostrar_modo_uso, tem_variacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, brand, parseFloat(price), originalPrice ? parseFloat(originalPrice) : null, image, tag, parseInt(rating) || 5, sku, description, parseInt(category_id), modo_uso, mostrar_modo_uso === 'true' || mostrar_modo_uso === 1 ? 1 : 0, tem_variacoes === 'true' || tem_variacoes === 1 ? 1 : 0]
        );
        const newId = result.insertId;

        if (Array.isArray(parsedVariations) && parsedVariations.length > 0) {
            const values = parsedVariations.map(v => [newId, v.nome, v.estoque]);
            await db.query('INSERT INTO produtos_variacoes (produto_id, nome, estoque) VALUES ?', [values]);
        }

        res.json({ id: newId, message: 'Produto criado com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar produto' });
    }
});

app.put('/api/produtos/:id', upload.single('image'), async (req, res) => {
    const { name, brand, price, originalPrice, tag, rating, sku, description, category_id, variations, modo_uso, mostrar_modo_uso, tem_variacoes } = req.body;
    const { id } = req.params;
    let image = req.body.image;
    if (req.file) {
        image = `http://localhost:3001/uploads/${req.file.filename}`;
    }

    // Parse variations
    let parsedVariations = [];
    try {
        parsedVariations = typeof variations === 'string' ? JSON.parse(variations) : variations;
    } catch (e) { console.error("Error parsing variations", e); }

    try {
        await db.query(
            'UPDATE produtos SET nome=?, marca=?, preco=?, preco_original=?, imagem=?, tag=?, rating=?, sku=?, descricao=?, categoria_id=?, modo_uso=?, mostrar_modo_uso=?, tem_variacoes=? WHERE id=?',
            [name, brand, parseFloat(price), originalPrice ? parseFloat(originalPrice) : null, image, tag, parseInt(rating) || 5, sku, description, parseInt(category_id), modo_uso, mostrar_modo_uso === 'true' || mostrar_modo_uso === 1 ? 1 : 0, tem_variacoes === 'true' || tem_variacoes === 1 ? 1 : 0, id]
        );

        // Sync variations: Delete and Re-insert
        await db.query('DELETE FROM produtos_variacoes WHERE produto_id = ?', [id]);
        if (Array.isArray(parsedVariations) && parsedVariations.length > 0) {
            const values = parsedVariations.map(v => [id, v.nome, v.estoque]);
            await db.query('INSERT INTO produtos_variacoes (produto_id, nome, estoque) VALUES ?', [values]);
        }

        res.json({ message: 'Produto atualizado com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
});

app.delete('/api/produtos/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM produtos WHERE id = ?', [req.params.id]);
        res.json({ message: 'Produto excluído com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao excluir produto' });
    }
});

// CRUD Categorias
app.post('/api/categorias', async (req, res) => {
    const { id, nome, descricao } = req.body;
    try {
        if (id && id !== 'undefined' && id !== 'null') {
            await db.query('UPDATE categorias SET nome = ?, descricao = ? WHERE id = ?', [nome, descricao, id]);
            res.json({ message: 'Categoria atualizada com sucesso' });
        } else {
            const [result] = await db.query('INSERT INTO categorias (nome, descricao) VALUES (?, ?)', [nome, descricao]);
            res.json({ id: result.insertId, message: 'Categoria criada com sucesso' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao salvar categoria' });
    }
});

app.delete('/api/categorias/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM categorias WHERE id = ?', [req.params.id]);
        res.json({ message: 'Categoria excluída com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao excluir categoria' });
    }
});

// CRUD Banners
app.post('/api/banners', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'mobile_image', maxCount: 1 }]), async (req, res) => {
    const { id, titulo, subtitulo, link, tag, ordem, mostrar_texto } = req.body;

    let desktop_url = req.files?.['image'] ? `http://localhost:3001/uploads/${req.files['image'][0].filename}` : req.body.imagem_url;
    let mobile_url = req.files?.['mobile_image'] ? `http://localhost:3001/uploads/${req.files['mobile_image'][0].filename}` : req.body.imagem_mobile_url;

    try {
        if (id && id !== 'undefined' && id !== 'null') {
            await db.query(
                `UPDATE banners SET 
                    imagem_url = ?, imagem_mobile_url = ?, titulo = ?, 
                    subtitulo = ?, link = ?, tag = ?, ordem = ?, mostrar_texto = ?
                 WHERE id = ?`,
                [desktop_url, mobile_url, titulo || '', subtitulo || '', link || '', tag || '', parseInt(ordem) || 0, mostrar_texto === 'true' || mostrar_texto === 1 ? 1 : 0, id]
            );
            res.json({ message: 'Banner atualizado com sucesso' });
        } else {
            if (!desktop_url) {
                return res.status(400).json({ error: 'A imagem principal (desktop) é obrigatória para novos banners' });
            }
            await db.query(
                'INSERT INTO banners (imagem_url, imagem_mobile_url, titulo, subtitulo, link, tag, ordem, mostrar_texto, ativo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)',
                [desktop_url, mobile_url, titulo || '', subtitulo || '', link || '', tag || '', parseInt(ordem) || 0, mostrar_texto === 'true' || mostrar_texto === 1 ? 1 : 0]
            );
            res.json({ message: 'Banner criado com sucesso' });
        }
    } catch (error) {
        console.error('ERRO AO SALVAR BANNER:', error);
        res.status(500).json({ error: 'Erro ao salvar banner no banco de dados', details: error.message });
    }
});

// --- ROTAS DE MARCAS ---
app.get('/api/marcas', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM marcas WHERE ativo = 1 ORDER BY ordem ASC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar marcas' });
    }
});

app.post('/api/marcas', upload.single('image'), async (req, res) => {
    const { nome, ordem } = req.body;
    const final_url = req.file ? `http://localhost:3001/uploads/${req.file.filename}` : null;

    if (!final_url) {
        return res.status(400).json({ error: 'A imagem da marca é obrigatória' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO marcas (nome, imagem_url, ordem) VALUES (?, ?, ?)',
            [nome, final_url, parseInt(ordem) || 0]
        );
        res.json({ id: result.insertId, message: 'Marca criada com sucesso' });
    } catch (error) {
        console.error('Erro ao salvar marca:', error);
        res.status(500).json({ error: 'Erro ao salvar marca no banco de dados' });
    }
});

app.delete('/api/marcas/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM marcas WHERE id = ?', [req.params.id]);
        res.json({ message: 'Marca excluída com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao excluir marca' });
    }
});

app.delete('/api/banners/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM banners WHERE id = ?', [req.params.id]);
        res.json({ message: 'Banner excluído com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao excluir banner' });
    }
});

// --- ROTAS DE AVALIAÇÕES ---

// Listar avaliações de um produto
app.get('/api/produtos/:id/avaliacoes', async (req, res) => {
    try {
        const [rows] = await db.query(`
      SELECT a.*, u.nome as author 
      FROM avaliacoes a
      JOIN usuarios u ON a.usuario_id = u.id
      WHERE a.produto_id = ? AND a.aprovado = 1
      ORDER BY a.data_criacao DESC
    `, [req.params.id]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar avaliações' });
    }
});

// Postar nova avaliação
app.post('/api/avaliacoes', async (req, res) => {
    const { usuario_id, produto_id, estrelas, titulo, comentario } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO avaliacoes (usuario_id, produto_id, estrelas, titulo, comentario) VALUES (?, ?, ?, ?, ?)',
            [usuario_id, produto_id, estrelas, titulo, comentario]
        );
        res.json({ id: result.insertId, message: 'Avaliação enviada com sucesso! Aguarde a moderação.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao enviar avaliação' });
    }
});

// Admin: Listar todas as avaliações (para moderação)
app.get('/api/admin/avaliacoes', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT a.*, u.nome as author, p.nome as produto_nome, p.imagem as produto_imagem
            FROM avaliacoes a
            JOIN usuarios u ON a.usuario_id = u.id
            JOIN produtos p ON a.produto_id = p.id
            ORDER BY a.aprovado ASC, a.data_criacao DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar avaliações para moderação' });
    }
});

// Admin: Aprovar avaliação
app.put('/api/admin/avaliacoes/:id/aprovar', async (req, res) => {
    try {
        // 1. Marcar como aprovado
        await db.query('UPDATE avaliacoes SET aprovado = 1 WHERE id = ?', [req.params.id]);

        // 2. Buscar o ID do produto desta avaliação
        const [review] = await db.query('SELECT produto_id FROM avaliacoes WHERE id = ?', [req.params.id]);
        if (review.length > 0) {
            const productId = review[0].produto_id;

            // 3. Recalcular média e contagem
            const [stats] = await db.query(`
                SELECT 
                    COUNT(*) as total,
                    AVG(estrelas) as media
                FROM avaliacoes 
                WHERE produto_id = ? AND aprovado = 1
            `, [productId]);

            const { total, media } = stats[0];

            // 4. Atualizar a tabela de produtos
            await db.query(`
                UPDATE produtos 
                SET rating = ?, review_count = ? 
                WHERE id = ?
            `, [Math.round(media || 5), total, productId]);
        }

        res.json({ message: 'Avaliação aprovada e estatísticas atualizadas!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao aprovar avaliação' });
    }
});

// Admin: Excluir avaliação
app.delete('/api/admin/avaliacoes/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM avaliacoes WHERE id = ?', [req.params.id]);
        res.json({ message: 'Avaliação excluída com sucesso!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao excluir avaliação' });
    }
});

// --- ROTAS DE PERFIL ---

// Buscar perfil do usuário
app.get('/api/usuarios/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, nome, email, telefone, morada, tipo FROM usuarios WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar perfil' });
    }
});

// Atualizar perfil do usuário
app.put('/api/usuarios/:id', async (req, res) => {
    const { nome, email, telefone, morada, senha } = req.body;
    try {
        let query = 'UPDATE usuarios SET nome = ?, email = ?, telefone = ?, morada = ?';
        let params = [nome, email, telefone, morada];

        if (senha && senha.trim() !== "") {
            query += ', senha = ?';
            params.push(senha);
        }

        query += ' WHERE id = ?';
        params.push(req.params.id);

        await db.query(query, params);
        res.json({ message: 'Perfil atualizado com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
});

// --- ROTAS DE PEDIDOS ---

// Criar Pedido (Checkout)
app.post('/api/pedidos', async (req, res) => {
    const { usuario_id, valor_total, endereco_entrega, itens } = req.body;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [orderResult] = await connection.query(
            'INSERT INTO pedidos (usuario_id, valor_total, endereco_entrega, status) VALUES (?, ?, ?, "processando")',
            [usuario_id, valor_total, endereco_entrega]
        );

        const pedido_id = orderResult.insertId;

        for (const item of itens) {
            await connection.query(
                'INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)',
                [pedido_id, item.produto_id, item.quantidade, item.preco_unitario]
            );
        }

        await connection.commit();
        res.json({ id: pedido_id, message: 'Pedido realizado com sucesso!' });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error(error);
        res.status(500).json({ error: 'Erro ao processar pedido' });
    } finally {
        if (connection) connection.release();
    }
});

// Listar Pedidos (Admin)
app.get('/api/admin/pedidos', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT p.*, u.nome as cliente_nome, u.email as cliente_email 
            FROM pedidos p
            JOIN usuarios u ON p.usuario_id = u.id
            ORDER BY p.data_pedido DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar pedidos' });
    }
});

// Detalhes do Pedido (Admin)
app.get('/api/admin/pedidos/:id', async (req, res) => {
    try {
        const [order] = await db.query(`
            SELECT p.*, u.nome as cliente_nome, u.email as cliente_email, u.telefone as cliente_telefone
            FROM pedidos p
            JOIN usuarios u ON p.usuario_id = u.id
            WHERE p.id = ?
        `, [req.params.id]);

        if (order.length === 0) return res.status(404).json({ error: 'Pedido não encontrado' });

        const [items] = await db.query(`
            SELECT i.*, p.nome as produto_nome, p.imagem as imagem
            FROM itens_pedido i
            JOIN produtos p ON i.produto_id = p.id
            WHERE i.pedido_id = ?
        `, [req.params.id]);

        res.json({ ...order[0], itens: items });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar detalhes do pedido' });
    }
});

// Atualizar Status do Pedido (Admin)
app.put('/api/admin/pedidos/:id/status', async (req, res) => {
    const { status } = req.body;
    try {
        await db.query('UPDATE pedidos SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'Status do pedido atualizado!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar status' });
    }
});

// Listar Pedidos de um Usuário (Central do Cliente)
app.get('/api/usuarios/:id/pedidos', async (req, res) => {
    const { id } = req.params;
    try {
        const [orders] = await db.query(`
            SELECT p.* 
            FROM pedidos p
            WHERE p.usuario_id = ?
            ORDER BY p.data_pedido DESC
        `, [id]);

        if (orders.length === 0) return res.json([]);

        // Para cada pedido, buscar os itens
        const ordersWithItems = await Promise.all(orders.map(async (order) => {
            const [items] = await db.query(`
                SELECT i.*, p.nome as produto_nome, p.imagem as imagem
                FROM itens_pedido i
                JOIN produtos p ON i.produto_id = p.id
                WHERE i.pedido_id = ?
            `, [order.id]);
            return { ...order, itens: items };
        }));

        res.json(ordersWithItems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar histórico de pedidos' });
    }
});

// --- ROTAS DE GESTÃO DE USUÁRIOS (ADMIN) ---

// Listar todos os usuários
app.get('/api/admin/usuarios', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, nome, email, telefone, morada, tipo, data_cadastro FROM usuarios ORDER BY data_cadastro DESC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
});

// Ver histórico de pedidos de um usuário específico
app.get('/api/admin/usuarios/:id/pedidos', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT p.*, (SELECT COUNT(*) FROM itens_pedido WHERE pedido_id = p.id) as total_itens 
            FROM pedidos p 
            WHERE p.usuario_id = ? 
            ORDER BY p.data_pedido DESC
        `, [req.params.id]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar histórico de pedidos' });
    }
});

// --- ROTAS DE CONFIGURAÇÕES (ADMIN) ---

// Buscar todas as configurações
app.get('/api/configuracoes', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM configuracoes');
        // Converter array de rows para um objeto chave-valor
        const settings = rows.reduce((acc, current) => {
            acc[current.chave] = current.valor;
            return acc;
        }, {});
        res.json(settings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar configurações' });
    }
});

// Atualizar configurações
app.put('/api/configuracoes', async (req, res) => {
    const settings = req.body; // Objeto { chave: valor }
    try {
        const queries = Object.keys(settings).map(chave => {
            return db.query('UPDATE configuracoes SET valor = ? WHERE chave = ?', [settings[chave], chave]);
        });
        await Promise.all(queries);
        res.json({ message: 'Configurações atualizadas com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar configurações' });
    }
});

// --- ROTAS DE MÉTRICAS (ADMIN) ---

app.get('/api/admin/metrics', async (req, res) => {
    try {
        // 1. Resumo Geral
        const [generalStats] = await db.query(`
            SELECT 
                COUNT(*) as total_pedidos,
                SUM(valor_total) as faturamento_total,
                AVG(valor_total) as ticket_medio
            FROM pedidos 
            WHERE status != 'cancelado'
        `);

        // 2. Faturamento Mensal (últimos 6 meses)
        const [monthlyRevenue] = await db.query(`
            SELECT 
                DATE_FORMAT(data_pedido, '%M') as month,
                SUM(valor_total) as revenue
            FROM pedidos
            WHERE status != 'cancelado' 
              AND data_pedido >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(data_pedido, '%Y-%m')
            ORDER BY data_pedido ASC
        `);

        // 3. Vendas por Categoria (Top 5)
        const [categorySales] = await db.query(`
            SELECT 
                c.nome as name,
                COUNT(i.id) as value
            FROM itens_pedido i
            JOIN produtos p ON i.produto_id = p.id
            JOIN categorias c ON p.categoria_id = c.id
            JOIN pedidos ped ON i.pedido_id = ped.id
            WHERE ped.status != 'cancelado'
            GROUP BY c.id
            ORDER BY value DESC
            LIMIT 5
        `);

        // 4. Pedidos Recentes para o Dashboard
        const [recentOrders] = await db.query(`
            SELECT p.*, u.nome as cliente_nome
            FROM pedidos p
            JOIN usuarios u ON p.usuario_id = u.id
            ORDER BY p.data_pedido DESC
            LIMIT 5
        `);

        res.json({
            summary: generalStats[0],
            monthly: monthlyRevenue,
            categories: categorySales,
            recent: recentOrders
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar métricas' });
    }
});

// Alterar nível de acesso (Admin/Cliente)
app.put('/api/admin/usuarios/:id/role', async (req, res) => {
    const { tipo } = req.body;
    try {
        await db.query('UPDATE usuarios SET tipo = ? WHERE id = ?', [tipo, req.params.id]);
        res.json({ message: `Usuário agora é ${tipo}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao alterar nível de acesso' });
    }
});

// --- ROTAS DE POPUPS (PROMOÇÕES) ---

// Listar todos os popups (Admin)
app.get('/api/admin/popups', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM popups ORDER BY data_criacao DESC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar popups' });
    }
});

// Criar/Salvar popup (Admin)
app.post('/api/admin/popups', upload.single('image'), async (req, res) => {
    const { id, titulo, link, ativo } = req.body;
    const imagePath = req.file ? `http://localhost:3001/uploads/${req.file.filename}` : req.body.image;

    try {
        if (id && id !== 'undefined' && id !== 'null') {
            await db.query(
                'UPDATE popups SET titulo = ?, imagem = ?, link = ?, ativo = ? WHERE id = ?',
                [titulo, imagePath, link, ativo === 'true' || ativo === 1, id]
            );
            res.json({ message: 'Popup atualizado!' });
        } else {
            await db.query(
                'INSERT INTO popups (titulo, imagem, link, ativo) VALUES (?, ?, ?, ?)',
                [titulo, imagePath, link, ativo === 'true' || ativo === 1]
            );
            res.json({ message: 'Popup criado!' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao salvar popup' });
    }
});

// Excluir popup (Admin)
app.delete('/api/admin/popups/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM popups WHERE id = ?', [req.params.id]);
        res.json({ message: 'Popup excluído!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao excluir popup' });
    }
});

// Alternar status ativo (Admin)
app.put('/api/admin/popups/:id/status', async (req, res) => {
    const { ativo } = req.body;
    try {
        // Se estiver ativando, desativar todos os outros primeiro (apenas um ativo por vez)
        if (ativo) {
            await db.query('UPDATE popups SET ativo = 0');
        }
        await db.query('UPDATE popups SET ativo = ? WHERE id = ?', [ativo, req.params.id]);
        res.json({ message: 'Status atualizado!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar status' });
    }
});

// Pegar popup ativo (Público)
app.get('/api/popups/ativo', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM popups WHERE ativo = 1 LIMIT 1');
        res.json(rows[0] || null);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar popup ativo' });
    }
});

// --- ROTAS DE CUPONS (ADMIN & PÚBLICO) ---

// Listar todos os cupons (Admin)
app.get('/api/admin/cupons', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM cupons ORDER BY data_criacao DESC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar cupons' });
    }
});

// Criar cupom (Admin)
app.post('/api/admin/cupons', async (req, res) => {
    const { codigo, tipo, valor, validade } = req.body;
    try {
        await db.query(
            'INSERT INTO cupons (codigo, tipo, valor, validade) VALUES (?, ?, ?, ?)',
            [codigo.toUpperCase(), tipo, valor, validade || null]
        );
        res.json({ message: 'Cupom criado com sucesso!' });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Este código de cupom já existe' });
        res.status(500).json({ error: 'Erro ao criar cupom' });
    }
});

// Excluir cupom (Admin)
app.delete('/api/admin/cupons/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM cupons WHERE id = ?', [req.params.id]);
        res.json({ message: 'Cupom excluído!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao excluir cupom' });
    }
});

// Validar cupom (Público)
app.post('/api/cupons/validar', async (req, res) => {
    const { codigo } = req.body;
    try {
        const [rows] = await db.query(
            'SELECT * FROM cupons WHERE codigo = ? AND ativo = 1 AND (validade IS NULL OR validade > NOW())',
            [codigo.toUpperCase()]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Cupom inválido ou expirado' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao validar cupom' });
    }
});

// --- ROTAS DE CARRINHO (PERSISTÊNCIA) ---

// Salvar carrinho (Insert ou Update se já existir)
app.post('/api/carrinho', async (req, res) => {
    const { usuario_id, itens } = req.body;
    try {
        await db.query(
            'INSERT INTO carrinhos (usuario_id, itens) VALUES (?, ?) ON DUPLICATE KEY UPDATE itens = ?',
            [usuario_id, JSON.stringify(itens), JSON.stringify(itens)]
        );
        res.json({ message: 'Carrinho salvo com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao salvar carrinho' });
    }
});

// Buscar carrinho salvo
app.get('/api/carrinho/:usuario_id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT itens FROM carrinhos WHERE usuario_id = ?', [req.params.usuario_id]);
        if (rows.length > 0) {
            res.json(JSON.parse(rows[0].itens));
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar carrinho salvo' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
