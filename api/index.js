// Função serverless para Vercel
// Este arquivo adapta o servidor Express para funcionar no Vercel

import backend from '../server/index.cjs';

export default backend.app;
