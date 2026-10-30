var database = require("../database/config");

function listarTodos(idUsuarioLogado) {
    var idUser = Number(idUsuarioLogado) || 0;
    var instrucaoSql = `
        SELECT 
            p.id,
            p.fk_usuario AS usuarioId,
            p.titulo,
            p.descricao,
            DATE_FORMAT(p.data_lembranca, '%Y-%m-%d') AS data,
            DATE_FORMAT(p.data_lembranca, '%d/%m/%Y') AS dataFormatada,
            p.categoria,
            p.privado,
            p.foto,
            u.nome AS autor,
            (SELECT COUNT(*) FROM curtida c WHERE c.fk_post = p.id) AS totalCurtidas,
            (SELECT COUNT(*) FROM comentario cm WHERE cm.fk_post = p.id) AS totalComentarios,
            (SELECT COUNT(*) FROM curtida c2 WHERE c2.fk_post = p.id AND c2.fk_usuario = ${idUser}) AS curtiu
        FROM post p
        INNER JOIN usuario u ON p.fk_usuario = u.id
        WHERE p.privado = 0
        ORDER BY p.data_lembranca DESC, p.id DESC;
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function listarPorUsuario(idUsuario) {
    var idUser = Number(idUsuario) || 0;
    var instrucaoSql = `
        SELECT 
            p.id,
            p.fk_usuario AS usuarioId,
            p.titulo,
            p.descricao,
            DATE_FORMAT(p.data_lembranca, '%Y-%m-%d') AS data,
            DATE_FORMAT(p.data_lembranca, '%d/%m/%Y') AS dataFormatada,
            p.categoria,
            p.privado,
            p.foto,
            u.nome AS autor,
            (SELECT COUNT(*) FROM curtida c WHERE c.fk_post = p.id) AS totalCurtidas,
            (SELECT COUNT(*) FROM comentario cm WHERE cm.fk_post = p.id) AS totalComentarios,
            (SELECT COUNT(*) FROM curtida c2 WHERE c2.fk_post = p.id AND c2.fk_usuario = ${idUser}) AS curtiu
        FROM post p
        INNER JOIN usuario u ON p.fk_usuario = u.id
        WHERE p.fk_usuario = ${idUser}
        ORDER BY p.data_lembranca DESC, p.id DESC;
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarPorId(idPost, idUsuarioLogado) {
    var id = Number(idPost) || 0;
    var idUser = Number(idUsuarioLogado) || 0;
    var instrucaoSql = `
        SELECT 
            p.id,
            p.fk_usuario AS usuarioId,
            p.titulo,
            p.descricao,
            DATE_FORMAT(p.data_lembranca, '%Y-%m-%d') AS data,
            DATE_FORMAT(p.data_lembranca, '%d/%m/%Y') AS dataFormatada,
            p.categoria,
            p.privado,
            p.foto,
            u.nome AS autor,
            (SELECT COUNT(*) FROM curtida c WHERE c.fk_post = p.id) AS totalCurtidas,
            (SELECT COUNT(*) FROM comentario cm WHERE cm.fk_post = p.id) AS totalComentarios,
            (SELECT COUNT(*) FROM curtida c2 WHERE c2.fk_post = p.id AND c2.fk_usuario = ${idUser}) AS curtiu
        FROM post p
        INNER JOIN usuario u ON p.fk_usuario = u.id
        WHERE p.id = ${id};
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function publicar(idUsuario, titulo, descricao, data, categoria, privado, foto) {
    var idUser = Number(idUsuario) || 0;
    var tituloSeg = String(titulo || "").replace(/'/g, "''");
    var descSeg = String(descricao || "").replace(/'/g, "''");
    var dataSeg = String(data || "").replace(/'/g, "''");
    var catSeg = String(categoria || "Fotografias").replace(/'/g, "''");
    var privNum = privado ? 1 : 0;
    var fotoSql = foto ? `'${String(foto).replace(/'/g, "''")}'` : "NULL";

    var instrucaoSql = `
        INSERT INTO post (fk_usuario, titulo, descricao, data_lembranca, categoria, privado, foto)
        VALUES (${idUser}, '${tituloSeg}', '${descSeg}', '${dataSeg}', '${catSeg}', ${privNum}, ${fotoSql});
    `;
    console.log("Executando a instrução SQL de publicação de post.");
    return database.executar(instrucaoSql);
}

function editar(idPost, idUsuario, titulo, descricao, data, categoria, privado, foto) {
    var id = Number(idPost) || 0;
    var idUser = Number(idUsuario) || 0;
    var tituloSeg = String(titulo || "").replace(/'/g, "''");
    var descSeg = String(descricao || "").replace(/'/g, "''");
    var dataSeg = String(data || "").replace(/'/g, "''");
    var catSeg = String(categoria || "Fotografias").replace(/'/g, "''");
    var privNum = privado ? 1 : 0;
    var fotoSql = foto ? `'${String(foto).replace(/'/g, "''")}'` : "NULL";

    var instrucaoSql = `
        UPDATE post
        SET titulo = '${tituloSeg}',
            descricao = '${descSeg}',
            data_lembranca = '${dataSeg}',
            categoria = '${catSeg}',
            privado = ${privNum},
            foto = ${fotoSql}
        WHERE id = ${id} AND fk_usuario = ${idUser};
    `;
    console.log("Executando a instrução SQL de edição de post.");
    return database.executar(instrucaoSql);
}

function deletar(idPost, idUsuario) {
    var id = Number(idPost) || 0;
    var idUser = Number(idUsuario) || 0;
    var instrucaoSql = `
        DELETE FROM post WHERE id = ${id} AND fk_usuario = ${idUser};
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}


function verificarCurtida(idPost, idUsuario) {
    var id = Number(idPost) || 0;
    var idUser = Number(idUsuario) || 0;
    var instrucaoSql = `
        SELECT id FROM curtida WHERE fk_post = ${id} AND fk_usuario = ${idUser};
    `;
    return database.executar(instrucaoSql);
}

function adicionarCurtida(idPost, idUsuario) {
    var id = Number(idPost) || 0;
    var idUser = Number(idUsuario) || 0;
    var instrucaoSql = `
        INSERT INTO curtida (fk_post, fk_usuario) VALUES (${id}, ${idUser});
    `;
    return database.executar(instrucaoSql);
}

function removerCurtida(idPost, idUsuario) {
    var id = Number(idPost) || 0;
    var idUser = Number(idUsuario) || 0;
    var instrucaoSql = `
        DELETE FROM curtida WHERE fk_post = ${id} AND fk_usuario = ${idUser};
    `;
    return database.executar(instrucaoSql);
}

function contarCurtidasPost(idPost) {
    var id = Number(idPost) || 0;
    var instrucaoSql = `
        SELECT COUNT(*) AS total FROM curtida WHERE fk_post = ${id};
    `;
    return database.executar(instrucaoSql);
}


function listarComentarios(idPost) {
    var id = Number(idPost) || 0;
    var instrucaoSql = `
        SELECT 
            cm.id,
            cm.fk_post AS postId,
            cm.fk_usuario AS usuarioId,
            cm.texto,
            DATE_FORMAT(cm.dt_comentario, '%d/%m/%Y às %H:%i') AS dataComentario,
            u.nome AS autor
        FROM comentario cm
        INNER JOIN usuario u ON cm.fk_usuario = u.id
        WHERE cm.fk_post = ${id}
        ORDER BY cm.dt_comentario ASC, cm.id ASC;
    `;
    return database.executar(instrucaoSql);
}

function adicionarComentario(idPost, idUsuario, texto) {
    var id = Number(idPost) || 0;
    var idUser = Number(idUsuario) || 0;
    var textoSeg = String(texto || "").replace(/'/g, "''");
    var instrucaoSql = `
        INSERT INTO comentario (fk_post, fk_usuario, texto)
        VALUES (${id}, ${idUser}, '${textoSeg}');
    `;
    return database.executar(instrucaoSql);
}

function removerComentario(idComentario, idUsuario) {
    var id = Number(idComentario) || 0;
    var idUser = Number(idUsuario) || 0;
    var instrucaoSql = `
        DELETE FROM comentario WHERE id = ${id} AND fk_usuario = ${idUser};
    `;
    return database.executar(instrucaoSql);
}

module.exports = {
    listarTodos,
    listarPorUsuario,
    buscarPorId,
    publicar,
    editar,
    deletar,
    verificarCurtida,
    adicionarCurtida,
    removerCurtida,
    contarCurtidasPost,
    listarComentarios,
    adicionarComentario,
    removerComentario
};
