const webservice = "http://localhost:3006"; //"https://imenu-backend-yp5c.onrender.com"

// Criar usuário
async function criaruser() {
    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const dono = document.getElementById("dono").checked;

    const novoUsuario = { name: nome, email, password: senha, dono };

    try {
        const response = await fetch(`${webservice}/create`, {
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

// Login
async function logar() {
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    const usuario = { email, password: senha };

    try {
        const response = await fetch(`${webservice}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(usuario)
        });

        const data = await response.json();

        if (response.ok) {
            alert("Usuário logado com sucesso!");
            localStorage.setItem('auth_token', data.token);
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
    const username = document.getElementById("username");
    const mapa = document.getElementById("mapaAba");
    const editor = document.getElementById("editorAba");
    const cadastrarB = document.querySelectorAll("#button-acount");
    const logarB = document.querySelectorAll("#button-enter");
    const publicar = document.getElementById("publicarAba");

    const perfilSidebar = document.getElementById("perfilSidebar");
    const publicarSidebar = document.getElementById("publicarSidebar");
    const editorSidebar = document.getElementById("editorSidebar");

    if (!token) {
        // Deslogado
        if (perfilSidebar) perfilSidebar.style.display = "none";
        if (publicarSidebar) publicarSidebar.style.display = "none";
        if (editorSidebar) editorSidebar.style.display = "none";
        if (conta) conta.style.display = "none";
        if (mapa) mapa.style.display = "flex";
        if (editor) editor.style.display = "none";
        if (publicar) publicar.style.display = "none";

        cadastrarB.forEach(b => b.style.display = "block");
        logarB.forEach(b => b.style.display = "block");

        if (username) username.innerText = "";

        return;
    }

    try {
        const response = await fetch(`${webservice}/dados`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
            localStorage.removeItem('auth_token');
            verificarToken();
            return;
        }

        const data = await response.json();
        
        // Nome e foto
        if (conta) conta.style.display = "flex";
        if (username) username.innerText = data.name;
        const perfilImg = document.getElementById("perfil");
        if (perfilImg && data.foto) {
            perfilImg.src = data.foto;
        }
        
        // Para donos
        if (data.dono) {
            if (mapa) mapa.style.display = "none";
            if (editor) editor.style.display = "flex";
            if (publicar) publicar.style.display = "flex";
            // document.getElementById("tipo-conta").innerText = "Dono de Restaurante";
            
            if (publicarSidebar) publicarSidebar.style.display = "flex";
            if (editorSidebar) editorSidebar.style.display = "flex";
        } else {
            if (mapa) mapa.style.display = "flex";
            if (editor) editor.style.display = "none";
            if (publicar) publicar.style.display = "none";
            
            if (publicarSidebar) publicarSidebar.style.display = "none";
            if (editorSidebar) editorSidebar.style.display = "none";
        }
        
        if (perfilSidebar) perfilSidebar.style.display = "flex";
        
        // Esconde login e cadastro
        cadastrarB.forEach(b => b.style.display = "none");
        logarB.forEach(b => b.style.display = "none");
        
        // Página de perfil
        if (window.location.pathname.includes("perfil.html")) {
            const spanUser = document.getElementById("P-username");
            const spanTipo = document.getElementById("tipo-conta");
            
            if (spanUser) spanUser.innerText = data.name;
            if (spanTipo) spanTipo.innerText = data.dono ? "Dono de Restaurante" : "Cliente";
            
            if (data.dono) {
                const localIcons = document.getElementsByName("localizacaoicon");
                Array.from(localIcons).forEach(icon => icon.remove());
                document.getElementById("locationicon").remove()
            }
            if(data.dono == false){document.getElementById("stars").remove();}
        }
        return(data);
        
    } catch (err) {
        console.error("Erro ao verificar token:", err);
    }
}

// Verificação de e-mail
async function VerEmail() {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    try {
        const response = await fetch(`${webservice}/dados`, {
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

// Publicar
async function postar() {
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;
    const link = document.getElementById("linksocial").value;
    const publice = document.getElementById("public").checked;
    const capa = document.getElementById("linkimg").value;

    const novoPost = { title, content, sociallink: link, publice, capa };

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

        alert("Post criado com sucesso!");
        window.location.href = "./index.html";
    } catch (err) {
        alert("Erro ao criar o post. Tente novamente.");
    }
}

// Carregar últimos posts
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
                    <p class="post-content"></p>
                    <p>Autor: ${post.author?.name || 'Desconhecido'}</p>
                `;

                postElement.appendChild(infoContainer);
                postsContainer.appendChild(postElement);
            });
        }
    } catch (err) {
        console.error("Erro ao carregar posts:", err);
    }
}

function abrirPost(postId) {
    if (!postId || postId === 'undefined') {
        alert('Erro: Post não encontrado');
        return;
    }
    window.location.href = `vizualizador.html?id=${postId}`;
}

// Avaliação
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
           // alert("Avaliação salva com sucesso!");
        } else {
            alert("Erro ao salvar avaliação: " + (data.message || "Erro desconhecido"));
        }
    } catch (err) {
        alert("Erro ao salvar avaliação. Tente novamente.");
    }
}

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

async function CarregarUserPosts(email) {
    verificarToken()
}

// Inicialização
window.onload = () => {
    verificarToken();
    setTimeout(VerEmail, 500);
    carregarUltimosPosts();

    if (window.location.pathname.includes("vizualizador.html")) {
        carregarMediaPost();
    }
};
