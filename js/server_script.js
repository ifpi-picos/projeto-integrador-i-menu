const webservice = "http://localhost:3006"
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
                window.location.href = "../index.html"
            } else {
                alert("Erro ao criar usuário: " + data.message);
            }
        } catch (err) {
            alert("Erro ao criar usuário: " + err);
        }
    }


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
                localStorage.setItem('auth_token', data.token); // Exemplo de como armazenar o token
                window.location.href = "../index.html"; // Redireciona para a página principal
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
    
        console.log("Token encontrado:", token); // Verifique se o token está sendo recuperado corretamente.
    
        if (token) {
            try {
                const response = await fetch("http://localhost:3006/dados", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}` // Enviando o token no cabeçalho
                    }
                });
    
                if (response.ok) {
                    const data = await response.json();
                    console.log("Dados recebidos do servidor:", data); // Verifique o conteúdo de data
    
                    // Exibindo o nome do usuário na página
                    document.getElementById("username").innerText = `${data.name}`;
    
                    const cadastrarB = document.getElementById("button-acount");
                    const LogarB = document.getElementById("button-enter");
                    cadastrarB.remove();
                    LogarB.remove();
    
                    if (data.dono === true) {
                        const mapa = document.getElementById("mapaAba");
                        mapa.remove();
                    } else {
                        const editor = document.getElementById("editorAba");
                        editor.remove();
                    }
    
                    window.location.href = "index.html"; // Redirecionamento após carregar os dados
                } else {
                    const errorData = await response.json();
                    console.error("Erro ao buscar o usuário:", errorData.message);
                }
            } catch (err) {
                console.error("Erro ao buscar o usuário:", err);
            }
        } else {
            console.log("Token não encontrado.");
        }
    }
    
    // Chama a função assíncrona
    verificarToken();
    