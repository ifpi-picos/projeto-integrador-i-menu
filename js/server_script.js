const webservice = "https://imenu-backend-yp5c.onrender.com" //"http://localhost:3006"

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
            headers: {
                "Content-Type": "application/json"
            },
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

    const usuario = {
        email: email,
        password: senha
    };

    try {
        const response = await fetch(webservice + "/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
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
    console.log("Token encontrado:", token);

    const conta = document.getElementById("perfil-link");
    const mapa = document.getElementById("mapaAba");
    const editor = document.getElementById("editorAba");
    const cadastrarB = document.getElementById("button-acount");
    const logarB = document.getElementById("button-enter");

    if (!token) {
        console.log("Token não encontrado. Ajustando UI...");
        if (conta) conta.remove();
        if (mapa) mapa.remove();
        if (editor) editor.remove();
        if (cadastrarB) cadastrarB.style.display = "block";
        if (logarB) logarB.style.display = "block";
        return;
    }

    try {
        const response = await fetch(webservice + "/dados", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            console.error("Erro ao buscar usuário.");
            if (conta) conta.remove();
            if (mapa) mapa.remove();
            if (editor) editor.remove();
        } else {
            const data = await response.json();
            console.log("Usuário autenticado:", data);

            if (window.location.pathname.includes("index.html")) {
                document.getElementById("username").innerText = data.name;
                if (data.foto) {
                    document.getElementById("perfil").src = data.foto;
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

            if (data.dono) {
                if (mapa) mapa.remove();
            } else {
                if (editor) editor.remove();
            }
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
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.status === 403) { 
            console.warn("Redirecionando para página de verificação de e-mail...");
            window.location.href = "./EmailnoVer.html";
        }
        if(window.location.pathname.includes("EmailnoVer.html" && response.status !== 403)){
            window.location.href = "./index.html";
        }

    } catch (err) {
        console.error("Erro ao verificar e-mail:", err);
    }
}

// ✅ Garante que as duas funções são chamadas no `onload`
window.onload = () => {
    verificarToken();
    setTimeout(VerEmail, 500);  // Pequeno delay para evitar conflito
};
