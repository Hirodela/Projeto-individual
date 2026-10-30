(function () {
    var modal = document.getElementById("modal-excluir");
    document.querySelectorAll("[data-fechar]").forEach(function (button) {
        button.addEventListener("click", function () {
            if (modal) modal.classList.remove("aberto");
        });
    });
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && modal) {
            modal.classList.remove("aberto");
        }
    });
})();
