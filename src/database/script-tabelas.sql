-- ============================================================================
-- PROJETO INDIVIDUAL: MINHA MEDI SINA ♡ (Dedicado à Giovana)
-- Script de Modelagem e Dados Iniciais (MySQL Workbench)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS minha_medi_sina;
USE minha_medi_sina;

-- 1. Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(80) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    senha VARCHAR(100) NOT NULL,
    dt_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Posts / Lembranças
CREATE TABLE IF NOT EXISTS post (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fk_usuario INT NOT NULL,
    titulo VARCHAR(120) NOT NULL,
    descricao TEXT NOT NULL,
    data_lembranca DATE NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    privado TINYINT(1) DEFAULT 0,
    foto LONGTEXT NULL,
    dt_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_post_usuario FOREIGN KEY (fk_usuario) REFERENCES usuario(id) ON DELETE CASCADE
);

-- 3. Tabela Associativa de Curtidas (Relacionamento N:N entre Usuário e Post)
CREATE TABLE IF NOT EXISTS curtida (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fk_usuario INT NOT NULL,
    fk_post INT NOT NULL,
    dt_curtida DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_curtida_usuario FOREIGN KEY (fk_usuario) REFERENCES usuario(id) ON DELETE CASCADE,
    CONSTRAINT fk_curtida_post FOREIGN KEY (fk_post) REFERENCES post(id) ON DELETE CASCADE,
    UNIQUE KEY uk_usuario_post_curtida (fk_usuario, fk_post)
);

-- 4. Tabela de Comentários nos Posts
CREATE TABLE IF NOT EXISTS comentario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fk_usuario INT NOT NULL,
    fk_post INT NOT NULL,
    texto VARCHAR(500) NOT NULL,
    dt_comentario DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comentario_usuario FOREIGN KEY (fk_usuario) REFERENCES usuario(id) ON DELETE CASCADE,
    CONSTRAINT fk_comentario_post FOREIGN KEY (fk_post) REFERENCES post(id) ON DELETE CASCADE
);

-- ============================================================================
-- INSERÇÃO DE DADOS INICIAIS (SEED) PARA DEMONSTRAÇÃO IMEDIATA
-- ============================================================================

INSERT IGNORE INTO usuario (id, nome, email, senha) VALUES
(1, 'Giovana ♡', 'giovana@amor.com', '123456'),
(2, 'Seu Amor', 'amor@medisina.com', '123456');

INSERT IGNORE INTO post (id, fk_usuario, titulo, descricao, data_lembranca, categoria, privado, foto) VALUES
(1, 2, 'Um pôr do sol ao lado da Giovana', 'O céu mudou de cor naquele fim de tarde e eu só conseguia pensar na sorte que tenho de dividir a vida com você. Cada segundo ao seu lado vira meu lugar favorito no mundo.', '2026-02-14', 'Fotografias', 0, NULL),
(2, 1, 'Nosso café, risadas e conversas sem hora para acabar', 'Não precisamos de roteiros mirabolantes. Uma mesa de canto, dois cafés quentinhos e o seu sorriso já transformam qualquer dia comum na minha memória preferida.', '2026-04-18', 'Momentos engraçados', 0, NULL),
(3, 2, 'Para você ler sempre que sentir saudade', 'Giovana, você é a minha Medi Sina: a dose diária de paz, alegria e carinho que deixa tudo mais leve. Que este cantinho guarde para sempre tudo o que construímos juntos.', '2026-06-12', 'Mensagens', 0, NULL),
(4, 2, 'O dia em que nossa história ganhou um novo capítulo', 'Uma data marcada no calendário e no coração. Desde o primeiro olhar até cada plano de futuro, tudo faz mais sentido porque é com você.', '2026-08-25', 'Datas especiais', 0, NULL);

INSERT IGNORE INTO curtida (id, fk_usuario, fk_post) VALUES
(1, 1, 1),
(2, 2, 1),
(3, 1, 2),
(4, 2, 3),
(5, 1, 3),
(6, 1, 4);

INSERT IGNORE INTO comentario (id, fk_usuario, fk_post, texto) VALUES
(1, 1, 1, 'Esse dia foi mágico! Quero repetir mil vezes com você ♡'),
(2, 2, 2, 'A melhor companhia do universo inteiro! Te amo, Gi!'),
(3, 1, 3, 'Você sempre sabe como fazer meu coração sorrir. Minha melhor escolha!');
