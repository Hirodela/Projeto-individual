var mysql = require("mysql2");

var mySqlConfig = {
    host: process.env.DB_HOST || "127.0.0.1",
    database: process.env.DB_DATABASE || "minha_medi_sina",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "Dani2603!",
    port: process.env.DB_PORT || 3306
};

function executar(instrucao) {
    if (process.env.AMBIENTE_PROCESSO !== "producao" && process.env.AMBIENTE_PROCESSO !== "desenvolvimento") {
        console.log("\nO AMBIENTE (produção ou desenvolvimento) NÃO FOI DEFINIDO EM .env OU .env.dev!\n");
        return Promise.reject("AMBIENTE NÃO CONFIGURADO EM .env");
    }

    return new Promise(function (resolve, reject) {
        var conexao = mysql.createConnection(mySqlConfig);
        conexao.connect();
        conexao.query(instrucao, function (erro, resultados) {
            conexao.end();
            if (erro) {
                reject(erro);
            }
            console.log(resultados);
            resolve(resultados);
        });
        conexao.on("error", function (erro) {
            return ("ERRO NO MySQL Server: ", erro.sqlMessage);
        });
    });
}

module.exports = {
    executar
};
