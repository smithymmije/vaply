function loadGA() {
  if (window.gaLoaded) return;
  window.gaLoaded = true;

  const script = document.createElement("script");
  script.src = "https://www.googletagmanager.com/gtag/js?id=G-9N4WLHZJBP";
  script.async = true;
  document.head.appendChild(script);

  script.onload = () => {
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", "G-9N4WLHZJBP");
  };
}

window.addEventListener("DOMContentLoaded", () => {
  const banner = document.getElementById("cookieBanner");
  const overlay = document.getElementById("cookieOverlay");
  const modal = document.getElementById("cookieModal");
  const form = document.getElementById("cookieForm");

  // Botões do banner
  const btnAceitarTudo = document.getElementById("btnAceitarTudo");
  const btnPersonalizarCookies = document.getElementById("btnPersonalizarCookies");
  // Botões do modal
  const btnSalvarPreferencias = document.getElementById("btnSalvarPreferencias");
  const btnCancelarModal = document.getElementById("btnCancelarModal"); // NOVO

  const consent = JSON.parse(localStorage.getItem("cookieConsent"));
  if (consent && consent.analytics) {
    loadGA();
  }

  function aceitarCookies() {
    const consent = {
      necessary: true,
      analytics: true,
      marketing: true
    };
    localStorage.setItem("cookieConsent", JSON.stringify(consent));
    loadGA();
    fecharTudo();
  }

  function personalizarCookies() {
    modal.style.display = "block";
    // É bom garantir que o overlay também apareça ao personalizar, se for a intenção
    if (overlay) {
        overlay.style.opacity = "1";
        overlay.style.pointerEvents = "auto";
    }
  }

  function fecharTudo() {
    if (overlay) {
      overlay.style.opacity = "0";
      overlay.style.pointerEvents = "none";
      setTimeout(() => overlay.remove(), 300);
    }
    if (banner) {
      banner.style.opacity = "0";
      setTimeout(() => banner.remove(), 300);
    }
    if (modal) {
      modal.style.display = "none";
    }
  }

  // Atribuição de eventos aos botões e formulário
  if (btnAceitarTudo) {
      btnAceitarTudo.addEventListener('click', aceitarCookies);
  }
  if (btnPersonalizarCookies) {
      btnPersonalizarCookies.addEventListener('click', personalizarCookies);
  }
  if (form) {
    form.addEventListener('submit', (e) => { // Usar addEventListener no form
      e.preventDefault();
      const consent = {
        necessary: true,
        analytics: form.analytics.checked,
        marketing: form.marketing.checked
      };
      localStorage.setItem("cookieConsent", JSON.stringify(consent));
      if (consent.analytics) loadGA();
      fecharTudo();
    });
  }
  if (btnCancelarModal) { // NOVO EVENT LISTENER
      btnCancelarModal.addEventListener('click', fecharTudo);
  }


  // Não é mais necessário esta linha, pois o `btnCancelarModal` agora chama `fecharTudo()`
  // document.getElementById("cancelCookieModal").onclick = () => { modal.style.display = "none"; };

  // Tornar as funções aceitarCookies e personalizarCookies globais para o onclick no HTML
  // (Embora seja melhor remover o onclick do HTML e usar addEventListener,
  // isso garante compatibilidade com o HTML existente caso não mude)
  window.aceitarCookies = aceitarCookies;
  window.personalizarCookies = personalizarCookies;

  // Lógica para mostrar/esconder o banner inicialmente
  if (!consent) {
    if (banner) banner.style.opacity = "1";
    if (overlay) {
      overlay.style.opacity = "1";
      overlay.style.pointerEvents = "auto";
    }
  } else {
    // Se já aceito, certifique-se de que nada esteja visível e remova
    if (banner) banner.remove();
    if (overlay) overlay.remove();
    if (modal) modal.remove(); // Remova o modal também se não precisar dele no DOM
  }
});