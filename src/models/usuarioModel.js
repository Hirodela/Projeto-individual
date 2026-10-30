var database = require("../database/config");

function autenticar(email, senha) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function autenticar(): ", email, senha);
    var emailSeguro = String(email || "").replace(/'/g, "''");
    var senhaSegura = String(senha || "").replace(/'/g, "''");

    var instrucaoSql = `
        SELECT id, nome, email, DATE_FORMAT(dt_cadastro, '%d/%m/%Y') AS dtCadastro
        FROM usuario
        WHERE email = '${emailSeguro}' AND senha = '${senhaSegura}';
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function cadastrar(nome, email, senha) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> function cadastrar():", nome, email);
    var nomeSeguro = String(nome || "").replace(/'/g, "''");
    var emailSeguro = String(email || "").replace(/'/g, "''");
    var senhaSegura = String(senha || "").replace(/'/g, "''");

    var instrucaoSql = `
        INSERT INTO usuario (nome, email, senha) VALUES ('${nomeSeguro}', '${emailSeguro}', '${senhaSegura}');
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function atualizarPerfil(idUsuario, nome, email) {
    var id = Number(idUsuario) || 0;
    var nomeSeguro = String(nome || "").replace(/'/g, "''");
    var emailSeguro = String(email || "").replace(/'/g, "''");

    var instrucaoSql = `
        UPDATE usuario SET nome = '${nomeSeguro}', email = '${emailSeguro}' WHERE id = ${id};
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    autenticar,
    cadastrar,
    atualizarPerfil
};
