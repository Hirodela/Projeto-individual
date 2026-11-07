var express = require("express");
var router = express.Router();

var usuarioController = require("../controllers/usuarioController");
var upload = require("../config/upload");

router.post("/cadastrar", function (req, res) {
    usuarioController.cadastrar(req, res);
});

router.post("/autenticar", function (req, res) {
    usuarioController.autenticar(req, res);
});

router.put("/perfil/:idUsuario", function (req, res) {
    usuarioController.atualizarPerfil(req, res);
});

router.post("/perfil/:idUsuario/foto", upload.single("foto"), function (req, res) {
    if (!req.file) {
        return res.status(400).json({ erro: "Nenhuma foto enviada." });
    }
    res.status(200).json({
        mensagem: "Foto de perfil atualizada com sucesso!",
        foto: "/uploads/" + req.file.filename
    });
});

module.exports = router;
