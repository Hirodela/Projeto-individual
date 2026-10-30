var multer = require("multer");
var path = require("path");
var fs = require("fs");

var pastaUploads = path.join(__dirname, "../../public/uploads");

if (!fs.existsSync(pastaUploads)) {
    fs.mkdirSync(pastaUploads, { recursive: true });
}

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, pastaUploads);
    },
    filename: function (req, file, cb) {
        var extensao = path.extname(file.originalname).toLowerCase();
        cb(null, Date.now() + "-" + Math.round(Math.random() * 1E9) + extensao);
    }
});

function filtrarImagem(req, file, cb) {
    var tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];
    if (tiposPermitidos.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Envie uma imagem JPG, PNG ou WEBP."));
    }
}

module.exports = multer({
    storage: storage,
    fileFilter: filtrarImagem,
    limits: { fileSize: 5 * 1024 * 1024 }
});
