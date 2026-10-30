var mysql = require("mysql2");

var configuracao = {
    host: process.env.DB_HOST || "127.0.0.1",
    database: process.env.DB_DATABASE || "minha_medi_sina",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    port: Number(process.env.DB_PORT) || 3306
};

function executar(instrucao) {
    var ambiente = process.env.AMBIENTE_PROCESSO;

    if (ambiente !== "producao" && ambiente !== "desenvolvimento") {
        return Promise.reject(new Error("Defina AMBIENTE_PROCESSO no arquivo .env.dev."));
    }

    return new Promise(function (resolve, reject) {
        var conexao = mysql.createConnection(configuracao);

        conexao.connect(function (erroConexao) {
            if (erroConexao) {
                return reject(erroConexao);
            }

            conexao.query(instrucao, function (erro, resultados) {
                conexao.end();

                if (erro) {
                    return reject(erro);
                }

                resolve(resultados);
            });
        });
    });
}

module.exports = { executar: executar };
