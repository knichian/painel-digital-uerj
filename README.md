# Painel Digital UERJ - Projeto EcoArduino

Sistema de gerenciamento de conteúdo para sinalização digital (Digital Signage) desenvolvido para o hall de entrada da UERJ.

## Estrutura do Projeto

Este repositório contém 3 módulos:
1.  **/server**: Backend (API REST em Node.js + PostgreSQL).
2.  **/client**: Frontend (Painel Administrativo em React/Vite).
3.  **/raspberry-pi-client**: Arquivo cliente para o monitor (Raspberry Pi).

---

## Guia de Instalação (Para a Equipe de TI)

### 1. Backend (API)
Requisitos: Node.js v18+, PostgreSQL.

1.  Acesse a pasta `server`.
2.  Instale as dependências: `npm install`.
3.  Crie um arquivo `.env` baseando-se no `.env.example` fornecido.
4.  Preencha o `.env` com as credenciais do banco de produção.
5.  Execute as migrações do banco de dados: `npm run db:migrate`.
6.  Inicie o servidor: `npm start`.

*Nota: A pasta `server/public/uploads` precisa de permissão de escrita para salvar as mídias.*

### 2. Frontend (Admin)
Requisitos: Servidor Web Estático (Nginx/Apache).

1.  Acesse a pasta `client`.
2.  Instale as dependências: `npm install`.
3.  Gere o build de produção: `npm run build`.
4.  Os arquivos estáticos estarão na pasta `client/dist`. Configure o servidor web para servir esta pasta.

### 3. Monitor (Raspberry Pi)
Este passo é realizado fisicamente no hardware.

1.  O arquivo `raspberry-pi-client/display.html` deve ser copiado para o Raspberry Pi.
2.  **Importante:** Editar a linha `const SERVER_BASE_URL` dentro do HTML para apontar para o domínio final da API (HTTPS).

---

**Contato do Desenvolvedor:**
Alice Barbosa - alice.barbosa@grad.iprj.uerj.br
