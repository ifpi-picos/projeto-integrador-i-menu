const webservice = "https://imenu-backend-pd3a.onrender.com";
const webservicef = "https://imenu-back-files-c7ii.onrender.com";
  //"http://localhost:3006"
  let imageUrl = null; // Adicione isso no topo do seu script

function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
}

function atualizarPostsUI(posts, containerId, isOwner = false) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container ${containerId} não encontrado`);
        return;
    }
    
    container.innerHTML = posts.map(post => `
        <div class="dono_card" data-post-id="${post.id || post._id}">
            ${isOwner ? `
            <div class="card-menu" onclick="toggleMenu(event, '${post.id || post._id}')">
                <span class="menu-dots">⋮</span>
                <div class="menu-options" id="menu-${post.id || post._id}">
                    <div class="menu-option" onclick="editarPost('${post.id || post._id}', event)">Editar</div>
                    <div class="menu-option qr-code" onclick="gerarQRCode('${post.id || post._id}', event)">Gerar QR Code</div>
                    <div class="menu-option delete" onclick="excluirPost('${post.id || post._id}', event)">Excluir</div>
                </div>
            </div>` : ''}
            <div onclick="abrirPost('${post.id || post._id}')">
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

function gerarQRCode(postId, event) {
    event.stopPropagation();
    
    // URL base do seu site - agora usando seu domínio personalizado
    const baseUrl = "https://www.imenucorp.shop"; // Substitua pelo seu domínio completo
    const postUrl = `${baseUrl}/vizualizador.html?id=${postId}`;
    
    // Criar modal para mostrar o QR Code
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
    modal.style.flexDirection = 'column';
    
    // Conteúdo do modal
    modal.innerHTML = `
        <div style="background: white; padding: 20px; border-radius: 10px; text-align: center;">
            <h3 style="margin-bottom: 15px;">QR Code do Cardápio</h3>
            <div id="qrcode-container" style="margin: 0 auto 15px; width: 200px; height: 200px;"></div>
            <p style="margin-bottom: 15px;">Escaneie este QR Code para acessar o cardápio</p>
            <p style="margin-bottom: 15px; font-size: 12px; color: #666;">URL: ${postUrl}</p>
            <button onclick="this.closest('div').parentNode.remove()" 
                    style="padding: 8px 15px; background: #3B1D0F; color: white; border: none; border-radius: 5px; cursor: pointer;">
                Fechar
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Carregar a biblioteca qrcode-generator dinamicamente se não estiver disponível
    if (typeof QRCode === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js';
        script.onload = () => generateQR(postUrl);
        document.head.appendChild(script);
    } else {
        generateQR(postUrl);
    }
    
    function generateQR(url) {
        // Usando qrcode-generator
        const qr = qrcode(0, 'H'); // 'H' é o nível de correção de erro (High)
        qr.addData(url);
        qr.make();
        
        const qrContainer = document.getElementById('qrcode-container');
        qrContainer.innerHTML = qr.createImgTag(8, 0); // 8 é o tamanho do módulo, 0 é a margem
        
        // Estiliza a imagem gerada
        const qrImg = qrContainer.querySelector('img');
        if (qrImg) {
            qrImg.style.width = '100%';
            qrImg.style.height = '100%';
        }
    }
}


// Login
async function logar() {
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const errorElement = document.getElementById("login_ms");

    if (!email || !senha) {
        if (errorElement) {
            errorElement.textContent = "Por favor, preencha todos os campos";
            errorElement.style.color = "red";
        }
        return;
    }

    try {
        const response = await fetch(`${webservice}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password: senha })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('auth_token', data.token);
            window.location.href = "./index.html";
        } else {
            if (errorElement) {
                errorElement.textContent = data.message || "Erro ao fazer login";
                errorElement.style.color = "red";
                
                // Adicione link para reenviar verificação se necessário
                if (data.needsVerification) {
                    errorElement.innerHTML += `<br><a href="#" onclick="reenviarEmailVerificacao()">Reenviar email de verificação</a>`;
                }
            }
        }
    } catch (err) {
        console.error("Erro:", err);
        if (errorElement) {
            errorElement.textContent = "Erro ao conectar com o servidor";
            errorElement.style.color = "red";
        }
    }
}

async function reenviarEmailVerificacao() {
    const email = document.getElementById("email").value;
    
    if (!email) {
        alert("Por favor, insira seu email primeiro");
        return;
    }

    try {
        console.log("Enviando solicitação para:", `${webservice}/verifyagain`);
        
        const response = await fetch(`${webservice}/verifyagain`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || data.message || "Erro desconhecido");
        }

        alert(data.message || "E-mail de verificação reenviado com sucesso!");
        
    } catch (err) {
        console.error("Erro completo:", err);
        alert("Erro ao reenviar e-mail: " + err.message);
    }
}

// Função para editar foto de perfil
// Função para editar foto de perfil (CORRIGIDA)
async function editarFotoPerfil() {
    const token = localStorage.getItem("auth_token");
    if (!token) {
        alert("Você precisa estar logado para alterar a foto");
        window.location.href = "login.html";
        return;
    }

    // Criar input file dinamicamente
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar tipo de arquivo
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione uma imagem válida');
            return;
        }

        // Validar tamanho (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('A imagem deve ter no máximo 5MB');
            return;
        }

        try {
            // Mostrar loading
            const profileImg = document.getElementById('profile-img');
            const originalSrc = profileImg.src;
            profileImg.style.opacity = '0.5';

            // Criar FormData para upload - USANDO A ROTA CORRETA
            const formData = new FormData();
            formData.append('file', file); // Mudar de 'image' para 'file'

            // Fazer upload da imagem - ROTA CORRIGIDA
            console.log("Fazendo upload para:", `${webservicef}/api/upload`);
            const uploadResponse = await fetch(`${webservicef}/api/upload`, {
                method: 'POST',
                body: formData
            });

            if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text();
                console.error("Erro no upload:", errorText);
                throw new Error(`Erro ao fazer upload: ${uploadResponse.status} ${uploadResponse.statusText}`);
            }

            const uploadResult = await uploadResponse.json();
            
            if (!uploadResult.success) {
                throw new Error(uploadResult.error || 'Upload falhou');
            }

            const imageUrl = uploadResult.fileUrl;

            // Atualizar foto no perfil do usuário
            const updateResponse = await fetch(`${webservice}/user/photo`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ foto: imageUrl })
            });

            if (!updateResponse.ok) {
                const errorData = await updateResponse.json();
                throw new Error(errorData.error || 'Erro ao atualizar foto');
            }

            // Atualizar imagem na página
            profileImg.src = imageUrl;
            profileImg.style.opacity = '1';

            // Atualizar também a foto no header se existir
            const headerProfileImg = document.getElementById('perfil');
            if (headerProfileImg) {
                headerProfileImg.src = imageUrl;
            }

            alert('Foto atualizada com sucesso!');

        } catch (error) {
            console.error('Erro ao editar foto:', error);
            alert('Erro ao alterar foto: ' + error.message);
            
            // Restaurar imagem original em caso de erro
            const profileImg = document.getElementById('profile-img');
            profileImg.style.opacity = '1';
        }
    };

    // Disparar o input file
    input.click();
}

// Função auxiliar para upload de arquivos
// Função auxiliar para upload de arquivos (CORRIGIDA)
async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file); // Mudar para 'file'

    try {
        const response = await fetch(`${webservicef}/api/upload`, { // Rota corrigida
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Erro no upload: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Upload falhou');
        }
        
        return data.fileUrl;
    } catch (error) {
        console.error('Erro no upload:', error);
        throw new Error('Falha no upload do arquivo: ' + error.message);
    }
}

// Função para carregar perfil de restaurante (usuário específico)
async function carregarPerfilRestaurante(userId) {
    try {
        const token = localStorage.getItem("auth_token");
        
        // Buscar dados do usuário específico
        const response = await fetch(`${webservice}/user/${userId}`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar perfil do restaurante');
        }

        const userData = await response.json();
        
        // Atualizar a UI com os dados do restaurante
        const spanUser = document.getElementById("P-username");
        const spanTipo = document.getElementById("tipo-conta");
        const spanTel = document.getElementById("telefone");
        const spanLoc = document.getElementById("localizacao");
        const profileImg = document.getElementById("profile-img");

        if (spanUser) {
            spanUser.innerText = userData.restaurante || userData.name;
        }
        
        if (spanTipo) {
            spanTipo.innerText = userData.dono ? "Dono de Restaurante" : "Cliente";
        }

        if (spanTel) {
            spanTel.innerText = userData.telefone 
                ? `📞 ${userData.telefone}` 
                : "📞 --";
        }

        if (spanLoc) {
            const cidade = userData.cidadeNome || "---";
            const estado = userData.estadoNome || "Brasil";
            spanLoc.innerText = `📍 ${cidade} / ${estado}`;
        }

        if (profileImg && userData.foto) {
            profileImg.src = userData.foto;
        }

        // Carregar posts públicos do usuário
        await carregarPostsUsuario(userId);
        
        // Esconder seções que não fazem sentido para visitantes
        document.getElementById("relatorio").style.display = "none";
        document.querySelectorAll(".section:last-child").forEach(el => el.style.display = "none");

    } catch (error) {
        console.error("Erro ao carregar perfil do restaurante:", error);
        alert("Erro ao carregar perfil do restaurante");
        window.location.href = "perfil.html"; // Redireciona para o próprio perfil em caso de erro
    }
}

// Função para carregar posts de um usuário específico
async function carregarPostsUsuario(userId) {
    try {
        const token = localStorage.getItem("auth_token");
        
        const response = await fetch(`${webservice}/user/${userId}/posts`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar posts do usuário');
        }

        const posts = await response.json();
        
        // Atualizar a UI com os posts públicos
        const postsContainer = document.getElementById("cards_user");
        if (postsContainer) {
            if (posts.length === 0) {
                postsContainer.innerHTML = `
                    <div class="no-posts">
                        <p>Este restaurante ainda não publicou cardápios</p>
                    </div>
                `;
            } else {
                postsContainer.innerHTML = posts.map(post => `
                    <div class="dono_card" onclick="abrirPost('${post.id}')">
                        ${post.capa ? `<div class="dono_card_image" style="background-image: url('${post.capa}')"></div>` : ''}
                        <div class="post-info">
                            <h3>${post.title}</h3>
                            <p>${post.content?.substring(0, 100)}...</p>
                            <p>Visualizações: ${post.views || 0}</p>
                        </div>
                    </div>
                `).join('');
            }
        }

        // Esconder seção de posts privados para visitantes
        document.getElementById("cards_user_p").style.display = "none";
        document.querySelector('h4:contains("Cardápios privados")').closest('.section').style.display = "none";

    } catch (error) {
        console.error("Erro ao carregar posts do usuário:", error);
    }
}

// Função para voltar à página anterior
function voltar() {
    if (document.referrer && document.referrer.includes(window.location.hostname)) {
        window.history.back();
    } else {
        window.location.href = 'index.html';
    }
}

// Modifique também a função logar para melhor tratamento:
async function logar() {
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const errorElement = document.getElementById("login_ms");

    if (!email || !senha) {
        if (errorElement) {
            errorElement.textContent = "Por favor, preencha todos os campos";
            errorElement.style.color = "red";
        }
        return;
    }

    try {
        const response = await fetch(`${webservice}/login`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ email, password: senha })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('auth_token', data.token);
            window.location.href = "./index.html";
        } else {
            if (errorElement) {
                errorElement.textContent = data.message || "Erro ao fazer login";
                errorElement.style.color = "red";
                
                // Link para reenviar verificação
                if (data.needsVerification) {
                    errorElement.innerHTML += `<br><a href="#" onclick="reenviarEmailVerificacao('${email}')" style="color: #007bff; text-decoration: underline;">Reenviar email de verificação</a>`;
                }
            }
        }
    } catch (err) {
        console.error("Erro:", err);
        if (errorElement) {
            errorElement.textContent = "Erro ao conectar com o servidor";
            errorElement.style.color = "red";
        }
    }
}

// Versão alternativa que recebe email como parâmetro
async function reenviarEmailVerificacao(email = null) {
    const emailToUse = email || document.getElementById("email").value;
    
    if (!emailToUse) {
        alert("Por favor, insira seu email primeiro");
        return;
    }

    try {
        const response = await fetch(`${webservice}/verifyagain`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ email: emailToUse })
        });

        const data = await response.json();
        
        if (response.ok) {
            alert("✅ " + (data.message || "E-mail de verificação reenviado com sucesso!"));
        } else {
            alert("❌ " + (data.error || data.message || "Erro ao reenviar e-mail"));
        }
        
    } catch (err) {
        console.error("Erro completo:", err);
        alert("❌ Erro de conexão: " + err.message);
    }
}

// Verificar token e atualizar UI
async function verificarToken() {
    const token = localStorage.getItem("auth_token");
    
    // Elementos da UI
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
    const perfilaba = document.getElementById("perfil_nav");

    if (!token) {
        // Comportamento para usuário não logado
        if (publicarSidebar) publicarSidebar.style.display = "none";
        if (perfilaba) perfilaba.remove();
        if (editorSidebar) editorSidebar.remove();
        if (conta) conta.style.display = "none";
        if (mapa) mapa.style.display = "flex";
        if (editor) editor.style.display = "none";
        if (publicar) publicar.style.display = "none";

        cadastrarB.forEach(b => b && (b.style.display = "block"));
        logarB.forEach(b => b && (b.style.display = "block"));

        if (username) username.innerText = "";

        // Redirecionar se estiver em páginas que exigem login
        if (window.location.pathname.includes("perfil.html") || 
            window.location.pathname.includes("configuracoes.html")) {
            window.location.href = "login.html";
        }
        return;
    }

    try {
        const response = await fetch(`${webservice}/dados`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            localStorage.removeItem('auth_token');
            window.location.reload();
            return;
        }

        const data = await response.json();
        
        // Atualizar elementos da UI
        if (username) username.innerText = data.name;
        
        const perfilImg = document.getElementById("perfil");
        if (perfilImg && data.foto) {
            perfilImg.src = data.foto;
        }
        
        // Comportamento para usuário logado
        cadastrarB.forEach(b => b && (b.style.display = "none"));
        logarB.forEach(b => b && (b.style.display = "none"));
        
        if (conta) conta.style.display = "flex";
        if (perfilSidebar) perfilSidebar.style.display = "flex";

        // Comportamento específico para donos
        if (data.dono) {
            if (mapa) mapa.style.display = "none";
            if (editor) editor.style.display = "flex";
            if (publicar) publicar.style.display = "flex";
            if (publicarSidebar) publicarSidebar.style.display = "flex";
            if (editorSidebar) editorSidebar.style.display = "flex";
        } else {
            if (mapa) mapa.style.display = "flex";
            if (editor) editor.style.display = "none";
            if (publicar) publicar.style.display = "none";
            if (publicarSidebar) publicarSidebar.style.display = "none";
            if (editorSidebar) editorSidebar.style.display = "none";
        }

        // Carregar dados específicos da página de perfil
        if (window.location.pathname.includes("perfil.html")) {
            const spanUser = document.getElementById("P-username");
            const spanTipo = document.getElementById("tipo-conta");
            
            if (spanUser) spanUser.innerText = data.name;
            if (spanTipo) spanTipo.innerText = data.dono ? "Dono de Restaurante" : "Cliente";
            
            // Carregar posts do usuário
            await CarregarPostsDono();
            await CarregarPostsDono_P();
            
            // Esconder elementos conforme o tipo de usuário
            if (data.dono) {
                document.querySelectorAll("[name='localizacaoicon']").forEach(el => el.remove());
                const locationIcon = document.getElementById("locationicon");
                if (locationIcon) locationIcon.remove();
            } else {
                const stars = document.getElementById("stars");
                if (stars) stars.remove();
            }
        }
        
        return data;
        
    } catch (err) {
        console.error("Erro ao verificar token:", err);
        localStorage.removeItem('auth_token');
        if (window.location.pathname.includes("perfil.html") || 
            window.location.pathname.includes("configuracoes.html")) {
            window.location.href = "login.html";
        }
    }
}


async function carregarRelatorioVisualizacoes() {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    const relatorioSection = document.getElementById("relatorio");
    if (!relatorioSection) return;

    try {
        const response = await fetch(`${webservice}/relatorio/views`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error(`Erro: ${response.status}`);
        
        const posts = await response.json();
        const tbody = document.querySelector("#tabela-relatorio tbody");
        tbody.innerHTML = "";

        if (posts.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3">Nenhum cardápio publicado ainda</td></tr>`;
            relatorioSection.style.display = "none";
            return;
        }

        posts.forEach(post => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${post.id || post._id}</td>
                <td>${post.title || 'Sem título'}</td>
                <td>${post.views || 0}</td>
            `;
            tbody.appendChild(tr);
        });

        relatorioSection.style.display = "block";
    } catch (err) {
        console.error("Erro ao carregar relatório:", err);
        relatorioSection.style.display = "none";
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

        // Obter tags selecionadas
    const tagCheckboxes = document.querySelectorAll('input[name="tags"]:checked');
    const tags = Array.from(tagCheckboxes).map(cb => cb.value);

    try {
        showLoading(true);
        
        // Criar FormData
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content || '');
        formData.append('sociallink', link || '');
        formData.append('publice', publice.toString()); // Converter boolean para string
        formData.append('tags', JSON.stringify(tags));

        // Adicionar arquivos se existirem
        const capaInput = document.getElementById('upload_card');
        if (capaInput.files[0]) {
            formData.append('capa', capaInput.files[0]);
        }

        const arquivoInput = document.getElementById('upload_arquivo');
        if (arquivoInput.files[0]) {
            formData.append('arquivo', arquivoInput.files[0]);
        }

        const response = await fetch(`${webservice}/post`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
                // Não definir Content-Type - será definido automaticamente
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || error.error || "Erro ao criar post");
        }

        const result = await response.json();
        alert("Post criado com sucesso!");
        window.location.href = "./index.html";
    } catch (error) {
        console.error("Erro:", error);
        showError(error.message || "Erro ao criar post");
    } finally {
        showLoading(false);
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
                    <div class="post-footer">
                        <p>Autor: ${post.author?.name || 'Desconhecido'}</p>
                        ${post.author?.restaurante ? `<p class="restaurant-name">${post.author.restaurante}</p>` : ''}
                        <p class="post-views">${post.views || 0} visualizações</p>
                    </div>
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
                <div class="menu-option qr-code" onclick="gerarQRCode('${post.id}', event)">Gerar QR Code</div>
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


// Modifique a função abrirPost para incluir o registro de visualização
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
window.onload = async () => {
    // Verificar token primeiro
    const userData = await verificarToken();
    
    // Depois carregar os outros componentes
    setTimeout(VerEmail, 500);
    carregarUltimosPosts();
    
    if(window.location.pathname.includes("perfil.html")){
        carregarRestaurantesPopularesP();
    }
    
    if(window.location.pathname.includes("index.html")){
        carregarRestaurantesPopulares();
    }
    
    if (window.location.pathname.includes("vizualizador.html")) {
        carregarMediaPost();
    }
};

// LOCALIZAÇAO NO PERFIL
window.addEventListener('load', () => {
    const localizacaoEl = document.getElementById("localizacao");
    
    // Verifica se o elemento existe antes de tentar usá-lo
    if (!localizacaoEl) return;

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          // Faz a requisição para Nominatim (OpenStreetMap)
fetch(`${webservice}/reverse-geocode?lat=${lat}&lon=${lon}`)
    .then(response => response.json())
    .then(data => {
        const cidade = data.address.city || data.address.town || data.address.village || "Cidade desconhecida";
        const pais = data.address.country || "Brasil";
        localizacaoEl.textContent = `📍 ${cidade} / ${pais}`;
    })
    .catch(() => {
        localizacaoEl.textContent = "📍 Localização não encontrada";
    });
        },
        (erro) => {
            
            if (window.location.pathname == "/vizualizador.html") return; //VERIFICA DE QUAL ARQUIVO ESTA VINDO A REQUISIÇAO !!!!! PRESTA ATENCAO ROBERTO
        if (localizacaoEl) {
  localizacaoEl.textContent = "📍 Localização não permitida";
}


        }
      );
    } else {
      localizacaoEl.textContent = "📍 Geolocalização não suportada";
    }
  });


  //views


  // Função para registrar uma visualização
async function registrarVisualizacao(postId) {
    try {
        await fetch(`${webservice}/posts/${postId}/view`, {
            method: 'POST'
        });
    } catch (err) {
        console.error('Erro ao registrar visualização:', err);
    }
}

// Função para obter visualizações
async function obterVisualizacoes(postId) {
    try {
        const response = await fetch(`${webservice}/posts/${postId}/views`);
        if (!response.ok) throw new Error('Erro ao obter visualizações');
        
        const data = await response.json();
        return data.views || 0;
    } catch (err) {
        console.error('Erro ao obter visualizações:', err);
        return 0;
    }
}

// TEXTO DO EDITOR
    function addText() {
    const canvas = document.getElementById("canvas");

    const newText = document.createElement("div");
    newText.textContent = "Insira seu texto aqui";
    newText.contentEditable = true;
    newText.className = "editable-text";

    canvas.appendChild(newText);
  }
