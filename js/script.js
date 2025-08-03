// PERFIL  //

function voltar(){
    window.location.href = "index.html";
}

function localizacao(){
    window.location.href = "mapa.html";
}

function goeditor(){
    window.location.href = "editorcard.html";
}

function goecadastro(){
    window.location.href = "cadastro.html";
}

function gologin(){
    window.location.href = "login.html";
}

function filtrarPorCategoria(categoria) {
    // Mapeia categorias do index para os filtros da página de pesquisa
    const filtros = {
        'vegetariano': 'vegetariano',
        'bebidas': 'bebidas',
        'refeicoes': 'refeicoes',
        'sobremesas': 'sobremesas',
        'lanches': 'lanches',
        'sushi': 'sushi',
        'bares': 'bebidas',
        'restaurantes': 'refeicoes'
    };
    
    const filtro = filtros[categoria] || 'all';
    
    // Redireciona para pesquisa.html com o filtro na URL
    window.location.href = `pesquisa.html?filter=${filtro}`;
}