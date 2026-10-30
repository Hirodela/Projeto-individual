var database = require("../database/config");

function buscarKpis() {
    var instrucaoSql = `
        SELECT 
            (SELECT COUNT(*) FROM post) AS totalPosts,
            (SELECT COUNT(*) FROM curtida) AS totalCurtidas,
            (SELECT COUNT(*) FROM comentario) AS totalComentarios,
            (SELECT categoria FROM post GROUP BY categoria ORDER BY COUNT(*) DESC LIMIT 1) AS categoriaFavorita;
    `;
    console.log("Executando a instrução SQL de KPIs: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarPostsPorCategoria() {
    var instrucaoSql = `
        SELECT categoria, COUNT(*) AS quantidade
        FROM post
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
        GROUP BY p.categoria
        ORDER BY (COUNT(DISTINCT c.id) + COUNT(DISTINCT cm.id)) DESC;
    `;
    return database.executar(instrucaoSql);
}

module.exports = {
    buscarKpis,
    buscarPostsPorCategoria,
    buscarTopPostsEngajamento
};
