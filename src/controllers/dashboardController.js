var dashboardModel = require("../models/dashboardModel");

function obterMetricas(req, res) {
    Promise.all([
        dashboardModel.buscarKpis(),
        dashboardModel.buscarPostsPorCategoria(),
        dashboardModel.buscarTopPostsEngajamento(),
        dashboardModel.buscarPostMaisAmado()
    ])
        .then(function (resultados) {
            var kpis = resultados[0][0] || {
                totalPosts: 0,
                totalCurtidas: 0,
                totalComentarios: 0,
                categoriaFavorita: "Fotografias"
            };
            var porCategoria = resultados[1] || [];
            var topPosts = resultados[2] || [];
            var postMaisAmado = (resultados[3] && resultados[3][0]) ? resultados[3][0] : null;

            res.status(200).json({
                kpis: kpis,
                porCategoria: porCategoria,
                topPosts: topPosts,
                postMaisAmado: postMaisAmado
            });
        })
        .catch(function (erro) {
            console.log(erro);
            res.status(500).json({ erro: erro.sqlMessage || "Erro ao buscar métricas da dashboard." });
        });
}

module.exports = {
    obterMetricas
};
