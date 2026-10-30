function obterUsuarioLogado() {
    var id = sessionStorage.ID_USUARIO;
    var nome = sessionStorage.NOME_USUARIO;
    var email = sessionStorage.EMAIL_USUARIO;

    if (id && nome && email) {
        return {
            id: Number(id),
            nome: nome,
            email: email
        };
    }
    return null;
}

function salvarSessao(usuario) {
    sessionStorage.ID_USUARIO = usuario.id;
    sessionStorage.NOME_USUARIO = usuario.nome;
    sessionStorage.EMAIL_USUARIO = usuario.email;
}

function validarSessao() {
    var usuario = obterUsuarioLogado();
    var b_usuario = document.getElementById("b_usuario");

    if (usuario != null) {
        if (b_usuario) {
            b_usuario.innerHTML = usuario.nome;
        }
        return true;
    } else {
        window.location = "login.html";
        return false;
    }
}

function limparSessao() {
    sessionStorage.clear();
    window.location = "index.html";
}
