//				        SERVIDOR        				//

function login(){
    window.location.href = "login.html";
}



//                  CADASTRO                    //

document.getElementById("create").addEventListener("click", async function () {
    const username = document.getElementById("nome").value;
    const password = document.getElementById("senha").value;
    
    if (!username || !password) {
        alert("Por favor, preencha todos os campos.") 
        return;
    }
    
    try {
        const response = await fetch("https://projeto-integrador-i-menu.onrender.com/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: username, password }),
        });

        const result = await response.json();
        
        
        if (response.ok) {
            alert("Usuário criado com sucesso!");
            login();
        } else if (result.message === "Usuário já existe.") {
            alert("Erro: Usuário já existe.");
            // Não redirecione neste caso
        } else {
            alert("Erro ao criar usuário: " + result.message);
        }
        
        
    } catch (error) {
        console.error("Erro ao criar usuário:", error);
        alert("erro ao conectar com o server")
    }
});




  //                          LOGIN                           //










// Função para validar login
document.getElementById("submit").addEventListener("click", async function (event) {
    event.preventDefault(); // Impede o recarregamento da página

    const usernameL = document.getElementById("nomeL").value;
    const passwordL = document.getElementById("senhaL").value;

    if (!usernameL || !passwordL) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    try {
        const response = await fetch("https://projeto-integrador-i-menu.onrender.com/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: usernameL, password: passwordL }), // Corrigido aqui!
        });

        const result = await response.json();

        if (response.ok && result.success) {
            // Armazena o ID do usuário no LocalStorage
            localStorage.setItem("user", JSON.stringify({
                id: result.id,
                name: usernameL,
            }));

            alert("Login bem-sucedido!");
            window.location.href = "index.html"; // Redireciona para a página principal
        } else {
            alert(result.message || "Erro no login.");
        }
    } catch (error) {
        console.error("Erro ao fazer login:", error);
        alert("Erro de conexão com o servidor.");
    }
});


