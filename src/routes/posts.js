var express = require("express");
var router = express.Router();

var postController = require("../controllers/postController");

// Listar todos os posts públicos (Feed de Publicações)
router.get("/listar", function (req, res) {
    postController.listarTodos(req, res);
});

// Listar os posts de um usuário específico (Minhas Lembranças)
router.get("/usuario/:idUsuario", function (req, res) {
    postController.listarPorUsuario(req, res);
});

// Buscar detalhes de 1 post específico
router.get("/detalhe/:idPost", function (req, res) {
    postController.buscarPorId(req, res);
});

// Criar um novo post
router.post("/publicar", function (req, res) {
    postController.publicar(req, res);
});

// Editar um post existente
router.put("/editar/:idPost", function (req, res) {
    postController.editar(req, res);
});

// Excluir um post
router.delete("/deletar/:idPost", function (req, res) {
    postController.deletar(req, res);
});

// Curtir / Descurtir um post
router.post("/:idPost/curtir", function (req, res) {
    postController.alternarCurtida(req, res);
});

// Listar comentários de um post
router.get("/:idPost/comentarios", function (req, res) {
    postController.listarComentarios(req, res);
});

// Adicionar comentário em um post
router.post("/:idPost/comentar", function (req, res) {
    postController.comentar(req, res);
});

// Excluir um comentário
router.delete("/comentarios/:idComentario", function (req, res) {
    postController.deletarComentario(req, res);
});

module.exports = router;
