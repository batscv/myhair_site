// Função serverless para Vercel
// Este arquivo adapta o servidor Express para funcionar no Vercel

const { app } = require('../server/index.cjs');

module.exports = app;
