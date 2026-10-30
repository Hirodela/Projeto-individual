var dashboardModel = require("../models/dashboardModel");

function obterMetricas(req, res) {
    Promise.all([
        dashboardModel.buscarKpis(),
        dashboardModel.buscarPostsPorCategoria(),
        dashboardModel.buscarTopPostsEngajamento()
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

            res.status(200).json({
                kpis: kpis,
                porCategoria: porCategoria,
                topPosts: topPosts
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
