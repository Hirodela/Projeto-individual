var usuarioModel = require("../models/usuarioModel");

function autenticar(req, res) {
    var email = req.body.emailServer || req.body.email;
    var senha = req.body.senhaServer || req.body.senha;

    if (!email) {
        res.status(400).json({ erro: "Seu e-mail está indefinido!" });
    } else if (!senha) {
        res.status(400).json({ erro: "Sua senha está indefinida!" });
    } else {
        usuarioModel.autenticar(email, senha)
            .then(function (resultadoAutenticar) {
                if (resultadoAutenticar.length == 1) {
                    res.json({
                        id: resultadoAutenticar[0].id,
                        nome: resultadoAutenticar[0].nome,
                        email: resultadoAutenticar[0].email,
                        dtCadastro: resultadoAutenticar[0].dtCadastro
                    });
                } else if (resultadoAutenticar.length == 0) {
                    res.status(403).json({ erro: "E-mail e/ou senha inválidos!" });
                } else {
                    res.status(403).json({ erro: "Mais de um usuário com o mesmo login e senha!" });
                }
            })
            .catch(function (erro) {
                console.log(erro);
                console.log("\nHouve um erro ao realizar o login! Erro: ", erro.sqlMessage);
                res.status(500).json({ erro: erro.sqlMessage || "Erro ao conectar com o banco MySQL." });
            });
    }
}

function cadastrar(req, res) {
    var nome = req.body.nomeServer || req.body.nome;
    var email = req.body.emailServer || req.body.email;
    var senha = req.body.senhaServer || req.body.senha;

    if (!nome || nome.trim().length < 2) {
        res.status(400).json({ erro: "Informe seu nome (mínimo 2 caracteres)!" });
    } else if (!email || !email.includes("@")) {
        res.status(400).json({ erro: "Informe um e-mail válido!" });
    } else if (!senha || senha.length < 4) {
        res.status(400).json({ erro: "A senha deve ter pelo menos 4 caracteres!" });
    } else {
        usuarioModel.cadastrar(nome.trim(), email.trim().toLowerCase(), senha)
            .then(function (resultado) {
                res.status(201).json({
                    id: resultado.insertId,
                    nome: nome.trim(),
                    email: email.trim().toLowerCase()
                });
            })
            .catch(function (erro) {
                console.log(erro);
                if (erro.code === "ER_DUP_ENTRY") {
                    res.status(409).json({ erro: "Este e-mail já está cadastrado!" });
                } else {
                    res.status(500).json({ erro: erro.sqlMessage || "Erro ao realizar o cadastro." });
                }
            });
    }
}

function atualizarPerfil(req, res) {
    var idUsuario = req.params.idUsuario || req.body.idUsuario;
    var nome = req.body.nome;
    var email = req.body.email;

    if (!idUsuario || !nome || !email) {
        res.status(400).json({ erro: "Preencha nome e e-mail corretamente." });
    } else {
        usuarioModel.atualizarPerfil(idUsuario, nome.trim(), email.trim().toLowerCase())
            .then(function () {
                res.json({
                    id: Number(idUsuario),
                    nome: nome.trim(),
                    email: email.trim().toLowerCase()
                });
            })
            .catch(function (erro) {
                console.log(erro);
                res.status(500).json({ erro: erro.sqlMessage || "Erro ao atualizar perfil." });
            });
    }
}

module.exports = {
    autenticar,
    cadastrar,
    atualizarPerfil
};
