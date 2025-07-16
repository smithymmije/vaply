let pagina = 2;  // inicia da segunda página, assumindo que a 1 já veio no HTML
let carregando = false;
let chegouAoFim = false;

function scrollHandler() {
  if (carregando || chegouAoFim) return;

  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const windowHeight = window.innerHeight;
  const bodyHeight = document.body.offsetHeight;

  if (scrollTop + windowHeight >= bodyHeight - 200) {
    carregarMaisNotas();
  }
}

window.addEventListener('scroll', scrollHandler);

function carregarMaisNotas() {
  console.log('Carregando página:', pagina);
  carregando = true;
  document.getElementById('loading').style.display = 'block';

  fetch(`/notas/load?page=${pagina}`)
    .then(res => res.json())
    .then(notas => {
      console.log('Notas recebidas:', notas.length);
      const container = document.getElementById('notas-container');

      if (notas.length === 0) {
        chegouAoFim = true;
        window.removeEventListener('scroll', scrollHandler);

        const fim = document.createElement('div');
        fim.className = 'no-vagas';
        fim.innerHTML = '<p>🛑 Você chegou ao fim das publicações.</p>';
        container.appendChild(fim);

        document.getElementById('loading').style.display = 'none';
        return;
      }

      notas.forEach(nota => {
        const coluna = document.createElement('div');
        coluna.className = 'card-column';

        coluna.innerHTML = `
          <div class="custom-card">
            <div class="card-content">
              <h5>${nota.title}</h5>
              <p>${nota.body}</p>
              <p class="meta">✍️ Por ${nota.userName}</p>
              <p class="meta">🕒 Publicado há pouco</p>
            </div>
          </div>
        `;
        container.appendChild(coluna);
      });

      pagina++;
      carregando = false;
      document.getElementById('loading').style.display = 'none';
    })
    .catch(err => {
      console.error('Erro ao carregar notas:', err);
      carregando = false;
      document.getElementById('loading').style.display = 'none';
    });
}
