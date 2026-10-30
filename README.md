# Minha Medi Sina

Projeto individual com Node.js, Express, MySQL e páginas HTML/CSS/JavaScript.

## O que o projeto tem

- Cadastro e login de usuários.
- Publicações de lembranças com título, descrição, data, categoria e privacidade.
- Upload de fotos usando Multer.
- Curtidas, comentários e dashboard.

## Como executar

1. Instale o Node.js e o MySQL.
2. Abra `src/database/script-tabelas.sql` no MySQL Workbench e execute o script.
3. Abra `.env.dev` e preencha `DB_PASSWORD` com a senha do seu MySQL.
4. No terminal, dentro da pasta do projeto, execute:

   ```bash
   npm install
   npm start
   ```

5. Acesse `http://localhost:3333`.

## Upload de fotos

As imagens são enviadas pelo formulário e salvas em `public/uploads/`. No banco fica salvo apenas o caminho da imagem, por exemplo `/uploads/1720000000000-123456.png`.

São aceitas imagens JPG, PNG e WEBP de até 5 MB.

## Conta de demonstração

O script SQL cria contas e publicações de exemplo. Para segurança, altere as senhas de demonstração antes de usar o projeto fora do ambiente local.
