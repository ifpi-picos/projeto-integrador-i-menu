const webservice = "https://imenu-backend-yp5c.onrender.com";

// Criar usuário
async function criaruser() {
    var nome = document.getElementById("nome").value;
    var email = document.getElementById("email").value;
    var senha = document.getElementById("senha").value;
    var dono = document.getElementById("dono").checked;

    const novoUsuario = {
        name: nome,
        email: email,
        password: senha,
        dono: dono
    };

    try {
        const response = await fetch(webservice + "/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(novoUsuario)
        });

        const data = await response.json();

        if (response.ok) {
            alert("Usuário criado com sucesso!");
            window.location.href = "./login.html";
        } else {
            alert("Erro ao criar usuário: " + (data.message || "Erro desconhecido"));
        }
    } catch (err) {
        alert("Erro ao criar usuário: " + err.message);
    }
}

// Login de usuário
async function logar() {
    var email = document.getElementById("email").value;
    var senha = document.getElementById("senha").value;

    const usuario = { email: email, password: senha };

    try {
        const response = await fetch(webservice + "/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(usuario)
        });

        const data = await response.json();

        if (response.ok) {
            alert("Usuário logado com sucesso!");
            localStorage.setItem('auth_token', data.token);
            verificarToken();
            window.location.href = "./index.html";
        } else {
            alert("Erro ao logar: " + (data.message || "Erro desconhecido"));
        }
    } catch (err) {
        alert("Erro ao logar: " + err.message);
    }
}

// Verificar token e atualizar UI
async function verificarToken() {
    const token = localStorage.getItem("auth_token");
    const conta = document.getElementById("perfil-link");
    const mapa = document.getElementById("mapaAba");
    const editor = document.getElementById("editorAba");
    const cadastrarB = document.getElementById("button-acount");
    const logarB = document.getElementById("button-enter");
    const publicar = document.getElementById("publicarAba");

    if (!token) {
        if (conta) conta.remove();
        if (mapa) mapa.remove();
        if (publicar) publicar.remove();
        if (editor) editor.remove();
        if (cadastrarB) cadastrarB.style.display = "block";
        if (logarB) logarB.style.display = "block";
        return;
    }

    try {
        const response = await fetch(webservice + "/dados", {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
            if (conta) conta.remove();
            if (mapa) mapa.remove();
            if (editor) editor.remove();
            if (publicar) publicar.remove();
        } else {
            const data = await response.json();

            if (window.location.pathname.includes("index.html")) {
                document.getElementById("username").innerText = data.name;
                if (data.foto) {
                    document.getElementById("perfil").src = data.foto;
                }

                if (data.dono) {
                    if (mapa) mapa.remove();
                    if (editor) editor.style.display = "flex";
                    if (publicar) {
                        publicar.style.display = "block";
                        publicar.onclick = () => window.location.href = "publicar.html";
                    }
                } else {
                    if (editor) editor.remove();
                    if (mapa) mapa.style.display = "flex";
                    if (publicar) publicar.remove();
                }
            }

            if (window.location.pathname.includes("perfil.html")) {
                document.getElementById("P-username").innerText = data.name;
                document.getElementById("spanP").innerText = data.dono ? "Dono de Restaurante" : "Cliente";

                if (data.dono) {
                    const localIcons = document.getElementsByClassName("localizacaoicon");
                    for (let i = 0; i < localIcons.length; i++) {
                        localIcons[i].remove();
                    }
                }
            }

            if (cadastrarB) cadastrarB.style.display = "none";
            if (logarB) logarB.style.display = "none";
        }
    } catch (err) {
        console.error("Erro ao buscar usuário:", err);
    }
}

async function VerEmail() {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    try {
        const response = await fetch(webservice + "/dados", {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.status === 403) {
            window.location.href = "./EmailnoVer.html";
        }

        if (window.location.pathname.includes("EmailnoVer.html") && response.status !== 403) {
            window.location.href = "./index.html";
        }

    } catch (err) {
        console.error("Erro ao verificar e-mail:", err);
    }
}

async function postar() {
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;
    const link = document.getElementById("linksocial").value;
    const publice = document.getElementById("public").checked;
    const capa = document.getElementById("linkimg").value;

    const novoPost = {
        title,
        content,
        sociallink: link,
        publice,
        capa
    };

    const token = localStorage.getItem("auth_token");

    try {
        const response = await fetch(`${webservice}/post`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(novoPost)
        });

        if (!response.ok) throw new Error(`Erro: ${response.statusText}`);

        const data = await response.json();
        alert("Post criado com sucesso!");
        window.location.href = "./index.html";
    } catch (err) {
        alert("Erro ao criar o post. Tente novamente.");
    }
}

async function carregarUltimosPosts() {
    try {
        const response = await fetch(`${webservice}/recent`);
        if (!response.ok) throw new Error(`Erro: ${response.statusText}`);

        const posts = await response.json();
        const postsContainer = document.getElementById("posts-recentes");

        if (postsContainer) {
            postsContainer.innerHTML = "";
            posts.forEach(post => {
                const postElement = document.createElement("div");
                postElement.className = "post-container";

                const postId = post.id || post._id;
                if (!postId) return;

                postElement.onclick = () => abrirPost(postId);

                if (post.capa) {
                    const imgContainer = document.createElement("div");
                    imgContainer.className = "post";
                    imgContainer.style.backgroundImage = `url('${post.capa}')`;
                    postElement.appendChild(imgContainer);
                }

                const infoContainer = document.createElement("div");
                infoContainer.className = "post-info";
                infoContainer.innerHTML = `
                    <p>${post.title}</p>
                    <p class="post-content">${post.content}</p>
                    <p>Autor: ${post.author?.name || 'Desconhecido'}</p>
                `;

                postElement.appendChild(infoContainer);
                postsContainer.appendChild(postElement);
            });
        }
    } catch (err) {
        alert("Erro ao carregar posts. Tente novamente.");
    }
}

// Abrir post completo
function abrirPost(postId) {
    if (!postId || postId === 'undefined') {
        alert('Erro: Post não encontrado');
        return;
    }
    window.location.href = `vizualizador.html?id=${postId}`;
}

// -----------------------------
// FUNÇÃO PARA SALVAR AVALIAÇÃO
// -----------------------------
async function salvarAvaliacao(postId, nota) {
    const token = localStorage.getItem("auth_token");
    if (!token) {
        alert("Você precisa estar logado para avaliar.");
        return;
    }

    try {
        const response = await fetch(`${webservice}/avaliar/${postId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ nota })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Avaliação salva com sucesso!");
        } else {
            alert("Erro ao salvar avaliação: " + (data.message || "Erro desconhecido"));
        }
    } catch (err) {
        alert("Erro ao salvar avaliação. Tente novamente.");
    }
}

// -----------------------------
// INICIALIZAÇÃO
// -----------------------------
window.onload = () => {
    verificarToken();
    setTimeout(VerEmail, 500);
    carregarUltimosPosts();
};

// -----------------------------
// FUNÇÃO PARA BUSCAR MÉDIA DE AVALIAÇÕES
// -----------------------------
async function buscarMediaAvaliacao(postId) {
    try {
        const response = await fetch(`${webservice}/avaliacoes/media/${postId}`);
        if (!response.ok) throw new Error("Erro ao buscar média");

        const data = await response.json();
        return data.media || 0;
    } catch (err) {
        console.error("Erro ao buscar média da avaliação:", err);
        return 0;
    }
}

// -----------------------------
// EXIBIR MÉDIA DE AVALIAÇÃO (para vizualizador.html)
// -----------------------------
async function carregarMediaPost() {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get("id");

    if (!postId) return;

    const media = await buscarMediaAvaliacao(postId);
    const mediaEl = document.getElementById("media-avaliacao");

    if (mediaEl) {
        mediaEl.innerText = `Média de avaliação: ${media.toFixed(1)} ★`;
    }
}

// -----------------------------
// INICIALIZAÇÃO
// -----------------------------
window.onload = () => {
    verificarToken();
    setTimeout(VerEmail, 500);
    carregarUltimosPosts();

    // Carrega média se estiver no vizualizador
    if (window.location.pathname.includes("vizualizador.html")) {
        carregarMediaPost();
    }
};

