(function () {
    var paginaAtual = location.pathname.split("/").pop() || "index.html";
    var postsCarregados = [];

    function esc(valor) {
        return String(valor || "").replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }

    function formatarDataBR(dataStr) {
        if (!dataStr) return "Sem data";
        var limpa = String(dataStr).slice(0, 10);
        var partes = limpa.split("-");
        if (partes.length === 3) {
            return partes[2] + "/" + partes[1] + "/" + partes[0];
        }
        return dataStr;
    }

    function iniciaisNome(nome) {
        return String(nome || "♡")
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(function (p) { return p[0]; })
            .join("")
            .toUpperCase();
    }

    function obterUsuario() {
        if (sessionStorage.ID_USUARIO && sessionStorage.NOME_USUARIO) {
            return {
                id: Number(sessionStorage.ID_USUARIO),
                nome: sessionStorage.NOME_USUARIO,
                email: sessionStorage.EMAIL_USUARIO || ""
            };
        }
        return null;
    }

    function exibirMensagem(texto, erro, seletor) {
        var el = document.querySelector(seletor || "#form-message");
        if (el) {
            el.textContent = texto;
            el.classList.toggle("erro", Boolean(erro));
            el.classList.toggle("sucesso", !erro);
        } else {
            alert(texto);
        }
    }

    function atualizarInterfaceUsuario() {
        var usuario = obterUsuario();

        var navActions = document.querySelector(".topbar .nav-actions");
        if (navActions && usuario) {
            navActions.innerHTML =
                '<a class="btn btn-quiet" href="publicacoes.html">+ Novo Post</a>' +
                '<a class="btn btn-primary" href="dashboard.html">Olá, ' + esc(usuario.nome.split(" ")[0]) + ' ♡</a>';
        }

        if (!usuario) return;

        document.querySelectorAll(".topbar .avatar, .avatar-usuario").forEach(function (el) {
            el.textContent = iniciaisNome(usuario.nome);
        });

        document.querySelectorAll(".nome-usuario-logado").forEach(function (el) {
            el.textContent = usuario.nome;
        });

        document.querySelectorAll(".side a.item").forEach(function (link) {
            if (link.textContent.trim().toLowerCase() === "sair") {
                link.href = "#sair";
                link.addEventListener("click", function (e) {
                    e.preventDefault();
                    sessionStorage.clear();
                    window.location.href = "index.html";
                });
            }
        });
    }


    function criarCardPost(post, mostrarBotoesDono) {
        var usuario = obterUsuario();
        var ehDono = usuario && Number(usuario.id) === Number(post.usuarioId);
        var fotoHtml = post.foto
            ? '<div class="memory-photo" style="background-image:url(\'' + post.foto + '\')" role="img" aria-label="Foto do post"></div>'
            : '<div class="ph ph-' + ((Number(post.id) % 6) + 1) + '"></div>';

        var classeCurtido = Number(post.curtiu) > 0 ? "curtido" : "";
        var iconeCoracao = Number(post.curtiu) > 0 ? "❤️" : "🤍";
        var totalCurtidas = Number(post.totalCurtidas) || 0;
        var totalComentarios = Number(post.totalComentarios) || 0;

        var acoesProprietario = "";
        if (mostrarBotoesDono || ehDono) {
            acoesProprietario =
                '<div class="memory-actions">' +
                    '<a class="btn" href="nova-lembranca.html?id=' + post.id + '">✎ Editar</a>' +
                    '<button class="btn" type="button" data-delete-post="' + post.id + '" data-title="' + esc(post.titulo) + '">🗑 Excluir</button>' +
                '</div>';
        }

        return (
            '<article class="card memory-card" data-cat="' + esc(post.categoria) + '" data-id="' + post.id + '">' +
                fotoHtml +
                '<div class="card-body">' +
                    '<div class="meta">' +
                        '<span class="tag">' + esc(post.categoria) + '</span>' +
                        '<span>' + esc(post.dataFormatada || formatarDataBR(post.data)) + '</span>' +
                    '</div>' +
                    '<h3>' + esc(post.titulo) + '</h3>' +
                    '<p>' + esc(post.descricao) + '</p>' +
                    '<p class="muted author">Publicado por <b>' + esc(post.autor || "Nós") + '</b> ' + (post.privado ? "· 🔒 Privado" : "· ♡ Público") + '</p>' +
                    '<div class="social-bar">' +
                        '<div class="social-buttons">' +
                            '<button type="button" class="btn-like ' + classeCurtido + '" data-like-post="' + post.id + '">' +
                                '<span class="like-icon">' + iconeCoracao + '</span> ' +
                                '<span class="like-count">' + totalCurtidas + '</span>' +
                            '</button>' +
                            '<button type="button" class="btn-comment-toggle" data-toggle-comments="' + post.id + '">' +
                                '💬 <span class="comment-count" id="count-comentarios-' + post.id + '">' + totalComentarios + '</span>' +
                            '</button>' +
                        '</div>' +
                        '<a href="lembranca.html?id=' + post.id + '">Ver post →</a>' +
                    '</div>' +
                    '<div class="comments-drawer" id="drawer-comentarios-' + post.id + '" hidden>' +
                        '<div class="comments-list" id="lista-comentarios-' + post.id + '">' +
                            '<p class="muted">Carregando comentários...</p>' +
                        '</div>' +
                        '<form class="comment-form" data-comment-form="' + post.id + '">' +
                            '<input type="text" name="textoComentario" placeholder="Deixe um comentário carinhoso..." maxlength="400" required />' +
                            '<button type="submit">Enviar</button>' +
                        '</form>' +
                    '</div>' +
                    acoesProprietario +
                '</div>' +
            '</article>'
        );
    }

    function renderizarListaPosts(container, lista, mostrarBotoesDono, mensagemVazio) {
        if (!container) return;
        if (!lista || lista.length === 0) {
            container.innerHTML =
                '<div class="box empty-state" style="grid-column: 1 / -1;">' +
                    '<h3>♡</h3>' +
                    '<p>' + esc(mensagemVazio || "Ainda não há posts publicados por aqui.") + '</p>' +
                    '<a class="btn btn-primary" href="nova-lembranca.html">+ Criar Primeiro Post</a>' +
                '</div>';
            return;
        }
        container.innerHTML = lista.map(function (p) {
            return criarCardPost(p, mostrarBotoesDono);
        }).join("");
    }


    function alternarCurtidaPost(idPost, botaoElemento) {
        var usuario = obterUsuario();
        if (!usuario) {
            alert("Entre na sua conta para curtir os posts da Giovana ♡");
            window.location.href = "login.html";
            return;
        }

        fetch("/posts/" + idPost + "/curtir", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idUsuario: usuario.id })
        })
            .then(function (res) { return res.json(); })
            .then(function (dados) {
                if (dados.erro) {
                    alert(dados.erro);
                    return;
                }
                if (botaoElemento) {
                    botaoElemento.classList.toggle("curtido", Boolean(dados.curtiu));
                    var icone = botaoElemento.querySelector(".like-icon");
                    var cont = botaoElemento.querySelector(".like-count");
                    if (icone) icone.textContent = dados.curtiu ? "❤️" : "🤍";
                    if (cont) cont.textContent = dados.totalCurtidas;
                }
            })
            .catch(function (erro) {
                console.error("Erro ao curtir:", erro);
            });
    }

    function carregarComentariosPost(idPost) {
        var container = document.getElementById("lista-comentarios-" + idPost);
        var contador = document.getElementById("count-comentarios-" + idPost);
        var usuario = obterUsuario();

        if (!container) return;

        fetch("/posts/" + idPost + "/comentarios")
            .then(function (res) { return res.json(); })
            .then(function (comentarios) {
                if (contador) contador.textContent = comentarios.length;

                if (!comentarios || comentarios.length === 0) {
                    container.innerHTML = '<p class="muted" style="font-size:12px;">Seja a primeira pessoa a comentar neste post ♡</p>';
                    return;
                }

                container.innerHTML = comentarios.map(function (c) {
                    var podeExcluir = usuario && Number(usuario.id) === Number(c.usuarioId);
                    return (
                        '<div class="comment-item">' +
                            '<div class="comment-head">' +
                                '<span class="comment-author">' + esc(c.autor) + '</span>' +
                                '<span>' +
                                    '<span class="comment-date">' + esc(c.dataComentario || "") + '</span>' +
                                    (podeExcluir ? ' <button type="button" class="comment-delete" title="Excluir comentário" data-delete-comment="' + c.id + '" data-post-id="' + idPost + '">×</button>' : '') +
                                '</span>' +
                            '</div>' +
                            '<div>' + esc(c.texto) + '</div>' +
                        '</div>'
                    );
                }).join("");
            })
            .catch(function (erro) {
                console.error("Erro ao carregar comentários:", erro);
            });
    }

    function enviarComentarioPost(idPost, inputElemento) {
        var usuario = obterUsuario();
        if (!usuario) {
            alert("Entre na sua conta para deixar um comentário carinhoso ♡");
            window.location.href = "login.html";
            return;
        }

        var texto = inputElemento.value.trim();
        if (!texto) return;

        fetch("/posts/" + idPost + "/comentar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                idUsuario: usuario.id,
                texto: texto
            })
        })
            .then(function (res) { return res.json(); })
            .then(function (dados) {
                if (dados.erro) {
                    alert(dados.erro);
                    return;
                }
                inputElemento.value = "";
                carregarComentariosPost(idPost);
            })
            .catch(function (erro) {
                console.error("Erro ao comentar:", erro);
            });
    }

    document.addEventListener("click", function (e) {
        var btnLike = e.target.closest("[data-like-post]");
        if (btnLike) {
            var idPostLike = btnLike.getAttribute("data-like-post");
            alternarCurtidaPost(idPostLike, btnLike);
            return;
        }

        var btnToggle = e.target.closest("[data-toggle-comments]");
        if (btnToggle) {
            var idPostComm = btnToggle.getAttribute("data-toggle-comments");
            var drawer = document.getElementById("drawer-comentarios-" + idPostComm);
            if (drawer) {
                var estavaOculto = drawer.hasAttribute("hidden");
                if (estavaOculto) {
                    drawer.removeAttribute("hidden");
                    carregarComentariosPost(idPostComm);
                } else {
                    drawer.setAttribute("hidden", "");
                }
            }
            return;
        }

        var btnDelComment = e.target.closest("[data-delete-comment]");
        if (btnDelComment) {
            var idComentario = btnDelComment.getAttribute("data-delete-comment");
            var idPostRef = btnDelComment.getAttribute("data-post-id");
            var usuario = obterUsuario();
            if (!usuario) return;

            fetch("/posts/comentarios/" + idComentario + "?idUsuario=" + usuario.id, {
                method: "DELETE"
            })
                .then(function () {
                    carregarComentariosPost(idPostRef);
                });
            return;
        }

        var btnDelPost = e.target.closest("[data-delete-post]");
        if (btnDelPost) {
            var idPostDel = btnDelPost.getAttribute("data-delete-post");
            var tituloDel = btnDelPost.getAttribute("data-title") || "este post";
            var usuarioAtual = obterUsuario();
            if (!usuarioAtual) return;

            if (!confirm('Deseja realmente excluir o post "' + tituloDel + '"?')) return;

            fetch("/posts/deletar/" + idPostDel + "?idUsuario=" + usuarioAtual.id, {
                method: "DELETE"
            })
                .then(function (res) { return res.json(); })
                .then(function () {
                    window.location.reload();
                })
                .catch(function (err) {
                    alert("Erro ao excluir post: " + err.message);
                });
        }
    });

    document.addEventListener("submit", function (e) {
        var formComment = e.target.closest("[data-comment-form]");
        if (formComment) {
            e.preventDefault();
            var idPost = formComment.getAttribute("data-comment-form");
            var input = formComment.querySelector('input[name="textoComentario"]');
            if (input) enviarComentarioPost(idPost, input);
        }
    });


    function configurarAutenticacao() {
        document.querySelectorAll("[data-mostrar]").forEach(function (checkbox) {
            checkbox.addEventListener("change", function () {
                document.querySelectorAll("input[data-senha]").forEach(function (inp) {
                    inp.type = checkbox.checked ? "text" : "password";
                });
            });
        });

        var formCadastro = document.getElementById("register-form");
        if (formCadastro) {
            formCadastro.addEventListener("submit", function (e) {
                e.preventDefault();
                var nome = document.getElementById("n").value.trim();
                var email = document.getElementById("e").value.trim();
                var senha = document.getElementById("s").value;
                var confirmar = document.getElementById("c").value;

                if (senha !== confirmar) {
                    exibirMensagem("As senhas informadas não coincidem!", true);
                    return;
                }

                fetch("/usuarios/cadastrar", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        nomeServer: nome,
                        emailServer: email,
                        senhaServer: senha
                    })
                })
                    .then(function (res) {
                        return res.json().then(function (dados) {
                            if (!res.ok) throw new Error(dados.erro || "Erro ao cadastrar.");
                            return dados;
                        });
                    })
                    .then(function (usuarioCriado) {
                        sessionStorage.ID_USUARIO = usuarioCriado.id;
                        sessionStorage.NOME_USUARIO = usuarioCriado.nome;
                        sessionStorage.EMAIL_USUARIO = usuarioCriado.email;
                        exibirMensagem("Conta criada com sucesso! Redirecionando...", false);
                        setTimeout(function () {
                            window.location.href = "dashboard.html";
                        }, 600);
                    })
                    .catch(function (erro) {
                        exibirMensagem(erro.message, true);
                    });
            });
        }

        var formLogin = document.getElementById("login-form");
        if (formLogin) {
            formLogin.addEventListener("submit", function (e) {
                e.preventDefault();
                var email = document.getElementById("e").value.trim();
                var senha = document.getElementById("s").value;

                fetch("/usuarios/autenticar", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        emailServer: email,
                        senhaServer: senha
                    })
                })
                    .then(function (res) {
                        return res.json().then(function (dados) {
                            if (!res.ok) throw new Error(dados.erro || "E-mail ou senha inválidos!");
                            return dados;
                        });
                    })
                    .then(function (usuarioLogado) {
                        sessionStorage.ID_USUARIO = usuarioLogado.id;
                        sessionStorage.NOME_USUARIO = usuarioLogado.nome;
                        sessionStorage.EMAIL_USUARIO = usuarioLogado.email;
                        exibirMensagem("Login realizado com sucesso! Bem-vindo(a) ♡", false);
                        setTimeout(function () {
                            window.location.href = "dashboard.html";
                        }, 500);
                    })
                    .catch(function (erro) {
                        exibirMensagem(erro.message, true);
                    });
            });
        }
    }


    function configurarFeedPublico() {
        if (paginaAtual !== "index.html" && paginaAtual !== "" && paginaAtual !== "publicacoes.html") return;

        var container = document.querySelector("[data-public-memory-list]");
        if (!container) return;

        var usuario = obterUsuario();
        var idUserParam = usuario ? usuario.id : 0;

        var quickBox = document.getElementById("quick-post-section");
        if (quickBox) {
            if (usuario) {
                quickBox.removeAttribute("hidden");
                var inputDataQuick = document.getElementById("quick-data");
                if (inputDataQuick && !inputDataQuick.value) {
                    inputDataQuick.value = new Date().toISOString().slice(0, 10);
                }
            }
        }

        var formQuick = document.getElementById("quick-post-form");
        if (formQuick) {
            formQuick.addEventListener("submit", function (e) {
                e.preventDefault();
                if (!usuario) {
                    window.location.href = "login.html";
                    return;
                }
                var titulo = document.getElementById("quick-titulo").value.trim();
                var categoria = document.getElementById("quick-categoria").value;
                var data = document.getElementById("quick-data").value || new Date().toISOString().slice(0, 10);
                var descricao = document.getElementById("quick-descricao").value.trim();

                fetch("/posts/publicar", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        idUsuario: usuario.id,
                        titulo: titulo,
                        descricao: descricao,
                        data: data,
                        categoria: categoria,
                        privado: 0,
                        foto: null
                    })
                })
                    .then(function (res) { return res.json(); })
                    .then(function (dados) {
                        if (dados.erro) {
                            alert(dados.erro);
                            return;
                        }
                        formQuick.reset();
                        document.getElementById("quick-data").value = new Date().toISOString().slice(0, 10);
                        carregarFeed();
                    });
            });
        }

        function carregarFeed() {
            fetch("/posts/listar?idUsuario=" + idUserParam)
                .then(function (res) { return res.json(); })
                .then(function (lista) {
                    postsCarregados = Array.isArray(lista) ? lista : [];
                    var exibir = paginaAtual === "index.html" || paginaAtual === ""
                        ? postsCarregados.slice(0, 3)
                        : postsCarregados;
                    renderizarListaPosts(container, exibir, false);
                })
                .catch(function (erro) {
                    console.error("Erro ao carregar feed:", erro);
                });
        }

        carregarFeed();

        var inputBusca = document.getElementById("b");
        var categoriaAtiva = "todos";

        function aplicarFiltros() {
            var termo = (inputBusca ? inputBusca.value : "").toLowerCase();
            var filtrados = postsCarregados.filter(function (p) {
                var textoCompleto = (p.titulo + " " + p.descricao + " " + p.categoria + " " + p.autor).toLowerCase();
                var bateBusca = textoCompleto.includes(termo);
                var bateCat = categoriaAtiva === "todos" || p.categoria === categoriaAtiva;
                return bateBusca && bateCat;
            });
            renderizarListaPosts(container, filtrados, false, "Nenhum post encontrado para esse filtro.");
        }

        if (inputBusca) {
            inputBusca.addEventListener("input", aplicarFiltros);
        }

        document.querySelectorAll("[data-f]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                categoriaAtiva = btn.getAttribute("data-f");
                document.querySelectorAll("[data-f]").forEach(function (b) {
                    b.classList.toggle("ativo", b === btn);
                });
                aplicarFiltros();
            });
        });
    }


    function configurarMinhasLembrancas() {
        if (paginaAtual !== "minhas-lembrancas.html") return;
        var usuario = obterUsuario();
        if (!usuario) {
            window.location.href = "login.html";
            return;
        }

        var container = document.getElementById("memory-list");
        fetch("/posts/usuario/" + usuario.id)
            .then(function (res) { return res.json(); })
            .then(function (meusPosts) {
                postsCarregados = Array.isArray(meusPosts) ? meusPosts : [];

                function filtrarMeusPosts() {
                    var q = (document.getElementById("b") ? document.getElementById("b").value : "").toLowerCase();
                    var btnVis = document.querySelector("[data-vis-filter].ativo");
                    var vis = btnVis ? btnVis.getAttribute("data-vis-filter") : "todas";

                    var filtrados = postsCarregados.filter(function (p) {
                        var bateTexto = (p.titulo + " " + p.descricao + " " + p.categoria).toLowerCase().includes(q);
                        var bateVis = vis === "todas" || (vis === "publicas" ? !p.privado : Boolean(p.privado));
                        return bateTexto && bateVis;
                    });

                    renderizarListaPosts(container, filtrados, true, "Você ainda não criou nenhum post. Clique em '+ Adicionar lembrança'!");
                    var contEl = document.querySelector("[data-memory-count]");
                    if (contEl) contEl.textContent = filtrados.length + " post(s)";
                }

                var inpB = document.getElementById("b");
                if (inpB) inpB.addEventListener("input", filtrarMeusPosts);

                document.querySelectorAll("[data-vis-filter]").forEach(function (btn) {
                    btn.addEventListener("click", function () {
                        document.querySelectorAll("[data-vis-filter]").forEach(function (b) {
                            b.classList.toggle("ativo", b === btn);
                        });
                        filtrarMeusPosts();
                    });
                });

                filtrarMeusPosts();
            });
    }


    function configurarCriarEditarPost() {
        if (paginaAtual !== "nova-lembranca.html") return;
        var usuario = obterUsuario();
        if (!usuario) {
            window.location.href = "login.html";
            return;
        }

        var form = document.getElementById("memory-form");
        if (!form) return;

        var params = new URLSearchParams(window.location.search);
        var idEdicao = params.get("id");
        var fotoBase64 = null;

        var inputData = document.getElementById("dt");
        if (inputData && !inputData.value) {
            inputData.value = new Date().toISOString().slice(0, 10);
        }

        var fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/jpeg,image/png,image/webp";
        fileInput.hidden = true;
        form.appendChild(fileInput);

        var btnUpload = form.querySelector(".upload button");
        if (btnUpload) {
            btnUpload.addEventListener("click", function () {
                fileInput.click();
            });
        }

        fileInput.addEventListener("change", function () {
            var arq = fileInput.files && fileInput.files[0];
            if (!arq) return;
            if (arq.size > 5 * 1024 * 1024) {
                exibirMensagem("A foto deve ter no máximo 5 MB.", true);
                return;
            }
            var leitor = new FileReader();
            leitor.onload = function () {
                fotoBase64 = leitor.result;
                if (btnUpload) btnUpload.textContent = "Fotografia selecionada ✓";
            };
            leitor.readAsDataURL(arq);
        });

        if (idEdicao) {
            fetch("/posts/detalhe/" + idEdicao + "?idUsuario=" + usuario.id)
                .then(function (res) { return res.json(); })
                .then(function (post) {
                    if (post.erro) throw new Error(post.erro);
                    document.getElementById("t").value = post.titulo;
                    document.getElementById("d").value = post.descricao;
                    document.getElementById("dt").value = String(post.data).slice(0, 10);
                    document.getElementById("c").value = post.categoria;
                    fotoBase64 = post.foto || null;

                    var radios = document.querySelectorAll('input[name="v"]');
                    if (radios.length >= 2) {
                        radios[0].checked = !post.privado;
                        radios[1].checked = Boolean(post.privado);
                    }
                    var h1 = document.querySelector(".page-title h1");
                    if (h1) h1.textContent = "Editar publicação";
                    var btnSub = form.querySelector('button[type="submit"]');
                    if (btnSub) btnSub.textContent = "Salvar alterações";
                })
                .catch(function (erro) {
                    exibirMensagem(erro.message, true);
                });
        }

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            var titulo = document.getElementById("t").value.trim();
            var descricao = document.getElementById("d").value.trim();
            var data = document.getElementById("dt").value;
            var categoria = document.getElementById("c").value;
            var radios = document.querySelectorAll('input[name="v"]');
            var privado = radios[1] && radios[1].checked ? 1 : 0;

            var url = idEdicao ? "/posts/editar/" + idEdicao : "/posts/publicar";
            var metodo = idEdicao ? "PUT" : "POST";

            fetch(url, {
                method: metodo,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    idUsuario: usuario.id,
                    titulo: titulo,
                    descricao: descricao,
                    data: data,
                    categoria: categoria,
                    privado: privado,
                    foto: fotoBase64
                })
            })
                .then(function (res) {
                    return res.json().then(function (dados) {
                        if (!res.ok) throw new Error(dados.erro || "Erro ao salvar post.");
                        return dados;
                    });
                })
                .then(function () {
                    exibirMensagem("Post salvo com sucesso! Redirecionando...", false);
                    setTimeout(function () {
                        window.location.href = "publicacoes.html";
                    }, 500);
                })
                .catch(function (erro) {
                    exibirMensagem(erro.message, true);
                });
        });
    }


    function configurarDetalhePost() {
        if (paginaAtual !== "lembranca.html") return;
        var idPost = new URLSearchParams(window.location.search).get("id") || 1;
        var usuario = obterUsuario();
        var idUserParam = usuario ? usuario.id : 0;

        fetch("/posts/detalhe/" + idPost + "?idUsuario=" + idUserParam)
            .then(function (res) { return res.json(); })
            .then(function (post) {
                var artigo = document.querySelector(".artigo");
                if (!artigo || post.erro) return;

                var classeCurtido = Number(post.curtiu) > 0 ? "curtido" : "";
                var iconeCoracao = Number(post.curtiu) > 0 ? "❤️" : "🤍";
                var ehDono = usuario && Number(usuario.id) === Number(post.usuarioId);

                artigo.innerHTML =
                    '<a href="publicacoes.html" class="muted">← Voltar para todas as publicações</a>' +
                    '<p style="margin: 16px 0">' +
                        '<span class="tag">' + esc(post.categoria) + '</span> ' +
                        '<span class="muted">' + esc(post.dataFormatada || formatarDataBR(post.data)) + ' · Por <b>' + esc(post.autor) + '</b></span>' +
                    '</p>' +
                    '<h1>' + esc(post.titulo) + '</h1>' +
                    (post.foto
                        ? '<img class="detail-photo" src="' + post.foto + '" alt="Foto da lembrança">'
                        : '<div class="ph ph-' + ((Number(post.id) % 6) + 1) + ' detail-placeholder"></div>') +
                    '<div class="form-wrap">' +
                        '<div>' +
                            '<p class="eyebrow">Nossa história guardada</p>' +
                            '<p style="margin: 14px 0; white-space: pre-wrap; font-size: 16px; color: #4a3e44;">' + esc(post.descricao) + '</p>' +
                            '<div class="social-bar" style="margin: 24px 0;">' +
                                '<div class="social-buttons">' +
                                    '<button type="button" class="btn-like ' + classeCurtido + '" data-like-post="' + post.id + '">' +
                                        '<span class="like-icon">' + iconeCoracao + '</span> ' +
                                        '<span class="like-count">' + (post.totalCurtidas || 0) + '</span> curtidas' +
                                    '</button>' +
                                    '<span class="btn-comment-toggle">' +
                                        '💬 <span id="count-comentarios-' + post.id + '">' + (post.totalComentarios || 0) + '</span> comentários' +
                                    '</span>' +
                                '</div>' +
                                (ehDono ? '<a class="btn" href="nova-lembranca.html?id=' + post.id + '">✎ Editar Post</a>' : '') +
                            '</div>' +
                            '<div class="box" style="margin-top: 20px;">' +
                                '<h3 style="margin-bottom: 12px;">Comentários neste post ♡</h3>' +
                                '<div class="comments-list" id="lista-comentarios-' + post.id + '" style="max-height: none;"></div>' +
                                '<form class="comment-form" data-comment-form="' + post.id + '" style="margin-top: 14px;">' +
                                    '<input type="text" name="textoComentario" placeholder="Escreva um comentário para este momento..." required />' +
                                    '<button type="submit">Comentar</button>' +
                                '</form>' +
                            '</div>' +
                        '</div>' +
                        '<aside class="dica center">' +
                            '<span style="font-size: 26px; color: var(--vinho)">♡</span>' +
                            '<h3 style="margin: 8px 0;">Para Giovana</h3>' +
                            '<p class="muted">Cada post, curtida e comentário aqui faz parte do nosso álbum especial.</p>' +
                        '</aside>' +
                    '</div>';

                carregarComentariosPost(post.id);
            });
    }


    function configurarDashboard() {
        if (paginaAtual !== "dashboard.html") return;
        var usuario = obterUsuario();
        if (!usuario) {
            window.location.href = "login.html";
            return;
        }

        var tituloBoasVindas = document.querySelector(".page-title h1");
        if (tituloBoasVindas) {
            tituloBoasVindas.textContent = "Olá, " + usuario.nome.split(" ")[0] + "! ♡";
        }

        fetch("/dashboard/metricas")
            .then(function (res) { return res.json(); })
            .then(function (dados) {
                var kpis = dados.kpis || {};
                var stats = document.querySelectorAll(".stat b");
                if (stats[0]) stats[0].textContent = kpis.totalPosts || 0;
                if (stats[1]) stats[1].textContent = kpis.totalCurtidas || 0;
                if (stats[2]) stats[2].textContent = kpis.totalComentarios || 0;
                if (stats[3]) stats[3].textContent = kpis.categoriaFavorita || "Fotografias";

                if (window.Chart) {
                    var ctxCat = document.getElementById("graficoCategorias");
                    if (ctxCat && dados.porCategoria) {
                        new Chart(ctxCat, {
                            type: "doughnut",
                            data: {
                                labels: dados.porCategoria.map(function (i) { return i.categoria; }),
                                datasets: [{
                                    data: dados.porCategoria.map(function (i) { return i.quantidade; }),
                                    backgroundColor: ["#7b2948", "#d47a96", "#f0b8c8", "#a85873", "#e69db2"]
                                }]
                            },
                            options: { responsive: true, maintainAspectRatio: false }
                        });
                    }

                    var ctxEng = document.getElementById("graficoEngajamento");
                    if (ctxEng && dados.topPosts) {
                        new Chart(ctxEng, {
                            type: "bar",
                            data: {
                                labels: dados.topPosts.map(function (p) {
                                    return p.categoria.length > 18 ? p.categoria.slice(0, 18) + "..." : p.categoria;
                                }),
                                datasets: [
                                    {
                                        label: "Curtidas ❤️",
                                        data: dados.topPosts.map(function (p) { return p.curtidas; }),
                                        backgroundColor: "#7b2948"
                                    },
                                    {
                                        label: "Comentários 💬",
                                        data: dados.topPosts.map(function (p) { return p.comentarios; }),
                                        backgroundColor: "#f0b8c8"
                                    }
                                ]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
                            }
                        });
                    }
                }
            });

        fetch("/posts/listar?idUsuario=" + usuario.id)
            .then(function (res) { return res.json(); })
            .then(function (posts) {
                var tabela = document.querySelector(".tabela");
                if (!tabela) return;
                if (!posts || posts.length === 0) {
                    tabela.innerHTML = '<div class="empty-state"><p>Ainda não há posts cadastrados.</p></div>';
                    return;
                }

                tabela.innerHTML =
                    '<div class="tr th"><div>Post / Lembrança</div><div>Data e Categoria</div><div>Interações</div><div>Ações</div></div>' +
                    posts.slice(0, 6).map(function (p) {
                        return (
                            '<div class="tr">' +
                                '<div class="item">' +
                                    '<div class="ph ph-' + ((Number(p.id) % 6) + 1) + '"></div>' +
                                    '<div>' +
                                        '<span class="serif" style="color:var(--vinho)">' + esc(p.titulo) + '</span>' +
                                        '<span class="muted">Por ' + esc(p.autor) + '</span>' +
                                    '</div>' +
                                '</div>' +
                                '<div>' + esc(p.dataFormatada || formatarDataBR(p.data)) + '<br><span class="tag">' + esc(p.categoria) + '</span></div>' +
                                '<div>❤️ ' + (p.totalCurtidas || 0) + ' &nbsp; 💬 ' + (p.totalComentarios || 0) + '</div>' +
                                '<div class="acoes">' +
                                    '<a href="lembranca.html?id=' + p.id + '" title="Ver post">👁</a>' +
                                    '<a href="nova-lembranca.html?id=' + p.id + '" title="Editar">✎</a>' +
                                    '<button type="button" data-delete-post="' + p.id + '" data-title="' + esc(p.titulo) + '" title="Excluir">🗑</button>' +
                                '</div>' +
                            '</div>'
                        );
                    }).join("");
            });
    }


    function configurarPerfil() {
        if (paginaAtual !== "perfil.html") return;
        var usuario = obterUsuario();
        if (!usuario) {
            window.location.href = "login.html";
            return;
        }

        var inpNome = document.getElementById("n");
        var inpEmail = document.getElementById("e");
        if (inpNome) inpNome.value = usuario.nome;
        if (inpEmail) inpEmail.value = usuario.email;

        var form = document.getElementById("profile-form");
        if (form) {
            form.addEventListener("submit", function (e) {
                e.preventDefault();
                var novoNome = inpNome.value.trim();
                var novoEmail = inpEmail.value.trim();

                fetch("/usuarios/perfil/" + usuario.id, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        nome: novoNome,
                        email: novoEmail
                    })
                })
                    .then(function (res) { return res.json(); })
                    .then(function (atualizado) {
                        if (atualizado.erro) throw new Error(atualizado.erro);
                        sessionStorage.NOME_USUARIO = atualizado.nome;
                        sessionStorage.EMAIL_USUARIO = atualizado.email;
                        atualizarInterfaceUsuario();
                        exibirMensagem("Perfil atualizado com sucesso! ♡", false);
                    })
                    .catch(function (erro) {
                        exibirMensagem(erro.message, true);
                    });
            });
        }
    }

    atualizarInterfaceUsuario();
    configurarAutenticacao();
    configurarFeedPublico();
    configurarMinhasLembrancas();
    configurarCriarEditarPost();
    configurarDetalhePost();
    configurarDashboard();
    configurarPerfil();
})();
