// SEU ARQUIVO JAVASCRIPT DE FRONTEND (Ex: public/js/main.js)

let paginaVagas = 2;
let carregandoVagas = false;
let fimDasVagas = false;

// Função para calcular tempo decorrido
function tempoDecorrido(data) {
    const agora = new Date();
    const post = new Date(data);
    const diff = Math.floor((agora - post) / 1000);

    if (diff < 60) return `${diff} segundos`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutos`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} horas`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} dias`;

    const dia = post.getDate().toString().padStart(2, '0');
    const mes = (post.getMonth() + 1).toString().padStart(2, '0');
    const ano = post.getFullYear();
    return `em ${dia}/${mes}/${ano}`;
}

// Handler de scroll
function scrollVagasHandler() {
    if (carregandoVagas || fimDasVagas) return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const bodyHeight = document.body.offsetHeight;

    if (scrollTop + windowHeight >= bodyHeight - 200) {
        carregarMaisVagas();
        // A linha abaixo está causando um erro, pois 'vagas' não está definido globalmente aqui.
        // remova-a ou mova-a para dentro do .then() onde 'vagas' é um array real.
        // vagas.forEach(vaga => {
        //   console.log('🧾 Dados da vaga:', vaga);
        // });
    }
}

window.addEventListener('scroll', scrollVagasHandler);

// Função para carregar mais vagas
function carregarMaisVagas() {
    console.log('🔄 Carregando vagas página:', paginaVagas);
    carregandoVagas = true;
    document.getElementById('loading').style.display = 'block';

    fetch(`/vagas/load?page=${paginaVagas}`)
        .then(res => res.json())
        .then(vagas => { // 'vagas' aqui é o array retornado pelo backend
            const container = document.getElementById('vagas-container');

            if (vagas.length === 0) {
                fimDasVagas = true;
                window.removeEventListener('scroll', scrollVagasHandler);

                const fim = document.createElement('div');
                fim.className = 'no-vagas';
                fim.innerHTML = '<p>🛑 Você chegou ao fim das vagas publicadas.</p>';
                container.appendChild(fim);

                document.getElementById('loading').style.display = 'none';
                return;
            }

            vagas.forEach(vaga => {
                const coluna = document.createElement('div');
                coluna.className = 'card-column';

                const tempo = tempoDecorrido(vaga.createdAt);
                // CORREÇÃO AQUI: Use vaga.userPhoto e vaga.userName diretamente
                const foto = vaga.userPhoto || '/images/default-user.png';
                const nome = vaga.userName || 'Anônimo';

                coluna.innerHTML = `
                    <div class="custom-card">
                        <div class="card-content">
                            <h5>${vaga.jobTitle}</h5>
                            <p><strong>Empresa:</strong> ${vaga.companyName}</p>
                            <p><strong>Local:</strong> ${vaga.location}</p>
                            <p><strong>Tipo:</strong> ${vaga.jobType}</p>
                            <p><strong>Experiência:</strong> ${vaga.experienceLevel}</p>
                            ${vaga.salary ? `<p><strong>Salário:</strong> ${vaga.salary}</p>` : ''}
                            <p class="description">${vaga.jobDescription}</p>

                            <div class="user-info">
                                <img
                                    src="${foto}"
                                    alt="Foto de ${nome}"
                                    class="user-photo"
                                >
                                <span>✍️ Postado por ${nome}</span>
                            </div>

                            <p class="meta">🕒 Publicado ${tempo}</p>
                        </div>
                    </div>
                `;
                container.appendChild(coluna);
            });

            paginaVagas++;
            carregandoVagas = false;
            document.getElementById('loading').style.display = 'none';
        })
        .catch(err => {
            console.error('❌ Erro ao carregar vagas:', err);
            carregandoVagas = false;
            document.getElementById('loading').style.display = 'none';
        });
}

// Opcional: Adicione um listener DOMContentLoaded se este JS for carregado no <head>
// document.addEventListener('DOMContentLoaded', () => {
//   // Seus listeners de scroll e outras inicializações aqui
//   window.addEventListener('scroll', scrollVagasHandler);
// });