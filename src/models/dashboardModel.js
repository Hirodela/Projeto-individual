var database = require("../database/config");

function buscarKpis() {
    var instrucaoSql = `
        SELECT 
            (SELECT COUNT(*) FROM post WHERE categoria NOT LIKE 'História:%') AS totalPosts,
            (SELECT COUNT(*) FROM curtida c JOIN post p ON p.id = c.fk_post WHERE p.categoria NOT LIKE 'História:%') AS totalCurtidas,
            (SELECT COUNT(*) FROM comentario cm JOIN post p ON p.id = cm.fk_post WHERE p.categoria NOT LIKE 'História:%') AS totalComentarios,
            (SELECT categoria FROM post WHERE categoria NOT LIKE 'História:%' GROUP BY categoria ORDER BY COUNT(*) DESC LIMIT 1) AS categoriaFavorita;
    `;
    console.log("Executando a instrução SQL de KPIs: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarPostsPorCategoria() {
    var instrucaoSql = `
        SELECT categoria, COUNT(*) AS quantidade
        FROM post
        WHERE categoria NOT LIKE 'História:%'
        GROUP BY categoria
        ORDER BY quantidade DESC;
    `;
    return database.executar(instrucaoSql);
}

function buscarTopPostsEngajamento() {
    var instrucaoSql = `
        SELECT 
            p.categoria,
            COUNT(DISTINCT c.id) AS curtidas,
            COUNT(DISTINCT cm.id) AS comentarios
        FROM post p
        LEFT JOIN curtida c ON c.fk_post = p.id
        LEFT JOIN comentario cm ON cm.fk_post = p.id
        WHERE p.categoria NOT LIKE 'História:%'
        GROUP BY p.categoria
        ORDER BY (COUNT(DISTINCT c.id) + COUNT(DISTINCT cm.id)) DESC;
    `;
    return database.executar(instrucaoSql);
}

function buscarPostMaisAmado() {
    var instrucaoSql = `
        SELECT 
            p.id,
            p.titulo,
            p.categoria,
            p.foto,
            DATE_FORMAT(p.data_lembranca, '%d/%m/%Y') AS dataFormatada,
            u.nome AS autor,
            COUNT(DISTINCT c.id) AS totalCurtidas,
            COUNT(DISTINCT cm.id) AS totalComentarios
        FROM post p
        JOIN usuario u ON u.id = p.fk_usuario
        LEFT JOIN curtida c ON c.fk_post = p.id
        LEFT JOIN comentario cm ON cm.fk_post = p.id
        WHERE p.categoria NOT LIKE 'História:%'
        GROUP BY p.id, p.titulo, p.categoria, p.foto, p.data_lembranca, u.nome
        ORDER BY (COUNT(DISTINCT c.id) + COUNT(DISTINCT cm.id)) DESC, p.id DESC
        LIMIT 1;
    `;
    return database.executar(instrucaoSql);
}

module.exports = {
    buscarKpis,
    buscarPostsPorCategoria,
    buscarTopPostsEngajamento,
    buscarPostMaisAmado
};
