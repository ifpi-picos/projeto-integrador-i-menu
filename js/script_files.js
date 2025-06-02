const fileWebservice = "https://imenu-back-files.onrender.com";
const mainWebservice = "https://imenu-backend-yp5c.onrender.com";

async function enviarImagem() {
    const formData = new FormData();
    const fileInput = document.getElementById('upload_card');
    
    if (!fileInput.files[0]) {
        throw new Error('Selecione uma imagem para enviar');
    }

    formData.append('imagem', fileInput.files[0]);
    
    const response = await fetch(`${fileWebservice}/api/cardapio`, {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao enviar imagem');
    }
    
    const data = await response.json();
    return data.data.imageUrl; // Retorna apenas o URL da imagem
}

async function enviarPostCompleto(imageUrl) {
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;
    const link = document.getElementById("linksocial").value;
    const publice = document.getElementById("public").checked;
    
    const token = localStorage.getItem("auth_token");
    
    if (!token) {
        throw new Error("Você precisa fazer login primeiro");
    }

    const novoPost = { title, content, sociallink: link, publice, capa: imageUrl };

    const response = await fetch(`${mainWebservice}/post`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(novoPost)
    });

    if (response.status === 401) {
        throw new Error("Sessão expirada. Por favor, faça login novamente.");
    }

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao criar post");
    }

    return await response.json();
}

async function prepararPost() {
    const postarBtn = document.getElementById('postar_btn');
    postarBtn.disabled = true;
    postarBtn.textContent = 'Enviando...';
    
    try {
        // 1. Envia a imagem e obtém o URL
        const imageUrl = await enviarImagem();
        
        // 2. Mostra preview do resultado
        document.getElementById('result').innerHTML = `
            <p style="color:green;">✅ Imagem enviada com sucesso!</p>
            <p><strong>Link:</strong> <a href="${imageUrl}" target="_blank">${imageUrl}</a></p>
        `;
        
        // 3. Envia os dados completos para o segundo servidor
        const postResult = await enviarPostCompleto(imageUrl);
        
        // 4. Mostra mensagem de sucesso e redireciona
        document.getElementById('result').innerHTML += `
            <p style="color:green;">✅ Post publicado com sucesso!</p>
        `;
        
        // Redireciona após 2 segundos
        setTimeout(() => {
            window.location.href = "./index.html";
        }, 2000);
        
    } catch (error) {
        document.getElementById('result').innerHTML = 
            `<p style="color:red;">❌ Erro: ${error.message}</p>`;
    } finally {
        postarBtn.disabled = false;
        postarBtn.textContent = 'Publicar Cardápio';
    }
}

// Event listener para o botão
document.getElementById('postar_btn').addEventListener('click', function(e) {
    e.preventDefault();
    prepararPost();
});