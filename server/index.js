const express = require('express');
const cors = require('cors');
const db = require('./db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const serverless = require('serverless-http');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração do Multer para Uploads
// Nota: Em ambiente serverless (Netlify), uploads de arquivos locais (disco) não persistem.
// O ideal seria usar S3 ou Cloudinary. Para este exemplo, manteremos assim, mas cientes de que
// no Netlify os arquivos upados desaparecerão após a execução da função.
const uploadsDir = path.join('/tmp', 'uploads'); // Usar /tmp no Netlify (readonly root)
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// Servir arquivos estáticos do /tmp em dev/prod (embora efêmero em serverless)
app.use('/uploads', express.static(uploadsDir));

// Rotas precisam começar com /.netlify/functions/api se rodando via netlify-cli localmente ou prod
// Mas podemos usar um router base para facilitar.

const router = express.Router();

// Rota básica
router.get('/', (req, res) => {
    res.send('API Hair Beauty Hub está rodando com Postgres!');
});

// Listar produtos com filtros e busca
router.get('/produtos', async (req, res) => {
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
        let paramIndex = 1;

        if (search) {
            query += ` AND (p.nome ILIKE $${paramIndex} OR p.marca ILIKE $${paramIndex} OR p.descricao ILIKE $${paramIndex})`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm);
            paramIndex++; // Reuse same param for 3 checks? No, ILIKE $1 OR ... ILIKE $1 works
        }

        if (minPrice) {
            query += ` AND p.preco >= $${paramIndex++}`;
            params.push(parseFloat(minPrice));
        }

        if (maxPrice) {
            query += ` AND p.preco <= $${paramIndex++}`;
            params.push(parseFloat(maxPrice));
        }

        if (brand) {
            query += ` AND p.marca = $${paramIndex++}`;
            params.push(brand);
        }

        if (category) {
            query += ` AND c.nome = $${paramIndex++}`;
            params.push(category);
        }

        query += " ORDER BY p.id DESC";

        const { rows } = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
});

// Sugestões de Busca (Live Search)
router.get('/search/suggestions', async (req, res) => {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);

    try {
        const { rows } = await db.query(
            'SELECT id, nome as name, imagem as image, preco as price FROM produtos WHERE nome ILIKE $1 OR marca ILIKE $1 LIMIT 5',
            [`%${q}%`]
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar sugestões' });
    }
});

// Listar categorias
router.get('/categorias', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM categorias');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar categorias' });
    }
});

// Buscar produto por ID com Variações
router.get('/produtos/:id', async (req, res) => {
    try {
        const { rows: productRows } = await db.query(`
            SELECT 
                p.id, p.nome as name, p.marca as brand, p.preco as price, 
                p.preco_original as originalPrice, p.imagem as image, 
                p.tag, p.rating, p.review_count as reviewCount, 
                p.sku, p.descricao as description, p.estoque, c.nome as category,
                p.modo_uso, p.mostrar_modo_uso, p.tem_variacoes
            FROM produtos p 
            LEFT JOIN categorias c ON p.categoria_id = c.id
            WHERE p.id = $1
        `, [req.params.id]);

        if (productRows.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });

        const { rows: variationRows } = await db.query(
            'SELECT id, nome, estoque FROM produtos_variacoes WHERE produto_id = $1',
            [req.params.id]
        );

        res.json({ ...productRows[0], variations: variationRows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar produto' });
    }
});

// --- ROTAS DE BANNER ---
router.get('/banners', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM banners WHERE ativo = TRUE ORDER BY ordem ASC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar banners' });
    }
});

// --- ROTAS DE USUÁRIO (CLIENTE) ---

// Registro de Usuário
router.post('/usuarios/registro', async (req, res) => {
    const { nome, email, senha, telefone } = req.body;
    try {
        const { rows } = await db.query(
            'INSERT INTO usuarios (nome, email, senha, tipo, telefone) VALUES ($1, $2, $3, \'cliente\', $4) RETURNING id',
            [nome, email, senha, telefone]
        );
        res.json({ id: rows[0].id, message: 'Conta criada com sucesso!' });
    } catch (error) {
        console.error(error);
        if (error.code === '23505') { // Postgres unique violation code
            return res.status(400).json({ error: 'Este email já está cadastrado' });
        }
        res.status(500).json({ error: 'Erro ao criar conta' });
    }
});

// Login de Usuário (Cliente)
router.post('/usuarios/login', async (req, res) => {
    const { email, senha } = req.body;
    try {
        const { rows } = await db.query('SELECT * FROM usuarios WHERE email = $1 AND tipo = \'cliente\'', [email]);
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

// Login Admin
router.post('/admin/login', async (req, res) => {
    const { email, senha } = req.body;
    try {
        const { rows } = await db.query('SELECT * FROM usuarios WHERE email = $1 AND tipo = \'admin\'', [email]);
        if (rows.length === 0) return res.status(401).json({ error: 'Credenciais inválidas' });

        const user = rows[0];
        if (senha === 'admin123' || senha === user.senha) {
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
router.post('/produtos', async (req, res) => {
    // Sanitização rigorosa de tipos
    const priceVal = price && !isNaN(parseFloat(price)) ? parseFloat(price) : 0;
    const originalPriceVal = originalPrice && !isNaN(parseFloat(originalPrice)) ? parseFloat(originalPrice) : null;
    const ratingVal = rating && !isNaN(parseInt(rating)) ? parseInt(rating) : 5;
    const categoryVal = category_id && !isNaN(parseInt(category_id)) ? parseInt(category_id) : null;
    const stockVal = req.body.estoque && !isNaN(parseInt(req.body.estoque)) ? parseInt(req.body.estoque) : 0;

    // Tratamento de booleans que podem vir como strings "true"/"false" ou 1/0
    const showUsageVal = mostrar_modo_uso === true || mostrar_modo_uso === 'true' || mostrar_modo_uso === 1 || mostrar_modo_uso === '1';
    const hasVariationsVal = tem_variacoes === true || tem_variacoes === 'true' || tem_variacoes === 1 || tem_variacoes === '1';

    let parsedVariations = [];
    try {
        parsedVariations = typeof variations === 'string' ? JSON.parse(variations) : (variations || []);
    } catch (e) { parsedVariations = []; }

    const insertProduct = async () => {
        return await db.query(
            `INSERT INTO produtos (nome, marca, preco, preco_original, imagem, tag, rating, sku, descricao, categoria_id, modo_uso, mostrar_modo_uso, tem_variacoes, estoque) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id`,
            [name || 'Produto Sem Nome', brand || '', priceVal, originalPriceVal, image, tag || '', ratingVal, sku || '', description || '', categoryVal, modo_uso || '', showUsageVal, hasVariationsVal, stockVal]
        );
    };

    try {
        const { rows } = await insertProduct();
        const newId = rows[0].id;

        if (Array.isArray(parsedVariations) && parsedVariations.length > 0) {
            for (const v of parsedVariations) {
                await db.query('INSERT INTO produtos_variacoes (produto_id, nome, estoque) VALUES ($1, $2, $3)', [newId, v.nome, parseInt(v.estoque) || 0]);
            }
        }

        res.json({ id: newId, message: 'Produto criado com sucesso' });
    } catch (error) {
        // Auto-fix: Se erro for "value too long" (code 22001), tenta alterar a coluna imagem para TEXT e reexecuta
        if (error.code === '22001' && image && image.length > 255) {
            console.log("Detectado erro de truncamento. Tentando corrigir schema da coluna imagem...");
            try {
                await db.query('ALTER TABLE produtos ALTER COLUMN imagem TYPE TEXT');
                console.log("Schema corrigido. Tentando inserir novamente...");

                const { rows } = await insertProduct();
                // Sucesso na segunda tentativa
                return res.json({ id: rows[0].id, message: 'Produto criado com sucesso (Schema corrigido)' });
            } catch (retryError) {
                console.error('Falha na retentativa:', retryError);
                return res.status(500).json({ error: 'Erro ao criar produto mesmo após correção', details: retryError.message, code: retryError.code });
            }
        }

        console.error(error);
        res.status(500).json({ error: 'Erro ao criar produto', details: error.message, code: error.code });
    }
});

router.put('/produtos/:id', async (req, res) => {
    const { name, brand, price, originalPrice, tag, rating, sku, description, category_id, variations, modo_uso, mostrar_modo_uso, tem_variacoes } = req.body;
    const { id } = req.params;
    let image = req.body.image;
    // Removed req.file logic for serverless

    let parsedVariations = [];
    try {
        parsedVariations = typeof variations === 'string' ? JSON.parse(variations) : variations;
    } catch (e) { }

    try {
        await db.query(
            `UPDATE produtos SET nome=$1, marca=$2, preco=$3, preco_original=$4, imagem=$5, tag=$6, rating=$7, sku=$8, descricao=$9, categoria_id=$10, modo_uso=$11, mostrar_modo_uso=$12, tem_variacoes=$13 WHERE id=$14`,
            [name, brand, parseFloat(price), originalPrice ? parseFloat(originalPrice) : null, image, tag, parseInt(rating) || 5, sku, description, parseInt(category_id), modo_uso, mostrar_modo_uso === 'true' || mostrar_modo_uso === true, tem_variacoes === 'true' || tem_variacoes === true, id]
        );

        await db.query('DELETE FROM produtos_variacoes WHERE produto_id = $1', [id]);
        if (Array.isArray(parsedVariations) && parsedVariations.length > 0) {
            for (const v of parsedVariations) {
                await db.query('INSERT INTO produtos_variacoes (produto_id, nome, estoque) VALUES ($1, $2, $3)', [id, v.nome, v.estoque]);
            }
        }

        res.json({ message: 'Produto atualizado com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar produto', details: error.message, code: error.code });
    }
});

router.delete('/produtos/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM produtos WHERE id = $1', [req.params.id]);
        res.json({ message: 'Produto excluído com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao excluir produto' });
    }
});

// CRUD Categorias
router.post('/categorias', async (req, res) => {
    const { id, nome, descricao } = req.body;
    try {
        if (id && id !== 'undefined' && id !== 'null') {
            await db.query('UPDATE categorias SET nome = $1, descricao = $2 WHERE id = $3', [nome, descricao, id]);
            res.json({ message: 'Categoria atualizada com sucesso' });
        } else {
            const { rows } = await db.query('INSERT INTO categorias (nome, descricao) VALUES ($1, $2) RETURNING id', [nome, descricao]);
            res.json({ id: rows[0].id, message: 'Categoria criada com sucesso' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao salvar categoria' });
    }
});

router.delete('/categorias/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM categorias WHERE id = $1', [req.params.id]);
        res.json({ message: 'Categoria excluída com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao excluir categoria' });
    }
});

// CRUD Banners
router.post('/banners', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'mobile_image', maxCount: 1 }]), async (req, res) => {
    const { id, titulo, subtitulo, link, tag, ordem, mostrar_texto } = req.body;

    let desktop_url = req.files?.['image'] ? `/uploads/${req.files['image'][0].filename}` : req.body.imagem_url;
    let mobile_url = req.files?.['mobile_image'] ? `/uploads/${req.files['mobile_image'][0].filename}` : req.body.imagem_mobile_url;

    try {
        if (id && id !== 'undefined' && id !== 'null') {
            await db.query(
                `UPDATE banners SET 
                    imagem_url = $1, imagem_mobile_url = $2, titulo = $3, 
                    subtitulo = $4, link = $5, tag = $6, ordem = $7, mostrar_texto = $8
                 WHERE id = $9`,
                [desktop_url, mobile_url, titulo || '', subtitulo || '', link || '', tag || '', parseInt(ordem) || 0, mostrar_texto === 'true' || mostrar_texto === true, id]
            );
            res.json({ message: 'Banner atualizado com sucesso' });
        } else {
            if (!desktop_url) {
                return res.status(400).json({ error: 'A imagem principal (desktop) é obrigatória para novos banners' });
            }
            await db.query(
                'INSERT INTO banners (imagem_url, imagem_mobile_url, titulo, subtitulo, link, tag, ordem, mostrar_texto, ativo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)',
                [desktop_url, mobile_url, titulo || '', subtitulo || '', link || '', tag || '', parseInt(ordem) || 0, mostrar_texto === 'true' || mostrar_texto === true]
            );
            res.json({ message: 'Banner criado com sucesso' });
        }
    } catch (error) {
        console.error('ERRO AO SALVAR BANNER:', error);
        res.status(500).json({ error: 'Erro ao salvar banner no banco de dados', details: error.message });
    }
});

router.delete('/banners/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM banners WHERE id = $1', [req.params.id]);
        res.json({ message: 'Banner excluído com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao excluir banner' });
    }
});

// --- ROTAS DE MARCAS ---
router.get('/marcas', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM marcas WHERE ativo = TRUE ORDER BY ordem ASC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar marcas' });
    }
});

router.post('/marcas', upload.single('image'), async (req, res) => {
    const { nome, ordem } = req.body;
    const final_url = req.file ? `/uploads/${req.file.filename}` : null;

    if (!final_url) {
        return res.status(400).json({ error: 'A imagem da marca é obrigatória' });
    }

    try {
        const { rows } = await db.query(
            'INSERT INTO marcas (nome, imagem_url, ordem) VALUES ($1, $2, $3) RETURNING id',
            [nome, final_url, parseInt(ordem) || 0]
        );
        res.json({ id: rows[0].id, message: 'Marca criada com sucesso' });
    } catch (error) {
        console.error('Erro ao salvar marca:', error);
        res.status(500).json({ error: 'Erro ao salvar marca no banco de dados' });
    }
});

router.delete('/marcas/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM marcas WHERE id = $1', [req.params.id]);
        res.json({ message: 'Marca excluída com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao excluir marca' });
    }
});


// --- ROTAS DE AVALIAÇÕES ---
router.get('/produtos/:id/avaliacoes', async (req, res) => {
    try {
        const { rows } = await db.query(`
      SELECT a.*, u.nome as author 
      FROM avaliacoes a
      JOIN usuarios u ON a.usuario_id = u.id
      WHERE a.produto_id = $1 AND a.aprovado = TRUE
      ORDER BY a.data_criacao DESC
    `, [req.params.id]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar avaliações' });
    }
});

router.post('/avaliacoes', async (req, res) => {
    const { usuario_id, produto_id, estrelas, titulo, comentario } = req.body;
    try {
        const { rows } = await db.query(
            'INSERT INTO avaliacoes (usuario_id, produto_id, estrelas, titulo, comentario) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [usuario_id, produto_id, estrelas, titulo, comentario]
        );
        res.json({ id: rows[0].id, message: 'Avaliação enviada com sucesso! Aguarde a moderação.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao enviar avaliação' });
    }
});

router.get('/admin/avaliacoes', async (req, res) => {
    try {
        const { rows } = await db.query(`
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

router.put('/admin/avaliacoes/:id/aprovar', async (req, res) => {
    try {
        await db.query('UPDATE avaliacoes SET aprovado = TRUE WHERE id = $1', [req.params.id]);

        const { rows: review } = await db.query('SELECT produto_id FROM avaliacoes WHERE id = $1', [req.params.id]);
        if (review.length > 0) {
            const productId = review[0].produto_id;
            const { rows: stats } = await db.query(`
                SELECT 
                    COUNT(*) as total,
                    AVG(estrelas) as media
                FROM avaliacoes 
                WHERE produto_id = $1 AND aprovado = TRUE
            `, [productId]);

            const { total, media } = stats[0];

            await db.query(`
                UPDATE produtos 
                SET rating = $1, review_count = $2
                WHERE id = $3
            `, [Math.round(media || 5), total, productId]);
        }

        res.json({ message: 'Avaliação aprovada e estatísticas atualizadas!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao aprovar avaliação' });
    }
});

router.delete('/admin/avaliacoes/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM avaliacoes WHERE id = $1', [req.params.id]);
        res.json({ message: 'Avaliação excluída com sucesso!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao excluir avaliação' });
    }
});

// --- ROTAS DE PERFIL ---
router.get('/usuarios/:id', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT id, nome, email, telefone, morada, tipo FROM usuarios WHERE id = $1', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar perfil' });
    }
});

router.put('/usuarios/:id', async (req, res) => {
    const { nome, email, telefone, morada, senha } = req.body;
    try {
        let query = 'UPDATE usuarios SET nome = $1, email = $2, telefone = $3, morada = $4';
        let params = [nome, email, telefone, morada];
        let paramIndex = 5;

        if (senha && senha.trim() !== "") {
            query += `, senha = $${paramIndex++}`;
            params.push(senha);
        }

        query += ` WHERE id = $${paramIndex}`;
        params.push(req.params.id);

        await db.query(query, params);
        res.json({ message: 'Perfil atualizado com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
});

// --- ROTAS DE PEDIDOS ---
router.post('/pedidos', async (req, res) => {
    const { usuario_id, valor_total, endereco_entrega, itens } = req.body;
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const { rows: orderResult } = await client.query(
            'INSERT INTO pedidos (usuario_id, valor_total, endereco_entrega, status) VALUES ($1, $2, $3, \'processando\') RETURNING id',
            [usuario_id, valor_total, endereco_entrega]
        );

        const pedido_id = orderResult[0].id;

        for (const item of itens) {
            await client.query(
                'INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES ($1, $2, $3, $4)',
                [pedido_id, item.produto_id, item.quantidade, item.preco_unitario]
            );
        }

        await client.query('COMMIT');
        res.json({ id: pedido_id, message: 'Pedido realizado com sucesso!' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ error: 'Erro ao processar pedido' });
    } finally {
        client.release();
    }
});

router.get('/admin/pedidos', async (req, res) => {
    try {
        const { rows } = await db.query(`
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

router.get('/admin/pedidos/:id', async (req, res) => {
    try {
        const { rows: order } = await db.query(`
            SELECT p.*, u.nome as cliente_nome, u.email as cliente_email, u.telefone as cliente_telefone
            FROM pedidos p
            JOIN usuarios u ON p.usuario_id = u.id
            WHERE p.id = $1
        `, [req.params.id]);

        if (order.length === 0) return res.status(404).json({ error: 'Pedido não encontrado' });

        const { rows: items } = await db.query(`
            SELECT i.*, p.nome as produto_nome, p.imagem as imagem
            FROM itens_pedido i
            JOIN produtos p ON i.produto_id = p.id
            WHERE i.pedido_id = $1
        `, [req.params.id]);

        res.json({ ...order[0], itens: items });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar detalhes do pedido' });
    }
});

router.put('/admin/pedidos/:id/status', async (req, res) => {
    const { status } = req.body;
    try {
        await db.query('UPDATE pedidos SET status = $1 WHERE id = $2', [status, req.params.id]);
        res.json({ message: 'Status do pedido atualizado!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar status' });
    }
});

router.get('/usuarios/:id/pedidos', async (req, res) => {
    const { id } = req.params;
    try {
        const { rows: orders } = await db.query(`
            SELECT p.* 
            FROM pedidos p
            WHERE p.usuario_id = $1
            ORDER BY p.data_pedido DESC
        `, [id]);

        if (orders.length === 0) return res.json([]);

        const ordersWithItems = await Promise.all(orders.map(async (order) => {
            const { rows: items } = await db.query(`
                SELECT i.*, p.nome as produto_nome, p.imagem as imagem
                FROM itens_pedido i
                JOIN produtos p ON i.produto_id = p.id
                WHERE i.pedido_id = $1
            `, [order.id]);
            return { ...order, itens: items };
        }));

        res.json(ordersWithItems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar histórico de pedidos' });
    }
});

// --- ROTAS GESTÃO USUÁRIOS ---
router.get('/admin/usuarios', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT id, nome, email, telefone, morada, tipo, data_cadastro FROM usuarios ORDER BY data_cadastro DESC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
});

router.get('/admin/usuarios/:id/pedidos', async (req, res) => {
    try {
        const { rows } = await db.query(`
            SELECT p.*, (SELECT COUNT(*) FROM itens_pedido WHERE pedido_id = p.id) as total_itens 
            FROM pedidos p 
            WHERE p.usuario_id = $1 
            ORDER BY p.data_pedido DESC
        `, [req.params.id]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar histórico de pedidos' });
    }
});

router.put('/admin/usuarios/:id/role', async (req, res) => {
    const { tipo } = req.body;
    try {
        await db.query('UPDATE usuarios SET tipo = $1 WHERE id = $2', [tipo, req.params.id]);
        res.json({ message: `Usuário agora é ${tipo}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao alterar nível de acesso' });
    }
});

// --- ROTAS DE POPUPS ---
router.get('/admin/popups', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM popups ORDER BY data_criacao DESC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar popups' });
    }
});

router.post('/admin/popups', upload.single('image'), async (req, res) => {
    const { id, titulo, link, ativo } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : req.body.image;

    try {
        if (id && id !== 'undefined' && id !== 'null') {
            await db.query(
                'UPDATE popups SET titulo = $1, imagem = $2, link = $3, ativo = $4 WHERE id = $5',
                [titulo, imagePath, link, ativo === 'true' || ativo === true, id]
            );
            res.json({ message: 'Popup atualizado!' });
        } else {
            await db.query(
                'INSERT INTO popups (titulo, imagem, link, ativo) VALUES ($1, $2, $3, $4)',
                [titulo, imagePath, link, ativo === 'true' || ativo === true]
            );
            res.json({ message: 'Popup criado!' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao salvar popup' });
    }
});

router.delete('/admin/popups/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM popups WHERE id = $1', [req.params.id]);
        res.json({ message: 'Popup excluído!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao excluir popup' });
    }
});

router.put('/admin/popups/:id/status', async (req, res) => {
    const { ativo } = req.body;
    try {
        if (ativo) {
            await db.query('UPDATE popups SET ativo = FALSE');
        }
        await db.query('UPDATE popups SET ativo = $1 WHERE id = $2', [ativo, req.params.id]);
        res.json({ message: 'Status atualizado!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar status' });
    }
});

router.get('/popups/ativo', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM popups WHERE ativo = TRUE LIMIT 1');
        res.json(rows[0] || null);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar popup ativo' });
    }
});

// --- ROTAS DE CUPONS ---
router.get('/admin/cupons', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM cupons ORDER BY data_criacao DESC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar cupons' });
    }
});

router.post('/admin/cupons', async (req, res) => {
    const { codigo, tipo, valor, validade } = req.body;
    try {
        await db.query(
            'INSERT INTO cupons (codigo, tipo, valor, validade) VALUES ($1, $2, $3, $4)',
            [codigo.toUpperCase(), tipo, valor, validade || null]
        );
        res.json({ message: 'Cupom criado com sucesso!' });
    } catch (error) {
        console.error(error);
        // Postgres error code for unique constraint violation is 23505
        if (error.code === '23505') return res.status(400).json({ error: 'Este código de cupom já existe' });
        res.status(500).json({ error: 'Erro ao criar cupom' });
    }
});

router.delete('/admin/cupons/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM cupons WHERE id = $1', [req.params.id]);
        res.json({ message: 'Cupom excluído!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao excluir cupom' });
    }
});

router.post('/cupons/validar', async (req, res) => {
    const { codigo } = req.body;
    try {
        const { rows } = await db.query(
            'SELECT * FROM cupons WHERE codigo = $1 AND ativo = TRUE AND (validade IS NULL OR validade > NOW())',
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

// --- ROTAS DE CONFIGURAÇÕES E MÉTRICAS ---
router.get('/configuracoes', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM configuracoes');
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

router.put('/configuracoes', async (req, res) => {
    const settings = req.body;
    try {
        const queries = Object.keys(settings).map(chave => {
            return db.query('UPDATE configuracoes SET valor = $1 WHERE chave = $2', [settings[chave], chave]);
        });
        await Promise.all(queries);
        res.json({ message: 'Configurações atualizadas com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar configurações' });
    }
});

router.get('/admin/metrics', async (req, res) => {
    try {
        const { rows: generalStats } = await db.query(`
            SELECT 
                COUNT(*) as total_pedidos,
                SUM(valor_total) as faturamento_total,
                AVG(valor_total) as ticket_medio
            FROM pedidos 
            WHERE status != 'cancelado'
        `);

        // Postgres date formatting is different
        const { rows: monthlyRevenue } = await db.query(`
            SELECT 
                TO_CHAR(data_pedido, 'Month') as month,
                SUM(valor_total) as revenue
            FROM pedidos
            WHERE status != 'cancelado' 
              AND data_pedido >= NOW() - INTERVAL '6 months'
            GROUP BY TO_CHAR(data_pedido, 'Month'), TO_CHAR(data_pedido, 'YYYY-MM')
            ORDER BY TO_CHAR(data_pedido, 'YYYY-MM') ASC
        `);

        const { rows: categorySales } = await db.query(`
            SELECT 
                c.nome as name,
                COUNT(i.id) as value
            FROM itens_pedido i
            JOIN produtos p ON i.produto_id = p.id
            JOIN categorias c ON p.categoria_id = c.id
            JOIN pedidos ped ON i.pedido_id = ped.id
            WHERE ped.status != 'cancelado'
            GROUP BY c.id, c.nome
            ORDER BY value DESC
            LIMIT 5
        `);

        const { rows: recentOrders } = await db.query(`
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

app.use('/api', router);

// Export for serverless
module.exports = app;
module.exports.handler = serverless(app);

// Local dev support
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
}
