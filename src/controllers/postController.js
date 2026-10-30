var postModel = require("../models/postModel");

function listarTodos(req, res) {
    var idUsuarioLogado = req.query.idUsuario || 0;
    postModel.listarTodos(idUsuarioLogado)
        .then(function (resultado) {
            res.status(200).json(resultado);
        })
        .catch(function (erro) {
            console.log(erro);
            res.status(500).json({ erro: erro.sqlMessage || "Erro ao listar os posts." });
        });
}

function listarPorUsuario(req, res) {
    var idUsuario = req.params.idUsuario;
    postModel.listarPorUsuario(idUsuario)
        .then(function (resultado) {
            res.status(200).json(resultado);
        })
        .catch(function (erro) {
            console.log(erro);
            res.status(500).json({ erro: erro.sqlMessage || "Erro ao listar suas lembranças." });
        });
}

function buscarPorId(req, res) {
    var idPost = req.params.idPost;
    var idUsuarioLogado = req.query.idUsuario || 0;

    postModel.buscarPorId(idPost, idUsuarioLogado)
        .then(function (resultado) {
            if (resultado.length > 0) {
                res.status(200).json(resultado[0]);
            } else {
                res.status(404).json({ erro: "Post não encontrado!" });
            }
        })
        .catch(function (erro) {
            console.log(erro);
            res.status(500).json({ erro: erro.sqlMessage || "Erro ao buscar detalhes do post." });
        });
}

function publicar(req, res) {
    var idUsuario = req.body.idUsuario;
    var titulo = req.body.titulo;
    var descricao = req.body.descricao;
    var data = req.body.data;
    var categoria = req.body.categoria || "Fotografias";
    var privado = req.body.privado ? 1 : 0;
    var foto = req.body.foto || null;

    if (!idUsuario) {
        res.status(400).json({ erro: "Usuário não identificado! Faça login novamente." });
    } else if (!titulo || !descricao || !data) {
        res.status(400).json({ erro: "Preencha título, descrição e data do post!" });
    } else {
        postModel.publicar(idUsuario, titulo.trim(), descricao.trim(), data, categoria, privado, foto)
            .then(function (resultado) {
                res.status(201).json({
                    mensagem: "Post publicado com sucesso!",
                    id: resultado.insertId
                });
            })
            .catch(function (erro) {
                console.log(erro);
                res.status(500).json({ erro: erro.sqlMessage || "Erro ao salvar o post." });
            });
    }
}

function editar(req, res) {
    var idPost = req.params.idPost;
    var idUsuario = req.body.idUsuario;
    var titulo = req.body.titulo;
    var descricao = req.body.descricao;
    var data = req.body.data;
    var categoria = req.body.categoria || "Fotografias";
    var privado = req.body.privado ? 1 : 0;
    var foto = req.body.foto || null;

    if (!idPost || !idUsuario || !titulo || !descricao || !data) {
        res.status(400).json({ erro: "Preencha todos os campos obrigatórios para editar!" });
    } else {
        postModel.editar(idPost, idUsuario, titulo.trim(), descricao.trim(), data, categoria, privado, foto)
            .then(function (resultado) {
                res.status(200).json({ mensagem: "Post atualizado com sucesso!", resultado: resultado });
            })
            .catch(function (erro) {
                console.log(erro);
                res.status(500).json({ erro: erro.sqlMessage || "Erro ao atualizar post." });
            });
    }
}

function deletar(req, res) {
    var idPost = req.params.idPost;
    var idUsuario = req.query.idUsuario || req.body.idUsuario;

    postModel.deletar(idPost, idUsuario)
        .then(function (resultado) {
            res.status(200).json({ mensagem: "Post excluído com sucesso!", resultado: resultado });
        })
        .catch(function (erro) {
            console.log(erro);
            res.status(500).json({ erro: erro.sqlMessage || "Erro ao excluir o post." });
        });
}


function alternarCurtida(req, res) {
    var idPost = req.params.idPost;
    var idUsuario = req.body.idUsuario;

    if (!idPost || !idUsuario) {
        return res.status(400).json({ erro: "Entre na sua conta para curtir os posts!" });
    }

    postModel.verificarCurtida(idPost, idUsuario)
        .then(function (jaCurtiu) {
            if (jaCurtiu.length > 0) {
                return postModel.removerCurtida(idPost, idUsuario).then(function () {
                    return false;
                });
            } else {
                return postModel.adicionarCurtida(idPost, idUsuario).then(function () {
                    return true;
                });
            }
        })
        .then(function (estadoCurtida) {
            return postModel.contarCurtidasPost(idPost).then(function (contagem) {
                res.status(200).json({
                    curtiu: estadoCurtida,
                    totalCurtidas: contagem[0].total
                });
            });
        })
        .catch(function (erro) {
            console.log(erro);
            res.status(500).json({ erro: erro.sqlMessage || "Erro ao processar curtida." });
        });
}


function listarComentarios(req, res) {
    var idPost = req.params.idPost;
    postModel.listarComentarios(idPost)
        .then(function (resultado) {
            res.status(200).json(resultado);
        })
        .catch(function (erro) {
            console.log(erro);
            res.status(500).json({ erro: erro.sqlMessage || "Erro ao buscar comentários." });
        });
}

function comentar(req, res) {
    var idPost = req.params.idPost;
    var idUsuario = req.body.idUsuario;
    var texto = req.body.texto;

    if (!idUsuario) {
        res.status(400).json({ erro: "Entre na sua conta para comentar!" });
    } else if (!texto || texto.trim().length === 0) {
        res.status(400).json({ erro: "Escreva um comentário antes de enviar!" });
    } else {
        postModel.adicionarComentario(idPost, idUsuario, texto.trim())
            .then(function (resultado) {
                res.status(201).json({
                    mensagem: "Comentário publicado com carinho!",
                    id: resultado.insertId
                });
            })
            .catch(function (erro) {
                console.log(erro);
                res.status(500).json({ erro: erro.sqlMessage || "Erro ao publicar comentário." });
            });
    }
}

function deletarComentario(req, res) {
    var idComentario = req.params.idComentario;
    var idUsuario = req.query.idUsuario || req.body.idUsuario;

    postModel.removerComentario(idComentario, idUsuario)
        .then(function () {
            res.status(200).json({ mensagem: "Comentário removido!" });
        })
        .catch(function (erro) {
            console.log(erro);
            res.status(500).json({ erro: erro.sqlMessage || "Erro ao remover comentário." });
        });
}

module.exports = {
    listarTodos,
    listarPorUsuario,
    buscarPorId,
    publicar,
    editar,
    deletar,
    alternarCurtida,
    listarComentarios,
    comentar,
    deletarComentario
};
