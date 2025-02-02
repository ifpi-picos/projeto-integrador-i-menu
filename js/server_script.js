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
            const response = await fetch("https://imenu-backend.onrender.com/create", { // ✅ URL corrigida!
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
    
        const novoUsuario = {
            email: email
        };
    
        try {
            const response = await fetch("https://imenu-backend.onrender.com/login", { // ✅ URL corrigida!
                method: "POST",
                headers: {
                    "Content-Type": "application/json" // ✅ Agora o servidor sabe que é JSON
                },
                body: JSON.stringify(novoUsuario)
            });
    
            const data = await response.json(); // ✅ Convertendo resposta para JSON
            
            if (response.ok) {
                alert("Usuário logado com sucesso!");
                window.location.href = "../index.html"
            } else {
                alert("Erro ao logar com o usuário: " + data.message);
            }
        } catch (err) {
            alert("Erro ao logar com o usuário: " + err);
        }
    }