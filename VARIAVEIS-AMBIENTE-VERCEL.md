# Variáveis de Ambiente Necessárias

Para que o deploy na Vercel funcione corretamente, você deve configurar as seguintes variáveis de ambiente no painel da Vercel (Configurações > Environment Variables).

## Banco de Dados (Supabase/Postgres)

- **`DATABASE_URL`**: A string de conexão completa com o seu banco de dados Supabase.
    - *Formato*: `postgres://usuario:senha@host:porta/database`
    - *Nota*: Certifique-se de usar a porta correta (usualmente 6543 ou 5432) e o modo de pool se aplicável (embora conexão direta funcione para baixo tráfego).

## Upload de Imagens (Cloudinary)

Como a Vercel não permite salvar arquivos no disco local, usamos o Cloudinary.

- **`CLOUDINARY_CLOUD_NAME`**: O "Cloud Name" da sua conta Cloudinary.
- **`CLOUDINARY_API_KEY`**: A "API Key" do dashboard do Cloudinary.
- **`CLOUDINARY_API_SECRET`**: O "API Secret" do dashboard do Cloudinary.

## Outros (Opcionais)

- **`NODE_ENV`**: Geralmente definido automaticamente pela Vercel como `production`, mas pode ser forçado se necessário.
