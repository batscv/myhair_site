const { Pool } = require('pg');
require('dotenv').config();

let pool;

if (process.env.DATABASE_URL) {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });
} else {
    console.error("ERRO CRITICO: DATABASE_URL não definida! O servidor iniciará mas falhará em queries.");
}

module.exports = {
    query: (text, params) => {
        if (!pool) {
            console.error("Tentativa de query sem conexão com banco (DATABASE_URL ausente).");
            return Promise.reject(new Error('DATABASE_URL não configurada no ambiente do servidor.'));
        }
        return pool.query(text, params);
    },
    promise: () => this // Mock para manter compatibilidade se algo usar .promise()
};
