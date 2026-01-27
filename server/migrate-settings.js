const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
    });

    try {
        console.log('Creating configurations table...');
        await connection.query(`
      CREATE TABLE IF NOT EXISTS configuracoes (
        chave VARCHAR(100) PRIMARY KEY,
        valor TEXT,
        tipo VARCHAR(50) DEFAULT 'texto',
        descricao VARCHAR(255)
      )
    `);

        const initialSettings = [
            ['header_top_bar', 'Frete Grátis para compras acima de R$ 299', 'texto', 'Texto da barra superior do cabeçalho'],
            ['contact_email', 'contato@myhair.com.br', 'texto', 'E-mail de contato'],
            ['contact_phone', '(11) 99999-9999', 'texto', 'Telefone de contato'],
            ['contact_address', 'São Paulo, SP - Brasil', 'texto', 'Endereço físico'],
            ['social_instagram', '#', 'url', 'Link do Instagram'],
            ['social_facebook', '#', 'url', 'Link do Facebook'],
            ['social_youtube', '#', 'url', 'Link do Youtube'],
            ['footer_about_text', 'Sua perfumaria online com as melhores marcas profissionais de beleza. Cabelos, skincare, maquiagem e perfumes com qualidade garantida.', 'longtext', 'Texto "Sobre Nós" no rodapé'],
            ['company_cnpj', '00.000.000/0001-00', 'texto', 'CNPJ da empresa']
        ];

        console.log('Inserting initial settings...');
        for (const [chave, valor, tipo, descricao] of initialSettings) {
            await connection.query(
                'INSERT IGNORE INTO configuracoes (chave, valor, tipo, descricao) VALUES (?, ?, ?, ?)',
                [chave, valor, tipo, descricao]
            );
        }

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await connection.end();
    }
}

migrate();
