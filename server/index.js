// server/index.js

// 1. Importa o framework Express
const express = require('express');
const cors = require('cors'); // Importe o cors
const path = require('path'); // Importe o módulo 'path' do Node

// Importa nossas novas rotas de autenticação
const authRoutes = require('./routes/auth');
const mediaRoutes = require('./routes/media'); // 1. IMPORTE AS NOVAS ROTAS
const playlistRoutes = require('./routes/playlists'); // 1. IMPORTE A ROTA
const monitorRoutes = require('./routes/monitorRoutes'); // 1. IMPORTE A ROTA
const adminRoutes = require('./routes/adminRoutes'); // 1. IMPORTE A ROTA DE ADMIN

// Gabriel: importando .env
require('dotenv').config();

// 2. Cria uma instância do Express
const app = express();

// 3. Define a porta em que o servidor vai rodar
// Gabriel: definindo a porta pelo .env
const PORT = process.env.PORT

// --- Middlewares ---
// Habilita o CORS para permitir requisições do frontend
app.use(cors());
// Habilita o Express para entender requisições com corpo em formato JSON
app.use(express.json());

// Gabriel: criando um Router para adicionar o prefixo do projeto a todas as rodas do backend
projectPrefix = express.Router()
projectPrefixName = 'painel-digital-uerj' // Gabriel: Prefixo do projeto para integração ao Cloudhub

// Gabriel: Prefixo para diferenciar chamadas para o Backend das para o Frontend
backendPrefix = express.Router()
backendPrefixName = 'api'

// 2. NOVO: SERVINDO ARQUIVOS ESTÁTICOS
// Isso torna a pasta 'public' acessível. Se você salvar uma imagem como
// 'public/uploads/imagem.webp', ela estará disponível em http://localhost:3001/uploads/imagem.webp
// Gabriel: modificando servidor estatico para funcionar com prefixo do projeto
// Gabriel: exemplo, o caminho 'public/uploads/image.jpg' mapeia para a rota '/painel-digital-uerj/api/uploads/image.jpg' agora
backendPrefix.use(express.static(path.join(__dirname, 'public')));

// --- Rotas ---

// Diz ao Express para usar nossas rotas de autenticação
// Todas as rotas definidas em 'auth.js' terão o prefixo '/api/auth'
// Gabriel: modificando para usar prefixo do projeto
backendPrefix.get('/', (req, res) => {
    res.json({ message: 'API do Painel UERJ está no ar!' });
});
backendPrefix.use('/auth', authRoutes);
backendPrefix.use('/media', mediaRoutes); // 3. USE AS NOVAS ROTAS
backendPrefix.use('/playlists', playlistRoutes); // 2. USE A NOVA ROTA
backendPrefix.use('/monitors', monitorRoutes); // 2. USE A NOVA ROTA
backendPrefix.use('/admin', adminRoutes); // 2. USE A ROTA DE ADMIN

// Gabriel: integração dos prefixos as rotas
projectPrefix.use(`/${backendPrefixName}`, backendPrefix);
app.use(`/${projectPrefixName}`, projectPrefix);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
