const webservice = "http://localhost:3006"
async function criaruser() {

    var nome = document.getElementById("nome").value;
    var email = document.getElementById("email").value;
    var senha = document.getElementById("senha").value;
        // Pegando os valores DENTRO da função, para garantir que sejam atualizados corretamente
    
        const novoUsuario = {
            name: nome,
            email: email,
            password: senha
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
    
    function verificarToken() {
        const token = localStorage.getItem("auth_token");
    
        if (token) {
            // Redireciona para a página de índice se já tiver um token
            window.location.href = "index.html";
        }
    }

    verificarToken();