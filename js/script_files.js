const webservicef = "https://imenu-back-files-c7ii.onrender.com" //"http://localhost:3009"

let imageUrl = ''; // Variável global para armazenar o URL da imagem

async function enviarImagem() {
    const fileInput = document.getElementById('upload_card');
    
    if (!fileInput.files[0]) {
        console.log("Nenhuma imagem selecionada - post será criado sem imagem");
        return null; // Retorna null se não houver imagem
    }

    const formData = new FormData();
    formData.append('imagem', fileInput.files[0]);
    
    try {
        const response = await fetch(`${webservicef}/api/cardapio`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao enviar imagem');
        }
        
        const data = await response.json();
        return data.data.imageUrl; // Retorna o URL da imagem
    } catch (error) {
        console.error("Erro ao enviar imagem:", error);
        throw error; // Propaga o erro para ser tratado no chamador
    }
}

async function prepararPost() {
    const postarBtn = document.getElementById('postar_btn');
    postarBtn.disabled = true;
    postarBtn.textContent = 'Enviando...';
    
    try {
        // 1. Envia a imagem e obtém o URL
        imageUrl = await enviarImagem(); // Atribui à variável global
        
        // 2. Agora chama a função para enviar o post completo
        await enviarPostCompleto();
        
    } catch (error) {
        document.getElementById('result').innerHTML = 
            `<p style="color:red;">❌ Erro: ${error.message}</p>`;
    } finally {
        postarBtn.disabled = false;
        postarBtn.textContent = 'Publicar Cardápio';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('postar_btn').addEventListener('click', function(e) {
        e.preventDefault();
        prepararPost();
    });
});

        function previewImage(event) {
            const file = event.target.files[0];
            const preview = document.getElementById('preview');
            const uploadText = document.getElementById('upload-text');
            
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                    uploadText.style.display = 'none';
                };
                reader.readAsDataURL(file);
            } else {
                preview.style.display = 'none';
                uploadText.style.display = 'block';
            }
        }