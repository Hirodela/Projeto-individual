var ambiente_processo = 'desenvolvimento';

var caminho_env = ambiente_processo === 'producao' ? '.env' : '.env.dev';

require("dotenv").config({ path: caminho_env });

var express = require("express");
var cors = require("cors");
var path = require("path");
var PORTA_APP = process.env.APP_PORT || 3333;
var HOST_APP = process.env.APP_HOST || "localhost";

var app = express();

var indexRouter = require("./src/routes/index");
var usuarioRouter = require("./src/routes/usuarios");
var postsRouter = require("./src/routes/posts");
var dashboardRouter = require("./src/routes/dashboard");

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.use(cors());

app.use(function (req, res, next) {
    if (req.method !== "GET") {
        console.log(`[LOG] ${req.method} ${req.url}`);
    }
    next();
});

app.use("/", indexRouter);
app.use("/usuarios", usuarioRouter);
app.use("/posts", postsRouter);
app.use("/dashboard", dashboardRouter);

app.use(function (req, res) {
    res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

app.listen(PORTA_APP, function () {
    console.log(`
    ##   ##  ######   #####             ####       ##     ######     ##              ##  ##    ####    ######  
    ##   ##  ##       ##  ##            ## ##     ####      ##      ####             ##  ##     ##         ##  
    ##   ##  ##       ##  ##            ##  ##   ##  ##     ##     ##  ##            ##  ##     ##        ##   
    ## # ##  ####     #####    ######   ##  ##   ######     ##     ######   ######   ##  ##     ##       ##    
    #######  ##       ##  ##            ##  ##   ##  ##     ##     ##  ##            ##  ##     ##      ##     
    ### ###  ##       ##  ##            ## ##    ##  ##     ##     ##  ##             ####      ##     ##      
    ##   ##  ######   #####             ####     ##  ##     ##     ##  ##              ##      ####    ######  
    \n\n                                                                                                 
    💖 Minha Medi Sina (Especial para a Giovana) já está rodando!
    Acesse o caminho a seguir para visualizar .: http://${HOST_APP}:${PORTA_APP} :. \n
    Você está rodando sua aplicação em ambiente de .:${process.env.AMBIENTE_PROCESSO}:. \n
    \tSe .:desenvolvimento:. você está se conectando ao banco local.
    \tSe .:producao:. você está se conectando ao banco remoto. \n`);
});
