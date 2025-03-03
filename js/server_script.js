const webservice = "https://imenu-backend-pd3a.onrender.com" //"http://localhost:3006"

async function criaruser() {

    var nome = document.getElementById("nome").value;
    var email = document.getElementById("email").value;
    var senha = document.getElementById("senha").value;
    var dono = document.getElementById("dono").checked;
        // Pegando os valores DENTRO da função, para garantir que sejam atualizados corretamente
    
        const novoUsuario = {
            name: nome,
            email: email,
            password: senha,
            dono: dono
        };
    
        try {
            const response = await fetch(webservice+"/create", { // ✅ URL corrigida!
                method: "POST",
                headers: {
                    "Content-Type": "application/json" // ✅ Agora o servidor sabe que é JSON
                },
                body: JSON.stringify(novoUsuario)
            });
    
            const data = await response.json(); // ✅ Convertendo resposta para JSON
            
            if (response.ok) {
                alert("Usuário criado com sucesso!");
                window.location.href = "./login.html"
            } else {
                alert("Erro ao criar usuário: " + data.message);
            }
        } catch (err) {
            alert("Erro ao criar usuário: " + err);
        }
    }

    if(window.location.pathname.includes("VerEmail.html")){}
    async function logar() {
        var email = document.getElementById("email").value;
        var senha = document.getElementById("senha").value;
    
        const novoUsuario = {
            email: email,
            password: senha
        };
    
        try {
            const response = await fetch(webservice+"/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json" // Especificando que o corpo é JSON
                },
                body: JSON.stringify(novoUsuario) // Enviando os dados como JSON
            });
    
            const data = await response.json(); // Convertendo a resposta para JSON
    
            if (response.ok) {
                alert("Usuário logado com sucesso!");
                // Aqui você pode armazenar o token JWT (se estiver retornando) no localStorage ou sessionStorage
                localStorage.setItem('auth_token', data.token);
                verificarToken() // Exemplo de como armazenar o token
                window.location.href = "./index.html"; // Redireciona para a página principal
            } else {
                alert("Erro ao logar com o usuário: " + (data.message || "Mensagem não encontrada"));
            }
        } catch (err) {
            // Captura erros inesperados, como falhas de rede ou problemas com a requisição
            alert("Erro ao logar com o usuário: " + err.message);
        }
    }
    
    async function verificarToken() {
        const token = localStorage.getItem("auth_token");
        console.log("Token encontrado:", token);
    
        if (!token) {
            console.log("Token não encontrado.");
            const conta = document.getElementById("conta")
            conta.remove()
            const mapa = document.getElementById("mapaAba");
            if (mapa) mapa.remove();
            const editor = document.getElementById("editorAba");
            if (editor) editor.remove();
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
                const errorData = await response.json();
                console.error("Erro ao buscar o usuário:", errorData.message);
                //alert(`Erro: ${errorData.message}`);
                const conta = document.getElementById("conta")
                conta.remove()
                const mapa = document.getElementById("mapaAba");
                if (mapa) mapa.remove();
                const editor = document.getElementById("editorAba");
                if (editor) editor.remove();
            } else {
                const data = await response.json();
                console.log("Dados recebidos do servidor:", data);
                if (window.location.pathname.includes("index.html")) {
                    document.getElementById("username").innerText = `${data.name}`;
                }
                if (window.location.pathname.includes("perfil.html")) {
                    document.getElementById("P-username").innerText = `${data.name}`;
                    const spanElement = document.getElementById("spanP");
                    spanElement.innerText = data.dono ? "Dono de Restaurante" : "Cliente";
                    if(data.dono === true){
                        const localicon = document.getElementsByClassName("localizacaoicon");
                        for (let i = 0; i < localicon.length; i++) {
                            localicon[i].remove();
                        }
                    }
                }
    
                const cadastrarB = document.getElementById("button-acount");
                const LogarB = document.getElementById("button-enter");
                if (cadastrarB) cadastrarB.remove();
                if (LogarB) LogarB.remove();
    
                if (data.dono === true) {
                    const mapa = document.getElementById("mapaAba");
                    if (mapa) mapa.remove();
                } else {
                    const editor = document.getElementById("editorAba");
                    if (editor) editor.remove();
                }
            }
        } catch (err) {
            console.error("Erro ao buscar o usuário:", err);
        }
    }
    
    // Chama a função APENAS uma vez ao carregar a página
    window.onload = verificarToken;
    
    
