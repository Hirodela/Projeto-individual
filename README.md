# 💖 Minha Medi Sina (Dedicado à Giovana)

Projeto individual desenvolvido no padrão **Web-Data-Viz** (Node.js + Express + MySQL + Chart.js).
Uma rede social afetiva e diário de memórias para **criar posts**, **curtir (❤️)**, **comentar (💬)** e acompanhar métricas em uma **Dashboard analítica**.

## 🚀 Como Executar o Projeto

1. **Banco de Dados (MySQL Workbench):**
   - Abra e execute todo o conteúdo do ficheiro `database/schema.sql` (ou `src/database/script-tabelas.sql`).
   - Ele cria o banco `minha_medi_sina`, as 4 tabelas (`usuario`, `post`, `curtida`, `comentario`) e já insere posts iniciais para teste imediato.

2. **Configurar Senha do MySQL:**
   - Edite o ficheiro `.env.dev` na raiz do projeto e coloque a sua senha do MySQL em `DB_PASSWORD=''`.

3. **Instalar e Rodar:**
   ```bash
   npm install
   npm start
   ```
   Acesse no navegador: **http://localhost:3333**

### Conta pronta para teste rápido:
- **E-mail:** `giovana@amor.com`
- **Senha:** `123456`
