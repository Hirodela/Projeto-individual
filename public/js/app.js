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
                '<a class="btn btn-primary" href="dashboard.html">Olá, ' + esc(usuario.nome.split(" ")[0]) + ' ♡</a>' +
                '<a href="perfil.html" title="Meu Perfil"><span class="avatar">' + iniciaisNome(usuario.nome) + '</span></a>';
        }

        if (!usuario) return;

        var fotoSalva = localStorage.getItem("FOTO_PERFIL_" + usuario.id);

        document.querySelectorAll(".topbar .avatar, .avatar-usuario").forEach(function (el) {
            if (fotoSalva) {
                el.textContent = "";
                el.style.backgroundImage = "url('" + fotoSalva + "')";
                el.style.backgroundSize = "cover";
                el.style.backgroundPosition = "center";
            } else {
                el.style.backgroundImage = "";
                el.textContent = iniciaisNome(usuario.nome);
            }
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
            ? '<div class="memory-photo" data-lightbox-src="' + esc(post.foto) + '" data-lightbox-caption="' + esc(post.titulo) + '" style="background-image:url(\'' + post.foto + '\')" role="img" aria-label="Foto do post"></div>'
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
                    '<p class="muted author">Publicado por <b>' + esc(post.autor || "Nós") + '</b></p>' +
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

        document.querySelectorAll("[data-fill-demo]").forEach(function (btnDemo) {
            btnDemo.addEventListener("click", function () {
                var inpEmail = document.getElementById("e");
                var inpSenha = document.getElementById("s");
                if (inpEmail && inpSenha) {
                    inpEmail.value = "giovana@amor.com";
                    inpSenha.value = "123456";
                    exibirMensagem("Conta de demonstração preenchida! Clique em Entrar ♡", false);
                }
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
                    postsCarregados = (Array.isArray(lista) ? lista : []).filter(function (p) {
                        return String(p.categoria || "").indexOf("História:") !== 0;
                    });
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
        var ordenacaoAtiva = "recentes";

        function aplicarFiltros() {
            var termo = (inputBusca ? inputBusca.value : "").toLowerCase();
            var filtrados = postsCarregados.filter(function (p) {
                var textoCompleto = (p.titulo + " " + p.descricao + " " + p.categoria + " " + p.autor).toLowerCase();
                var bateBusca = textoCompleto.includes(termo);
                var bateCat = categoriaAtiva === "todos" || p.categoria === categoriaAtiva;
                return bateBusca && bateCat;
            });

            if (ordenacaoAtiva === "curtidos") {
                filtrados.sort(function (a, b) {
                    return (Number(b.totalCurtidas) || 0) - (Number(a.totalCurtidas) || 0);
                });
            }

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

        document.querySelectorAll("[data-sort]").forEach(function (btnSort) {
            btnSort.addEventListener("click", function () {
                ordenacaoAtiva = btnSort.getAttribute("data-sort");
                document.querySelectorAll("[data-sort]").forEach(function (b) {
                    b.classList.toggle("ativo", b === btnSort);
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
                postsCarregados = (Array.isArray(meusPosts) ? meusPosts : []).filter(function (p) {
                    return String(p.categoria || "").indexOf("História:") !== 0;
                });

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

        var dropzone = form.querySelector(".upload");
        var btnUpload = form.querySelector(".upload button");
        var previewWrap = document.createElement("div");
        previewWrap.className = "upload-preview-container";
        previewWrap.hidden = true;
        if (dropzone) dropzone.appendChild(previewWrap);

        function mostrarPreviewFoto(srcUrl, nomeArq) {
            previewWrap.hidden = false;
            previewWrap.innerHTML =
                '<img class="upload-preview-img" src="' + srcUrl + '" alt="Pré-visualização da foto" />' +
                '<span class="muted">' + esc(nomeArq || "Fotografia selecionada") + '</span>';
        }

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
            fotoBase64 = arq;
            if (btnUpload) btnUpload.textContent = "Trocar fotografia ✓";
            var reader = new FileReader();
            reader.onload = function (ev) {
                mostrarPreviewFoto(ev.target.result, arq.name);
            };
            reader.readAsDataURL(arq);
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
                    if (post.foto) {
                        mostrarPreviewFoto(post.foto, "Fotografia atual do post");
                        if (btnUpload) btnUpload.textContent = "Trocar fotografia ✓";
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
            var privado = 0;

            var url = idEdicao ? "/posts/editar/" + idEdicao : "/posts/publicar";
            var metodo = idEdicao ? "PUT" : "POST";

            var dadosPost = new FormData();
            dadosPost.append("idUsuario", usuario.id);
            dadosPost.append("titulo", titulo);
            dadosPost.append("descricao", descricao);
            dadosPost.append("data", data);
            dadosPost.append("categoria", categoria);
            dadosPost.append("privado", privado);

            if (fotoBase64 instanceof File) {
                dadosPost.append("foto", fotoBase64);
            } else if (fotoBase64) {
                dadosPost.append("foto", fotoBase64);
            }

            fetch(url, {
                method: metodo,
                body: dadosPost
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
                        ? '<img class="detail-photo" data-lightbox-src="' + esc(post.foto) + '" data-lightbox-caption="' + esc(post.titulo) + '" src="' + post.foto + '" alt="Foto da lembrança">'
                        : '<div class="ph ph-' + ((Number(post.id) % 6) + 1) + ' detail-placeholder"></div>') +
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

        var badgeDataHoje = document.getElementById("dash-data-hoje");
        if (badgeDataHoje) {
            try {
                var formatador = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
                badgeDataHoje.textContent = "📅 " + formatador.format(new Date()) + " · Nosso painel ♡";
            } catch (e) {
                badgeDataHoje.textContent = "Nosso painel de memórias ♡";
            }
        }

        // Sincroniza dados românticos locais (Sonhos e Capítulos)
        function atualizarTermometroLocal() {
            // Sonhos da Bucket List
            try {
                var sonhosBruto = localStorage.getItem("SONHOS_CASAL_GIOVANA");
                var listaSonhos = sonhosBruto ? JSON.parse(sonhosBruto) : [
                    { realizado: true }, { realizado: true }, { realizado: true }, { realizado: false }, { realizado: false }, { realizado: false }
                ];
                var totalSonhos = listaSonhos.length || 6;
                var feitosSonhos = listaSonhos.filter(function (s) { return s.realizado || s.feito; }).length;
                var pctSonhos = Math.round((feitosSonhos / totalSonhos) * 100);
                var txtSonhos = document.getElementById("dash-meta-sonhos-txt");
                var barSonhos = document.getElementById("dash-meta-sonhos-bar");
                if (txtSonhos) txtSonhos.textContent = feitosSonhos + " de " + totalSonhos + " realizados (" + pctSonhos + "%)";
                if (barSonhos) barSonhos.style.width = pctSonhos + "%";
            } catch (e) {}

            // Capítulos em Nossa História
            try {
                var capBruto = localStorage.getItem("CAPITULOS_NOSSA_HISTORIA");
                var listaCap = capBruto ? JSON.parse(capBruto) : [];
                var qtdCap = 4 + (Array.isArray(listaCap) ? listaCap.length : 0);
                var elCap = document.getElementById("dash-count-capitulos");
                if (elCap) elCap.textContent = qtdCap + " capítulos";
            } catch (e) {}

            // Lugares para irmos juntos
            try {
                var lugBruto = localStorage.getItem("LUGARES_CASAL_GIOVANA");
                var listaLug = lugBruto ? JSON.parse(lugBruto) : null;
                var qtdLug = Array.isArray(listaLug) ? listaLug.length : 3;
                var elLug = document.getElementById("dash-count-lugares");
                if (elLug) elLug.textContent = qtdLug + " destinos ♡";
            } catch (e) {}
        }

        function renderizarPostDestaque(post) {
            var box = document.getElementById("dash-post-destaque");
            if (!box) return;
            if (!post) {
                box.innerHTML =
                    '<div style="text-align:center;width:100%;padding:12px;">' +
                        '<p class="muted">Ainda não há lembranças publicadas no mural.</p>' +
                        '<a class="btn btn-primary" href="nova-lembranca.html" style="margin-top:10px;">+ Publicar Primeira Lembrança</a>' +
                    '</div>';
                return;
            }
            var thumbStyle = post.foto
                ? 'background-image:url(\'' + post.foto + '\');'
                : '';
            var thumbClass = post.foto
                ? 'dash-featured-thumb'
                : 'dash-featured-thumb ph-' + ((Number(post.id) % 6) + 1);

            box.innerHTML =
                '<div class="' + thumbClass + '" style="' + thumbStyle + '"></div>' +
                '<div class="dash-featured-info">' +
                    '<span class="tag">' + esc(post.categoria || "Lembrança") + '</span> ' +
                    '<span class="muted" style="font-size:12px;">' + esc(post.dataFormatada || formatarDataBR(post.data)) + ' · Por <b>' + esc(post.autor) + '</b></span>' +
                    '<h4>' + esc(post.titulo) + '</h4>' +
                    '<div class="dash-featured-meta">' +
                        '<span>❤️ ' + Number(post.totalCurtidas || 0) + ' curtidas</span>' +
                        '<span>💬 ' + Number(post.totalComentarios || 0) + ' comentários</span>' +
                        '<a class="btn" href="lembranca.html?id=' + post.id + '" style="min-height:34px;padding:6px 14px;font-size:12.5px;margin-left:auto;">Ver lembrança →</a>' +
                    '</div>' +
                '</div>';
        }

        atualizarTermometroLocal(0);

        fetch("/dashboard/metricas")
            .then(function (res) { return res.json(); })
            .then(function (dados) {
                var kpis = dados.kpis || {};
                var porCatLimpo = (dados.porCategoria || []).filter(function (c) {
                    return String(c.categoria || "").indexOf("História:") !== 0;
                });
                var topEngLimpo = (dados.topPosts || []).filter(function (c) {
                    return String(c.categoria || "").indexOf("História:") !== 0;
                });

                var totalPosts = Number(kpis.totalPosts || 0);
                var totalCurtidas = Number(kpis.totalCurtidas || 0);
                var totalComentarios = Number(kpis.totalComentarios || 0);
                var catFav = kpis.categoriaFavorita && String(kpis.categoriaFavorita).indexOf("História:") !== 0
                    ? kpis.categoriaFavorita
                    : (porCatLimpo[0] ? porCatLimpo[0].categoria : "Fotografias");

                var stats = document.querySelectorAll(".stat b");
                if (stats[0]) stats[0].textContent = totalPosts;
                if (stats[1]) stats[1].textContent = totalCurtidas;
                if (stats[2]) stats[2].textContent = totalComentarios;
                if (stats[3]) stats[3].textContent = catFav;

                var mediaInteracoes = totalPosts > 0
                    ? ((totalCurtidas + totalComentarios) / totalPosts).toFixed(1).replace(".", ",")
                    : "0";
                var subPosts = document.getElementById("kpi-sub-posts");
                var subCurtidas = document.getElementById("kpi-sub-curtidas");
                var subCat = document.getElementById("kpi-sub-categoria");
                if (subPosts) subPosts.textContent = "Média de " + mediaInteracoes + " interações/post";
                if (subCurtidas) subCurtidas.textContent = totalCurtidas > 0 ? "Cheio de amor no mural ♡" : "Deixe sua primeira curtida!";
                if (subCat && porCatLimpo[0]) subCat.textContent = porCatLimpo[0].quantidade + " publicações neste tema";

                var resumoCat = document.getElementById("chart-cat-resumo");
                if (resumoCat) resumoCat.textContent = porCatLimpo.length + " temas ativos";

                var resumoEng = document.getElementById("chart-eng-resumo");
                if (resumoEng) resumoEng.textContent = (totalCurtidas + totalComentarios) + " interações totais";

                atualizarTermometroLocal(totalPosts);

                if (dados.postMaisAmado) {
                    renderizarPostDestaque(dados.postMaisAmado);
                }

                if (window.Chart) {
                    Chart.defaults.font.family = "'Poppins', sans-serif";
                    Chart.defaults.color = "#6b5560";
                    Chart.defaults.plugins.legend.labels.usePointStyle = true;
                    Chart.defaults.plugins.tooltip.backgroundColor = "#5a1a33";
                    Chart.defaults.plugins.tooltip.cornerRadius = 12;
                    Chart.defaults.plugins.tooltip.padding = 12;

                    var ctxCat = document.getElementById("graficoCategorias");
                    if (ctxCat && porCatLimpo.length > 0) {
                        new Chart(ctxCat, {
                            type: "doughnut",
                            data: {
                                labels: porCatLimpo.map(function (i) { return i.categoria; }),
                                datasets: [{
                                    data: porCatLimpo.map(function (i) { return i.quantidade; }),
                                    backgroundColor: ["#7b2948", "#d35d85", "#f0b8c8", "#a33d64", "#e795ae", "#c97a96"],
                                    borderColor: "#ffffff",
                                    borderWidth: 3,
                                    hoverOffset: 10
                                }]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                cutout: "64%",
                                plugins: { legend: { position: "bottom" } }
                            }
                        });
                    }

                    var ctxEng = document.getElementById("graficoEngajamento");
                    if (ctxEng && topEngLimpo.length > 0) {
                        new Chart(ctxEng, {
                            type: "bar",
                            data: {
                                labels: topEngLimpo.map(function (p) {
                                    return p.categoria.length > 18 ? p.categoria.slice(0, 18) + "..." : p.categoria;
                                }),
                                datasets: [
                                    {
                                        label: "Curtidas ❤️",
                                        data: topEngLimpo.map(function (p) { return p.curtidas; }),
                                        backgroundColor: "#b8466f",
                                        borderRadius: 10
                                    },
                                    {
                                        label: "Comentários 💬",
                                        data: topEngLimpo.map(function (p) { return p.comentarios; }),
                                        backgroundColor: "#f0b8c8",
                                        borderRadius: 10
                                    }
                                ]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { position: "bottom" } },
                                scales: {
                                    x: { grid: { display: false } },
                                    y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: "#f8e1e8" } }
                                }
                            }
                        });
                    }
                }
            });

        fetch("/posts/listar?idUsuario=" + usuario.id)
            .then(function (res) { return res.json(); })
            .then(function (posts) {
                var tabela = document.querySelector(".tabela");
                var inpBusca = document.getElementById("dash-busca-posts");
                var listaPosts = (Array.isArray(posts) ? posts : []).filter(function (p) {
                    return String(p.categoria || "").indexOf("História:") !== 0;
                });

                atualizarTermometroLocal(listaPosts.length);

                // Calcula também o Post Mais Amado pelo cliente caso o servidor não tenha retornado
                if (listaPosts.length > 0) {
                    var ordenadoPorAmor = listaPosts.slice().sort(function (a, b) {
                        var engA = Number(a.totalCurtidas || 0) + Number(a.totalComentarios || 0);
                        var engB = Number(b.totalCurtidas || 0) + Number(b.totalComentarios || 0);
                        return engB - engA;
                    });
                    renderizarPostDestaque(ordenadoPorAmor[0]);
                } else {
                    renderizarPostDestaque(null);
                }

                if (!tabela) return;

                function desenharTabela(termo) {
                    var filtro = String(termo || "").trim().toLowerCase();
                    var filtrados = listaPosts.filter(function (p) {
                        if (!filtro) return true;
                        return (
                            String(p.titulo || "").toLowerCase().indexOf(filtro) !== -1 ||
                            String(p.autor || "").toLowerCase().indexOf(filtro) !== -1 ||
                            String(p.categoria || "").toLowerCase().indexOf(filtro) !== -1
                        );
                    });

                    if (filtrados.length === 0) {
                        tabela.innerHTML = '<div class="empty-state"><p>Nenhum post encontrado para este filtro.</p></div>';
                        return;
                    }

                    tabela.innerHTML =
                        '<div class="tr th"><div>Post / Lembrança</div><div>Data e Categoria</div><div>Interações</div><div>Ações</div></div>' +
                        filtrados.slice(0, 8).map(function (p) {
                            var thumbHtml = p.foto
                                ? '<div class="ph" style="background-image:url(\'' + p.foto + '\');background-size:cover;background-position:center;"></div>'
                                : '<div class="ph ph-' + ((Number(p.id) % 6) + 1) + '"></div>';
                            return (
                                '<div class="tr">' +
                                    '<div class="item">' +
                                        thumbHtml +
                                        '<div>' +
                                            '<a href="lembranca.html?id=' + p.id + '" class="serif" style="color:var(--vinho);font-weight:700;">' + esc(p.titulo) + '</a>' +
                                            '<span class="muted">Por ' + esc(p.autor) + '</span>' +
                                        '</div>' +
                                    '</div>' +
                                    '<div>' + esc(p.dataFormatada || formatarDataBR(p.data)) + '<br><span class="tag">' + esc(p.categoria) + '</span></div>' +
                                    '<div>' +
                                        '<span class="dash-interaction-pill">❤️ ' + (p.totalCurtidas || 0) + '</span>' +
                                        '<span class="dash-interaction-pill">💬 ' + (p.totalComentarios || 0) + '</span>' +
                                    '</div>' +
                                    '<div class="acoes">' +
                                        '<a href="lembranca.html?id=' + p.id + '" title="Ver post">👁</a>' +
                                        '<a href="nova-lembranca.html?id=' + p.id + '" title="Editar">✎</a>' +
                                        '<button type="button" data-delete-post="' + p.id + '" data-title="' + esc(p.titulo) + '" title="Excluir">🗑</button>' +
                                    '</div>' +
                                '</div>'
                            );
                        }).join("");
                }

                desenharTabela("");

                if (inpBusca) {
                    inpBusca.addEventListener("input", function () {
                        desenharTabela(inpBusca.value);
                    });
                }
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

        var btnTrocarFoto = document.getElementById("btn-trocar-foto-perfil");
        var btnRemoverFoto = document.getElementById("btn-remover-foto-perfil");
        var inpFotoPerfil = document.getElementById("input-foto-perfil");
        var avatarPreview = document.getElementById("profile-avatar-preview");
        var chaveFoto = "FOTO_PERFIL_" + usuario.id;

        function atualizarBotoesFoto() {
            var temFoto = Boolean(localStorage.getItem(chaveFoto));
            if (btnRemoverFoto) btnRemoverFoto.hidden = !temFoto;
        }

        atualizarBotoesFoto();

        if (btnTrocarFoto && inpFotoPerfil) {
            btnTrocarFoto.addEventListener("click", function () {
                inpFotoPerfil.click();
            });
        }

        if (avatarPreview && inpFotoPerfil) {
            avatarPreview.addEventListener("click", function () {
                inpFotoPerfil.click();
            });
        }

        if (btnRemoverFoto) {
            btnRemoverFoto.addEventListener("click", function () {
                localStorage.removeItem(chaveFoto);
                atualizarInterfaceUsuario();
                atualizarBotoesFoto();
                exibirMensagem("Foto de perfil removida.", false);
            });
        }

        if (inpFotoPerfil) {
            inpFotoPerfil.addEventListener("change", function () {
                var arq = inpFotoPerfil.files && inpFotoPerfil.files[0];
                if (!arq) return;
                if (arq.size > 5 * 1024 * 1024) {
                    exibirMensagem("A foto deve ter no máximo 5 MB.", true);
                    return;
                }

                var reader = new FileReader();
                reader.onload = function (ev) {
                    var dataUrl = ev.target.result;
                    localStorage.setItem(chaveFoto, dataUrl);
                    atualizarInterfaceUsuario();
                    atualizarBotoesFoto();
                };
                reader.readAsDataURL(arq);

                var formData = new FormData();
                formData.append("foto", arq);
                fetch("/usuarios/perfil/" + usuario.id + "/foto", {
                    method: "POST",
                    body: formData
                })
                    .then(function (res) { return res.json(); })
                    .then(function (dados) {
                        if (dados && dados.foto) {
                            localStorage.setItem(chaveFoto, dados.foto);
                            atualizarInterfaceUsuario();
                            atualizarBotoesFoto();
                        }
                        exibirMensagem("Foto de perfil atualizada com sucesso! ♡", false);
                    })
                    .catch(function () {
                        exibirMensagem("Foto de perfil atualizada! ♡", false);
                    });
            });
        }

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

    function configurarNossaHistoria() {
        if (paginaAtual !== "nossa-historia.html") return;

        var usuario = obterUsuario();
        var secaoForm = document.getElementById("historia-form-section");
        var formHistoria = document.getElementById("historia-form");
        var containerCards = document.getElementById("timeline-custom-cards");
        var inputData = document.getElementById("historia-data");
        var chaveStorage = "CAPITULOS_NOSSA_HISTORIA";

        if (secaoForm && usuario) {
            secaoForm.removeAttribute("hidden");
            if (inputData && !inputData.value) {
                inputData.value = new Date().toISOString().slice(0, 10);
            }
        }

        function obterCapitulosLocais() {
            try {
                var bruto = localStorage.getItem(chaveStorage);
                var lista = bruto ? JSON.parse(bruto) : [];
                return Array.isArray(lista) ? lista : [];
            } catch (e) {
                return [];
            }
        }

        function salvarCapitulosLocais(lista) {
            try {
                localStorage.setItem(chaveStorage, JSON.stringify(lista));
            } catch (e) {
                console.error("Erro ao salvar no localStorage:", e);
            }
        }

        function criarHtmlCardHistoria(cap) {
            var podeExcluir = Boolean(usuario);
            return (
                '<article class="timeline-item" data-historia-id="' + esc(cap.id) + '" data-post-id="' + esc(cap.postId || "") + '">' +
                    '<div class="timeline-head">' +
                        '<span class="tag">' + esc(cap.etiqueta || "Novo Capítulo ♡") + '</span>' +
                        (podeExcluir
                            ? '<button type="button" class="btn-delete-timeline" data-del-historia="' + esc(cap.id) + '" data-post-id="' + esc(cap.postId || "") + '" title="Excluir este capítulo">🗑 Excluir</button>'
                            : '') +
                    '</div>' +
                    '<h3 style="margin: 10px 0 6px;">' + esc(cap.titulo) + '</h3>' +
                    '<p style="white-space: pre-wrap;">' + esc(cap.descricao) + '</p>' +
                '</article>'
            );
        }

        function renderizarCapitulos(listaBanco) {
            if (!containerCards) return;
            var locais = obterCapitulosLocais();
            var combinados = locais.slice();

            if (Array.isArray(listaBanco)) {
                listaBanco.forEach(function (p) {
                    if (String(p.categoria || "").indexOf("História:") === 0) {
                        var jaExiste = combinados.some(function (c) {
                            return Number(c.postId) === Number(p.id) || (c.titulo === p.titulo && c.data === p.data);
                        });
                        if (!jaExiste) {
                            combinados.push({
                                id: "db-" + p.id,
                                postId: p.id,
                                etiqueta: p.categoria.replace(/^História:\s*/, "") || "Nosso Capítulo",
                                titulo: p.titulo,
                                descricao: p.descricao,
                                data: p.data,
                                dataFormatada: p.dataFormatada,
                                autor: p.autor
                            });
                        }
                    }
                });
            }

            containerCards.innerHTML = combinados.map(criarHtmlCardHistoria).join("");
        }

        function carregarCapitulos() {
            renderizarCapitulos([]);
            fetch("/posts/listar?idUsuario=" + (usuario ? usuario.id : 0))
                .then(function (res) { return res.json(); })
                .then(function (posts) {
                    if (Array.isArray(posts)) {
                        renderizarCapitulos(posts);
                    }
                })
                .catch(function () {
                    renderizarCapitulos([]);
                });
        }

        carregarCapitulos();

        if (formHistoria) {
            formHistoria.addEventListener("submit", function (e) {
                e.preventDefault();
                if (!usuario) {
                    window.location.href = "login.html";
                    return;
                }

                var etiqueta = document.getElementById("historia-etiqueta").value.trim();
                var dataEl = document.getElementById("historia-data");
                var data = (dataEl && dataEl.value) ? dataEl.value : new Date().toISOString().slice(0, 10);
                var titulo = document.getElementById("historia-titulo").value.trim();
                var descricao = document.getElementById("historia-descricao").value.trim();

                if (!etiqueta || !titulo || !descricao) {
                    exibirMensagem("Preencha todos os campos para adicionar o card!", true, "#historia-message");
                    return;
                }

                var novoCap = {
                    id: "cap-" + Date.now(),
                    postId: null,
                    etiqueta: etiqueta,
                    titulo: titulo,
                    descricao: descricao,
                    data: data,
                    dataFormatada: formatarDataBR(data),
                    autor: usuario.nome
                };

                fetch("/posts/publicar", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        idUsuario: usuario.id,
                        titulo: titulo,
                        descricao: descricao,
                        data: data,
                        categoria: ("História: " + etiqueta).slice(0, 50),
                        privado: 0,
                        foto: null
                    })
                })
                    .then(function (res) { return res.json(); })
                    .then(function (dados) {
                        if (dados && dados.id) {
                            novoCap.postId = dados.id;
                        }
                    })
                    .catch(function () {})
                    .finally(function () {
                        var atuais = obterCapitulosLocais();
                        atuais.push(novoCap);
                        salvarCapitulosLocais(atuais);

                        formHistoria.reset();
                        if (inputData) inputData.value = new Date().toISOString().slice(0, 10);
                        exibirMensagem("Novo capítulo adicionado à Nossa História! ♡", false, "#historia-message");
                        carregarCapitulos();
                    });
            });
        }

        document.addEventListener("click", function (e) {
            var btnDel = e.target.closest("[data-del-historia]");
            if (!btnDel) return;

            var idCap = btnDel.getAttribute("data-del-historia");
            var idPostBanco = btnDel.getAttribute("data-post-id");

            if (!confirm("Deseja remover este card da Nossa História?")) return;

            var atuais = obterCapitulosLocais().filter(function (c) {
                return String(c.id) !== String(idCap);
            });
            salvarCapitulosLocais(atuais);

            if (idPostBanco && usuario) {
                fetch("/posts/deletar/" + idPostBanco + "?idUsuario=" + usuario.id, {
                    method: "DELETE"
                }).finally(function () {
                    carregarCapitulos();
                });
            } else {
                carregarCapitulos();
            }
        });
    }

    function soltarChuvaDeCoracoes() {
        var simbolos = ["💖", "♡", "❤️", "✨", "🌷"];
        for (var i = 0; i < 16; i++) {
            (function (idx) {
                setTimeout(function () {
                    var el = document.createElement("span");
                    el.className = "coracao-particula";
                    el.textContent = simbolos[idx % simbolos.length];
                    el.style.left = (10 + Math.random() * 80) + "vw";
                    document.body.appendChild(el);
                    setTimeout(function () { el.remove(); }, 2500);
                }, idx * 80);
            })(i);
        }
    }

    /* 1. Contador de Tempo Juntos ao Vivo */
    function configurarContadorAmor() {
        var elDias = document.getElementById("cnt-dias");
        var elHoras = document.getElementById("cnt-horas");
        var elMin = document.getElementById("cnt-minutos");
        var elSeg = document.getElementById("cnt-segundos");
        if (!elDias || !elHoras || !elMin || !elSeg) return;

        var chaveData = "DATA_INICIO_AMOR_GIOVANA";
        var dataSalva = localStorage.getItem(chaveData) || "2025-06-12";
        var usuario = obterUsuario();
        var wrapConfig = document.getElementById("contador-config-wrap");
        var inpData = document.getElementById("input-data-inicio-amor");

        if (wrapConfig && usuario) {
            wrapConfig.removeAttribute("hidden");
        }
        if (inpData) {
            inpData.value = dataSalva;
            inpData.addEventListener("change", function () {
                if (inpData.value) {
                    dataSalva = inpData.value;
                    localStorage.setItem(chaveData, dataSalva);
                    atualizarRelogio();
                }
            });
        }

        function pad2(n) {
            return n < 10 ? "0" + n : String(n);
        }

        function atualizarRelogio() {
            var inicio = new Date(dataSalva + "T00:00:00");
            var agora = new Date();
            var diffMs = Math.max(0, agora.getTime() - inicio.getTime());
            var totalSeg = Math.floor(diffMs / 1000);

            var dias = Math.floor(totalSeg / 86400);
            var horas = Math.floor((totalSeg % 86400) / 3600);
            var minutos = Math.floor((totalSeg % 3600) / 60);
            var segundos = totalSeg % 60;

            elDias.textContent = dias;
            elHoras.textContent = pad2(horas);
            elMin.textContent = pad2(minutos);
            elSeg.textContent = pad2(segundos);
        }

        atualizarRelogio();
        setInterval(atualizarRelogio, 1000);
    }

    /* Cards de Qualidades + Declaração sobre ela (Sobre a Giovana) */
    function configurarSobreGiovana() {
        if (paginaAtual !== "sobre.html") return;

        var usuario = obterUsuario();

        /* --- Adicionar Cards em "Pequenos detalhes que eu amo na Giovana" --- */
        var secaoQualForm = document.getElementById("qualidade-form-section");
        var formQual = document.getElementById("qualidade-form");
        var containerQual = document.getElementById("qualidades-custom-cards");
        var chaveQual = "QUALIDADES_CUSTOM_GIOVANA";

        if (secaoQualForm && usuario) {
            secaoQualForm.removeAttribute("hidden");
        }

        function obterQualidadesLocais() {
            try {
                var lista = JSON.parse(localStorage.getItem(chaveQual) || "[]");
                return Array.isArray(lista) ? lista : [];
            } catch (e) {
                return [];
            }
        }

        function salvarQualidadesLocais(lista) {
            localStorage.setItem(chaveQual, JSON.stringify(lista));
        }

        function renderizarQualidades() {
            if (!containerQual) return;
            var lista = obterQualidadesLocais();
            containerQual.innerHTML = lista.map(function (q) {
                return (
                    '<div class="qualidade-card" data-qual-id="' + esc(q.id) + '">' +
                        '<div class="qualidade-icon">' + esc(q.icone || "💖") + '</div>' +
                        '<h3>' + esc(q.titulo) + '</h3>' +
                        '<p class="muted" style="margin-top: 8px;">' + esc(q.descricao) + '</p>' +
                        (usuario
                            ? '<div style="margin-top: 14px;"><button type="button" class="btn-delete-timeline" data-del-qualidade="' + esc(q.id) + '">🗑 Excluir</button></div>'
                            : '') +
                    '</div>'
                );
            }).join("");
        }

        renderizarQualidades();

        if (formQual) {
            formQual.addEventListener("submit", function (e) {
                e.preventDefault();
                var icone = document.getElementById("qual-icone").value || "💖";
                var titulo = document.getElementById("qual-titulo").value.trim();
                var descricao = document.getElementById("qual-descricao").value.trim();
                if (!titulo || !descricao) return;

                var atuais = obterQualidadesLocais();
                atuais.push({
                    id: "qual-" + Date.now(),
                    icone: icone,
                    titulo: titulo,
                    descricao: descricao
                });
                salvarQualidadesLocais(atuais);
                formQual.reset();
                exibirMensagem("Novo card adicionado com carinho! ♡", false, "#qual-message");
                renderizarQualidades();
                soltarChuvaDeCoracoes();
            });
        }

        document.addEventListener("click", function (e) {
            var btnDelQ = e.target.closest("[data-del-qualidade]");
            if (!btnDelQ) return;
            var idQ = btnDelQ.getAttribute("data-del-qualidade");
            if (!confirm("Deseja remover este card?")) return;
            var filtrados = obterQualidadesLocais().filter(function (q) {
                return String(q.id) !== String(idQ);
            });
            salvarQualidadesLocais(filtrados);
            renderizarQualidades();
        });

        /* --- Parte específica para falar sobre a Giovana (Carta Editável) --- */
        var chaveSobreEla = "TEXTO_SOBRE_GIOVANA";
        var padraoSobreEla = {
            titulo: "Quem é a Giovana pelos meus olhos ♡",
            texto:
                "Falar sobre a Giovana é falar sobre a pessoa que trouxe mais cor, calma e sentido para os meus dias. Ela tem aquele jeito único de transformar momentos simples em memórias inesquecíveis, sempre com um olhar doce, uma risada que contagia qualquer ambiente e um coração que não cabe no peito.\n\n" +
                "Admiro a força, a dedicação e a sensibilidade com que ela encara a vida. Estar ao lado dela me faz querer evoluir todos os dias, porque a Giovana inspira amor, parceria de verdade e a certeza de que encontrei a pessoa certa para dividir todos os sonhos.",
            assinatura: "Com todo o meu amor e admiração, sempre seu ♡"
        };

        function obterDadosSobreEla() {
            try {
                var salvo = JSON.parse(localStorage.getItem(chaveSobreEla) || "null");
                if (salvo && typeof salvo === "object") {
                    return {
                        titulo: salvo.titulo || padraoSobreEla.titulo,
                        texto: salvo.texto || padraoSobreEla.texto,
                        assinatura: salvo.assinatura || padraoSobreEla.assinatura
                    };
                }
            } catch (e) {}
            return padraoSobreEla;
        }

        var elSobreTitulo = document.getElementById("sobre-ela-titulo");
        var elSobreParagrafos = document.getElementById("sobre-ela-paragrafos");
        var elSobreAssinatura = document.getElementById("sobre-ela-assinatura");

        var btnEditarSobre = document.getElementById("btn-editar-sobre-ela");
        var btnCancelarSobre = document.getElementById("btn-cancelar-sobre-ela");
        var viewSobre = document.getElementById("sobre-ela-view");
        var formSobre = document.getElementById("form-sobre-ela");

        function renderizarSobreEla() {
            var d = obterDadosSobreEla();
            if (elSobreTitulo) elSobreTitulo.textContent = d.titulo;
            if (elSobreParagrafos) {
                var blocos = String(d.texto || "").split(/\n\s*\n/).filter(Boolean);
                elSobreParagrafos.innerHTML = blocos.map(function (par) {
                    return '<p style="white-space: pre-wrap;">' + esc(par.trim()) + '</p>';
                }).join("");
            }
            if (elSobreAssinatura) elSobreAssinatura.textContent = d.assinatura;
        }

        renderizarSobreEla();

        if (btnEditarSobre && usuario) {
            btnEditarSobre.removeAttribute("hidden");
            btnEditarSobre.addEventListener("click", function () {
                var d = obterDadosSobreEla();
                document.getElementById("inp-sobre-titulo").value = d.titulo;
                document.getElementById("inp-sobre-texto").value = d.texto;
                document.getElementById("inp-sobre-assinatura").value = d.assinatura;

                if (viewSobre) viewSobre.hidden = true;
                if (formSobre) formSobre.removeAttribute("hidden");
                btnEditarSobre.hidden = true;
            });
        }

        if (btnCancelarSobre) {
            btnCancelarSobre.addEventListener("click", function () {
                if (formSobre) formSobre.hidden = true;
                if (viewSobre) viewSobre.removeAttribute("hidden");
                if (btnEditarSobre && usuario) btnEditarSobre.removeAttribute("hidden");
            });
        }

        if (formSobre) {
            formSobre.addEventListener("submit", function (e) {
                e.preventDefault();
                var novosDados = {
                    titulo: document.getElementById("inp-sobre-titulo").value.trim(),
                    texto: document.getElementById("inp-sobre-texto").value.trim(),
                    assinatura: document.getElementById("inp-sobre-assinatura").value.trim()
                };
                localStorage.setItem(chaveSobreEla, JSON.stringify(novosDados));
                renderizarSobreEla();
                formSobre.hidden = true;
                if (viewSobre) viewSobre.removeAttribute("hidden");
                if (btnEditarSobre && usuario) btnEditarSobre.removeAttribute("hidden");
                exibirMensagem("Declaração sobre a Giovana atualizada com sucesso! ♡", false);
                soltarChuvaDeCoracoes();
            });
        }
    }

    /* 3. Player Flutuante da "Nossa Música" (Caixinha de Música Romântica em Web Audio API) */
    function configurarPlayerMusica() {
        var paginasPublicas = ["index.html", "", "sobre.html", "nossa-historia.html", "publicacoes.html"];
        if (paginasPublicas.indexOf(paginaAtual) === -1) return;
        if (document.getElementById("music-player-pill")) return;

        var pill = document.createElement("div");
        pill.id = "music-player-pill";
        pill.className = "music-player-pill";
        pill.innerHTML =
            '<button type="button" class="music-btn-toggle" id="btn-toggle-music" title="Tocar ou pausar nossa melodia" aria-label="Tocar ou pausar nossa melodia">▶</button>' +
            '<div class="music-info">' +
                '<span class="music-title">🎶 Nossa Melodia ♡</span>' +
                '<span class="music-sub" id="music-status-text">Clique para tocar</span>' +
            '</div>';
        document.body.appendChild(pill);

        /* Para de descer ao encostar no footer para não invadir o rodapé */
        var footerEl = document.querySelector(".site-footer");
        function ajustarPosicaoPlayerNoFooter() {
            if (!footerEl) return;
            var rect = footerEl.getBoundingClientRect();
            var alturaJanela = window.innerHeight;
            var margemBase = 24;
            if (rect.top < alturaJanela) {
                var invasao = alturaJanela - rect.top;
                pill.style.bottom = (margemBase + invasao + 16) + "px";
            } else {
                pill.style.bottom = margemBase + "px";
            }
        }
        window.addEventListener("scroll", ajustarPosicaoPlayerNoFooter, { passive: true });
        window.addEventListener("resize", ajustarPosicaoPlayerNoFooter, { passive: true });
        ajustarPosicaoPlayerNoFooter();

        var btn = document.getElementById("btn-toggle-music");
        var statusTxt = document.getElementById("music-status-text");
        var audioCtx = null;
        var timerMelodia = null;
        var tocando = false;
        var passoNota = 0;

        /* Arpejo suave estilo caixinha de música romântica (Fá maior / Ré menor / Sib / Dó) */
        var notasHz = [
            349.23, 440.00, 523.25, 698.46, 523.25, 440.00,
            293.66, 440.00, 587.33, 698.46, 587.33, 440.00,
            233.08, 349.23, 466.16, 587.33, 466.16, 349.23,
            261.63, 392.00, 523.25, 659.25, 523.25, 392.00
        ];

        function tocarNotaSuave(freq) {
            if (!audioCtx) return;
            var agora = audioCtx.currentTime;
            var osc = audioCtx.createOscillator();
            var gain = audioCtx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, agora);

            gain.gain.setValueAtTime(0.001, agora);
            gain.gain.exponentialRampToValueAtTime(0.08, agora + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.0008, agora + 1.1);

            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(agora);
            osc.stop(agora + 1.15);
        }

        btn.addEventListener("click", function () {
            if (!tocando) {
                var AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (!AudioContextClass) return;
                if (!audioCtx) audioCtx = new AudioContextClass();
                if (audioCtx.state === "suspended") audioCtx.resume();

                tocando = true;
                pill.classList.add("tocando");
                btn.textContent = "⏸";
                if (statusTxt) statusTxt.textContent = "Tocando para Giovana ♡";

                tocarNotaSuave(notasHz[passoNota % notasHz.length]);
                passoNota++;
                timerMelodia = setInterval(function () {
                    tocarNotaSuave(notasHz[passoNota % notasHz.length]);
                    passoNota++;
                }, 420);
            } else {
                tocando = false;
                pill.classList.remove("tocando");
                btn.textContent = "▶";
                if (statusTxt) statusTxt.textContent = "Pausado · Clique para ouvir";
                if (timerMelodia) {
                    clearInterval(timerMelodia);
                    timerMelodia = null;
                }
            }
        });
    }

    /* 4. Lista de "Nossos Próximos Sonhos / Bucket List do Casal" (Nossa História) */
    function configurarBucketListSonhos() {
        if (paginaAtual !== "nossa-historia.html") return;

        var containerSonhos = document.getElementById("sonhos-list");
        var formSonho = document.getElementById("sonho-form");
        var barraFill = document.getElementById("sonhos-barra-fill");
        var textoProgresso = document.getElementById("sonhos-progresso-texto");
        if (!containerSonhos) return;

        var usuario = obterUsuario();
        var chaveSonhos = "SONHOS_CASAL_GIOVANA";

        var sonhosIniciais = [
            { id: "s1", titulo: "Fazer uma viagem inesquecível só nós dois", realizado: true },
            { id: "s2", titulo: "Assistir ao pôr do sol em um lugar especial", realizado: true },
            { id: "s3", titulo: "Comemorar muitas datas especiais lado a lado", realizado: true },
            { id: "s4", titulo: "Conhecer um destino dos nossos sonhos juntos", realizado: false },
            { id: "s5", titulo: "Cozinhar um jantar romântico completo a dois", realizado: false },
            { id: "s6", titulo: "Construir um álbum cheio de memórias para o futuro", realizado: false }
        ];

        if (formSonho && usuario) {
            formSonho.removeAttribute("hidden");
        }

        function obterSonhos() {
            try {
                var salvos = JSON.parse(localStorage.getItem(chaveSonhos) || "null");
                if (Array.isArray(salvos) && salvos.length > 0) return salvos;
            } catch (e) {}
            localStorage.setItem(chaveSonhos, JSON.stringify(sonhosIniciais));
            return sonhosIniciais.slice();
        }

        function salvarSonhos(lista) {
            localStorage.setItem(chaveSonhos, JSON.stringify(lista));
        }

        function renderizarSonhos() {
            var lista = obterSonhos();
            var realizados = lista.filter(function (s) { return Boolean(s.realizado); }).length;
            var pct = lista.length > 0 ? Math.round((realizados / lista.length) * 100) : 0;

            if (barraFill) barraFill.style.width = pct + "%";
            if (textoProgresso) {
                textoProgresso.textContent = realizados + " de " + lista.length + " realizados (" + pct + "%) ♡";
            }

            containerSonhos.innerHTML = lista.map(function (s) {
                return (
                    '<div class="sonho-card ' + (s.realizado ? "realizado" : "") + '">' +
                        '<label class="sonho-check-label">' +
                            '<input type="checkbox" data-toggle-sonho="' + esc(s.id) + '" ' + (s.realizado ? "checked" : "") + ' />' +
                            '<span class="sonho-texto">' + esc(s.titulo) + '</span>' +
                        '</label>' +
                        '<div style="display:flex;align-items:center;gap:8px;">' +
                            '<span class="sonho-status-tag">' + (s.realizado ? "✓ Realizado ♡" : "Em breve...") + '</span>' +
                            (usuario
                                ? '<button type="button" class="btn-delete-timeline" data-del-sonho="' + esc(s.id) + '" title="Remover sonho">×</button>'
                                : '') +
                        '</div>' +
                    '</div>'
                );
            }).join("");
        }

        renderizarSonhos();

        if (formSonho) {
            formSonho.addEventListener("submit", function (e) {
                e.preventDefault();
                var inp = document.getElementById("sonho-novo-titulo");
                var titulo = inp ? inp.value.trim() : "";
                if (!titulo) return;

                var lista = obterSonhos();
                lista.push({
                    id: "sonho-" + Date.now(),
                    titulo: titulo,
                    realizado: false
                });
                salvarSonhos(lista);
                inp.value = "";
                renderizarSonhos();
            });
        }

        containerSonhos.addEventListener("change", function (e) {
            var chk = e.target.closest("[data-toggle-sonho]");
            if (!chk) return;
            var idS = chk.getAttribute("data-toggle-sonho");
            var lista = obterSonhos();
            var marcouRealizado = false;
            lista.forEach(function (s) {
                if (String(s.id) === String(idS)) {
                    s.realizado = chk.checked;
                    if (s.realizado) marcouRealizado = true;
                }
            });
            salvarSonhos(lista);
            renderizarSonhos();
            if (marcouRealizado) soltarChuvaDeCoracoes();
        });

        containerSonhos.addEventListener("click", function (e) {
            var btnDel = e.target.closest("[data-del-sonho]");
            if (!btnDel) return;
            var idS = btnDel.getAttribute("data-del-sonho");
            var lista = obterSonhos().filter(function (s) {
                return String(s.id) !== String(idS);
            });
            salvarSonhos(lista);
            renderizarSonhos();
        });
    }

    /* 5. Lugares que Queremos Ir Juntos (Nossa História) */
    function configurarLugaresCasal() {
        if (paginaAtual !== "nossa-historia.html") return;

        var containerLugares = document.getElementById("lugares-list");
        var secaoFormLugares = document.getElementById("lugares-form-section");
        var formLugar = document.getElementById("lugar-form");
        if (!containerLugares) return;

        var usuario = obterUsuario();
        var chaveLugares = "LUGARES_CASAL_GIOVANA";

        var lugaresIniciais = [
            {
                id: "lug-1",
                nome: "Campos do Jordão",
                tipo: "✈️ Viagem",
                nota: "Curtir o friozinho juntos, tomar chocolate quente e passear de mãos dadas.",
                visitado: false
            },
            {
                id: "lug-2",
                nome: "Jantar à Luz de Velas",
                tipo: "🍝 Restaurante / Café",
                nota: "Conhecer um restaurante especial para comemorar mais um capítulo do nosso amor.",
                visitado: false
            },
            {
                id: "lug-3",
                nome: "Praia ao Pôr do Sol",
                tipo: "🏖️ Praia / Natureza",
                nota: "Ver o sol se pôr no mar, caminhar na areia e guardar novas fotografias para o mural.",
                visitado: false
            }
        ];

        if (secaoFormLugares && usuario) {
            secaoFormLugares.removeAttribute("hidden");
        }

        function obterLugares() {
            try {
                var bruto = localStorage.getItem(chaveLugares);
                if (bruto) {
                    var parsed = JSON.parse(bruto);
                    if (Array.isArray(parsed)) return parsed;
                }
            } catch (e) {}
            return lugaresIniciais.slice();
        }

        function salvarLugares(lista) {
            localStorage.setItem(chaveLugares, JSON.stringify(lista));
        }

        function renderizarLugares() {
            var lista = obterLugares();
            containerLugares.innerHTML = lista.map(function (l) {
                return (
                    '<article class="lugar-card ' + (l.visitado ? 'visitado' : '') + '" data-lugar-id="' + esc(l.id) + '">' +
                        '<div>' +
                            '<div class="lugar-card-top">' +
                                '<span class="tag">' + esc(l.tipo || "✈️ Destino") + '</span>' +
                                (usuario
                                    ? '<button type="button" class="btn-delete-timeline" data-del-lugar="' + esc(l.id) + '" title="Remover lugar">🗑</button>'
                                    : '') +
                            '</div>' +
                            '<h3>' + esc(l.nome) + '</h3>' +
                            '<p>' + esc(l.nota) + '</p>' +
                        '</div>' +
                        '<div class="lugar-card-footer">' +
                            '<button type="button" class="lugar-status-btn" data-toggle-lugar="' + esc(l.id) + '">' +
                                (l.visitado ? '✓ Já fomos juntos! ♡' : '📍 Queremos ir ♡') +
                            '</button>' +
                        '</div>' +
                    '</article>'
                );
            }).join("");
        }

        renderizarLugares();

        if (formLugar) {
            formLugar.addEventListener("submit", function (e) {
                e.preventDefault();
                var nome = document.getElementById("lugar-nome").value.trim();
                var tipo = document.getElementById("lugar-tipo").value;
                var nota = document.getElementById("lugar-nota").value.trim();
                if (!nome || !nota) return;

                var lista = obterLugares();
                lista.push({
                    id: "lug-" + Date.now(),
                    nome: nome,
                    tipo: tipo,
                    nota: nota,
                    visitado: false
                });
                salvarLugares(lista);
                formLugar.reset();
                renderizarLugares();
                soltarChuvaDeCoracoes();
            });
        }

        containerLugares.addEventListener("click", function (e) {
            var btnToggle = e.target.closest("[data-toggle-lugar]");
            if (btnToggle) {
                var idL = btnToggle.getAttribute("data-toggle-lugar");
                var lista = obterLugares();
                var marcouVisitado = false;
                lista.forEach(function (l) {
                    if (String(l.id) === String(idL)) {
                        l.visitado = !l.visitado;
                        if (l.visitado) marcouVisitado = true;
                    }
                });
                salvarLugares(lista);
                renderizarLugares();
                if (marcouVisitado) soltarChuvaDeCoracoes();
                return;
            }

            var btnDel = e.target.closest("[data-del-lugar]");
            if (btnDel) {
                var idDel = btnDel.getAttribute("data-del-lugar");
                if (!confirm("Deseja remover este lugar da lista?")) return;
                var filtrados = obterLugares().filter(function (l) {
                    return String(l.id) !== String(idDel);
                });
                salvarLugares(filtrados);
                renderizarLugares();
            }
        });
    }

    function configurarLightboxFotos() {
        document.addEventListener("click", function (e) {
            var gatilho = e.target.closest("[data-lightbox-src]");
            if (!gatilho) return;

            var src = gatilho.getAttribute("data-lightbox-src");
            var legenda = gatilho.getAttribute("data-lightbox-caption") || "Nossa lembrança ♡";
            if (!src) return;

            var modal = document.getElementById("lightbox-modal-polaroid");
            if (!modal) {
                modal = document.createElement("div");
                modal.id = "lightbox-modal-polaroid";
                modal.className = "lightbox-modal";
                modal.innerHTML =
                    '<div class="lightbox-polaroid">' +
                        '<button type="button" class="lightbox-close" aria-label="Fechar foto">&times;</button>' +
                        '<img id="lightbox-img" src="" alt="" />' +
                        '<div class="lightbox-caption" id="lightbox-caption"></div>' +
                    '</div>';
                document.body.appendChild(modal);

                modal.addEventListener("click", function (ev) {
                    if (ev.target === modal || ev.target.closest(".lightbox-close")) {
                        modal.classList.remove("aberto");
                    }
                });

                document.addEventListener("keydown", function (ev) {
                    if (ev.key === "Escape") modal.classList.remove("aberto");
                });
            }

            document.getElementById("lightbox-img").src = src;
            document.getElementById("lightbox-caption").textContent = legenda + " ♡";
            modal.classList.add("aberto");
        });
    }

    atualizarInterfaceUsuario();
    configurarAutenticacao();
    configurarFeedPublico();
    configurarMinhasLembrancas();
    configurarCriarEditarPost();
    configurarDetalhePost();
    configurarDashboard();
    configurarPerfil();
    configurarNossaHistoria();
    configurarContadorAmor();
    configurarSobreGiovana();
    configurarPlayerMusica();
    configurarBucketListSonhos();
    configurarLugaresCasal();
    configurarLightboxFotos();
})();
