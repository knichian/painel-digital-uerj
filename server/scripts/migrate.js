const db = require('../config/db');

async function createTables() {
  try {
    console.log('Iniciando migração...');

    // Tabelas existentes
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'editor',
        created_at TIMESTAMP DEFAULT now()
      );
    `);
    console.log('Tabela "users" verificada/criada.');

    await db.query(`
      CREATE TABLE IF NOT EXISTS media_items (
        id SERIAL PRIMARY KEY,
        uploader_id INTEGER REFERENCES users(id),
        file_path TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT,
        duration_seconds INTEGER DEFAULT 10,
        created_at TIMESTAMP DEFAULT now()
      );
    `);
    console.log('Tabela "media_items" verificada/criada.');

    // --- NOVAS TABELAS ---

    // Tabela de Monitores Físicos
    await db.query(`
      CREATE TABLE IF NOT EXISTS monitors (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        identifier TEXT UNIQUE NOT NULL, -- Ex: "hall-01"
        api_key TEXT, -- Chave para o Pi se autenticar
        created_at TIMESTAMP DEFAULT now()
      );
    `);
    console.log('Tabela "monitors" verificada/criada.');

    // Tabela de Playlists
    await db.query(`
      CREATE TABLE IF NOT EXISTS playlists (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT now()
      );
    `);
    console.log('Tabela "playlists" verificada/criada.');

    // Tabela de Itens da Playlist (conecta playlists e media_items)
    await db.query(`
      CREATE TABLE IF NOT EXISTS playlist_items (
        id SERIAL PRIMARY KEY,
        playlist_id INTEGER REFERENCES playlists(id) ON DELETE CASCADE,
        media_item_id INTEGER REFERENCES media_items(id) ON DELETE CASCADE,
        position INTEGER NOT NULL, -- Ordem (0, 1, 2, 3...)
        duration_seconds INTEGER, -- Opcional: sobrescreve a duração padrão
        created_at TIMESTAMP DEFAULT now()
      );
    `);
    console.log('Tabela "playlist_items" verificada/criada.');

    // Tabela de Associação (qual monitor está tocando qual playlist)
    await db.query(`
      CREATE TABLE IF NOT EXISTS monitor_playlists (
        id SERIAL PRIMARY KEY,
        monitor_id INTEGER REFERENCES monitors(id),
        playlist_id INTEGER REFERENCES playlists(id),
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT now()
      );
    `);
    console.log('Tabela "monitor_playlists" verificada/criada.');

    console.log('Migração concluída com sucesso.');
  } catch (err) {
    console.error('Erro durante a migração:', err);
  }
}

createTables();