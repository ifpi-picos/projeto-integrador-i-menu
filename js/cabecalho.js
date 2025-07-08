function initCabecalho() {
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.getElementById("toggleSidebar");

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("expanded");
    });
  }

  if (typeof verificarToken === "function") verificarToken();
  if (window.lucide?.createIcons) lucide.createIcons();
}



fetch('cabecalho.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('header-container').innerHTML = data;

    // Aguarda o DOM injetado estar disponível
    if (typeof initCabecalho === 'function') {
      initCabecalho(); // Ativa toggle da sidebar e verifica token
    }

    if (window.lucide?.createIcons) {
      lucide.createIcons(); // Atualiza ícones
    }
  });
