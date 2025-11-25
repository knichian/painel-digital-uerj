// server/config/db.js

// Linha 1: 'require('dotenv').config()'
// Isso diz ao Node.js: "Antes de mais nada, leia o arquivo .env e carregue
// todas as variáveis que estão lá para a memória do sistema".
require('dotenv').config();

// Linha 2: 'const { Pool } = require('pg');'
// Aqui, importamos a ferramenta 'Pool' da biblioteca 'pg' que instalamos.
// Um "Pool" (piscina) de conexões é mais eficiente do que criar uma nova
// conexão toda vez que precisamos falar com o banco.
const { Pool } = require('pg');

// Linha 3: 'const pool = new Pool({...});'
// Criamos uma instância do Pool. A única configuração que passamos é a
// 'connectionString'. O valor 'process.env.DATABASE_URL' pega a variável
// que definimos no nosso arquivo .env. É aqui que a mágica acontece!
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Linha 4: 'module.exports = {...};'
// Finalmente, exportamos um objeto. Qualquer outro arquivo do nosso projeto
// que precisar executar um comando no banco de dados, vai importar este
// arquivo e usar o método 'query' que estamos disponibilizando.
module.exports = {
  query: (text, params) => pool.query(text, params),
};