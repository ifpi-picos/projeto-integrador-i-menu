const webservice = "https://imenu-backend-pd3a.onrender.com"  //"http://localhost:3006"

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
            localStorage.setItem('auth_token', data.token);
            window.location.href = "./index.html";
        } else {
            const logar_msg = document.getElementById("login_ms");
            logar_msg.innerText = "Erro ao logar: " + (data.message || "Erro desconhecido");
            
        }
    } catch (err) {
        const logar_msg = document.getElementById("login_ms");
        logar_msg.innerText = "Erro ao logar: " + err.message
    }
}

// Verificar token e atualizar UI
async function verificarToken() {
    const token = localStorage.getItem("auth_token");
    
    // ... your existing token verification code ...

    // Página de perfil
    if (window.location.pathname.includes("perfil.html")) {
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('userId');
        
        // If no userId parameter, show current user's profile
        const targetUserId = userId || (token ? parseJwt(token).id : null);
        
        if (targetUserId) {
            try {
                const userResponse = await fetch(`${webservice}/user/${targetUserId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!userResponse.ok) throw new Error("Erro ao carregar perfil");
                const userData = await userResponse.json();

                // Update profile info
                const spanUser = document.getElementById("P-username");
                const spanTipo = document.getElementById("tipo-conta");
                
                if (spanUser) spanUser.innerText = userData.name;
                if (spanTipo) spanTipo.innerText = userData.dono ? "Dono de Restaurante" : "Cliente";
                
                // Load user's posts
                const publicPostsResponse = await fetch(`${webservice}/user/${targetUserId}/posts`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const publicPosts = await publicPostsResponse.json();
                renderPosts(publicPosts, 'cards_user');
                
                // If viewing own profile, load private posts
                if (!userId || userId === parseJwt(token).id) {
                    const privatePostsResponse = await fetch(`${webservice}/user/${targetUserId}/posts/private`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    const privatePosts = await privatePostsResponse.json();
                    renderPosts(privatePosts, 'cards_user_p');
                } else {
                    document.getElementById('cards_user_p').innerHTML = '<p>Cardápios privados só são visíveis para o dono do perfil</p>';
                }
                
                // Show/hide elements based on user type
                if (userData.dono) {
                    const localIcons = document.getElementsByName("localizacaoicon");
                    Array.from(localIcons).forEach(icon => icon.remove());
                    document.getElementById("locationicon")?.remove();
                }
                if(userData.dono == false){
                    document.getElementById("stars")?.remove();
                }
            } catch (error) {
                console.error("Erro ao carregar perfil:", error);
                alert("Erro ao carregar perfil. Tente novamente.");
            }
        }
    }
    
    return data;
}

function renderPosts(posts, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    if (posts.length === 0) {
        container.innerHTML = '<p>Nenhum cardápio publicado ainda</p>';
        return;
    }
    
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'dono_card';
        postElement.onclick = () => abrirPost(post.id);
        postElement.innerHTML = `
            ${post.capa ? `<div class="dono_card_image" style="background-image: url('${post.capa}')"></div>` : ''}
            <div class="post-info">
                <h3>${post.title}</h3>
                <p>${post.content?.substring(0, 100)}...</p>
            </div>
        `;
        container.appendChild(postElement);
    });
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

async function enviarPostCompleto() {
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;
    const link = document.getElementById("linksocial").value;
    const publice = document.getElementById("public").checked;
    const token = localStorage.getItem("auth_token");
    
    if (!token) {
        alert("Você precisa fazer login primeiro");
        window.location.href = "./login.html";
        return;
    }

    // Verifica se imageUrl foi definido - agora não é mais crítico
    const capa = imageUrl || null; // Permite que o post seja criado sem imagem

    const novoPost = { 
        title, 
        content, 
        sociallink: link, 
        publice, 
        capa
    };

    try {
        const response = await fetch(`https://imenu-backend-pd3a.onrender.com/post`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(novoPost)
        });

        if (response.status === 401) {
            throw new Error("Sessão expirada. Faça login novamente.");
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Erro ao criar post");
        }

        alert("Post criado com sucesso!");
        window.location.href = "./index.html";
    } catch (error) {
        console.error("Erro:", error);
        alert(error.message);
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



//carregar posts do dono
async function CarregarPostsDono() {
    try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
            console.log("Usuário não autenticado");
            return;
        }

        const response = await fetch(`${webservice}/userposts`, {
            method: "GET",
            headers: { 
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erro: ${response.status}`);
        }

        const userPosts = await response.json();
        
        const postsContainer = document.getElementById("cards_user");
        const postsContainerInfo = document.getElementById("cards_user_info");

        if (postsContainer && postsContainerInfo) {
            postsContainer.innerHTML = userPosts.map(post => `
                <div class="dono_card" data-post-id="${post.id}">
                    <div class="card-menu" onclick="toggleMenu(event, '${post.id}')">
                        <span class="menu-dots">⋮</span>
                        <div class="menu-options" id="menu-${post.id}">
                            <div class="menu-option" onclick="editarPost('${post.id}', event)">Editar</div>
                            <div class="menu-option delete" onclick="excluirPost('${post.id}', event)">Excluir</div>
                        </div>
                    </div>
                    <div onclick="abrirPost('${post.id}')">
                        ${post.capa ? `<div class="dono_card_image" style="background-image: url('${post.capa}')"></div>` : ''}
                        <div class="post-info">
                            <h3>${post.title}</h3>
                            <p>${post.content?.substring(0, 100)}...</p>
                            <p>Autor: ${post.author?.name || 'Você'}</p>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        return userPosts;
    } catch (err) {
        console.error("Erro ao carregar posts:", err);
        alert(err.message || "Erro ao carregar posts");
    }
}

// Faça a mesma modificação para a função CarregarPostsDono_P()


async function CarregarPostsDono_P() {
    try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
            console.log("Usuário não autenticado");
            return;
        }

        const response = await fetch(`${webservice}/userposts_p`, {
            method: "GET",
            headers: { 
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erro: ${response.status}`);
        }

        const userPosts = await response.json();
        console.log("Posts do usuário:", userPosts);
        
const postsContainer = document.getElementById("cards_user_p");
const postsContainerInfo = document.getElementById("cards_user_info_p");

if (postsContainer && postsContainerInfo) {
    postsContainer.innerHTML = userPosts.map(post => `
        <div class="dono_card" onclick="abrirPost('${post.id}')">
                    <div class="card-menu" onclick="toggleMenu(event, '${post.id}')">
                        <span class="menu-dots">⋮</span>
                        <div class="menu-options" id="menu-${post.id}">
                            <div class="menu-option" onclick="editarPost('${post.id}', event)">Editar</div>
                            <div class="menu-option delete" onclick="excluirPost('${post.id}', event)">Excluir</div>
                        </div>
                    </div>
            ${post.capa ? `<div class="dono_card_image" style="background-image: url('${post.capa}')"></div>` : ''}
            <div class="post-info">
                <h3>${post.title}</h3>
                <p>${post.content?.substring(0, 100)}...</p>
                <p>Autor: ${post.author?.name || 'Você'}</p>
            </div>
        </div>
    `).join('');
}
        return userPosts;
    } catch (err) {
        console.error("Erro ao carregar posts:", err);
        alert(err.message || "Erro ao carregar posts");
    }
}

//      EDITAR POST POSTADO


// Mostrar/ocultar menu
function toggleMenu(event, postId) {
    event.stopPropagation(); // Impede que o clique abra o post
    const menu = document.getElementById(`menu-${postId}`);
    const allMenus = document.querySelectorAll('.menu-options');
    
    // Fecha todos os outros menus abertos
    allMenus.forEach(m => {
        if (m.id !== `menu-${postId}`) {
            m.classList.remove('show');
        }
    });
    
    // Alterna o menu atual
    menu.classList.toggle('show');
}

// Fecha menus quando clicar em qualquer lugar
document.addEventListener('click', function() {
    document.querySelectorAll('.menu-options').forEach(menu => {
        menu.classList.remove('show');
    });
});

// Editar post
async function editarPost(postId, event) {
    event.stopPropagation();
    window.location.href = `editar.html?id=${postId}`;
}

// Excluir post
async function excluirPost(postId, event) {
    event.stopPropagation();
    
    if (!confirm('Tem certeza que deseja excluir este cardápio permanentemente?')) {
        return;
    }

    try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
            throw new Error("Você precisa estar logado para esta ação.");
        }

        // Mostrar feedback visual
        const postElement = document.querySelector(`[data-post-id="${postId}"]`) || 
                           document.querySelector(`.dono_card[onclick*="${postId}"]`);
        
        if (postElement) {
            postElement.style.opacity = '0.5';
            postElement.style.pointerEvents = 'none';
        }

        const response = await fetch(`${webservice}/post/${postId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || errorData.error || `Erro ${response.status}`);
        }

        // Remover o elemento apenas se a exclusão foi bem-sucedida
        if (postElement) {
            postElement.remove();
            showToast('Cardápio excluído com sucesso!', 'success');
            
            // Recarregar os posts se estiver na página de perfil
            if (window.location.pathname.includes("perfil.html")) {
                CarregarPostsDono();
                CarregarPostsDono_P();
            }
        }

    } catch (error) {
        console.error("Erro detalhado:", error);
        showToast(`Erro ao excluir: ${error.message}`, 'error');
        
        // Restaurar o elemento em caso de erro
        const postElement = document.querySelector(`[data-post-id="${postId}"]`) || 
                           document.querySelector(`.dono_card[onclick*="${postId}"]`);
        if (postElement) {
            postElement.style.opacity = '1';
            postElement.style.pointerEvents = 'auto';
        }
    }
}

// Função auxiliar para mostrar toasts (adicione ao seu código)
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 5000);
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

// LOCALIZAÇAO NO PERFIL
  window.addEventListener('load', () => {
    const localizacaoEl = document.getElementById("localizacao");

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          // Faz a requisição para Nominatim (OpenStreetMap)
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
            .then(response => response.json())
            .then(data => {
              const cidade = data.address.city || data.address.town || data.address.village || "Cidade desconhecida";
              const estado = data.address.state || "";
              const pais = data.address.country || "Brasil";
              localizacaoEl.textContent = `📍 ${cidade} / ${pais}`;
            })
            .catch(() => {
              localizacaoEl.textContent = "📍 Localização não encontrada";
            });
        },
        (erro) => {
          localizacaoEl.textContent = "📍 Localização não permitida";
        }
      );
    } else {
      localizacaoEl.textContent = "📍 Geolocalização não suportada";
    }
  });


// TEXTO DO EDITOR
    function addText() {
    const canvas = document.getElementById("canvas");

    const newText = document.createElement("div");
    newText.textContent = "Insira seu texto aqui";
    newText.contentEditable = true;
    newText.className = "editable-text";

    canvas.appendChild(newText);
  }