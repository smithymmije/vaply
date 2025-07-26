// controllers/mainController.js
const Job = require('../models/job');
const User = require('../models/User'); // Certifique-se de importar seu modelo de usuário

const ITEMS_PER_PAGE = 6; // Número de vagas por página

/**
 * Helper para construir filtros de busca
 */
const buildSearchFilter = (searchQuery, fields) => {
    const filter = {};
    if (searchQuery) {
        filter.$or = fields.map(field => ({
            [field]: { $regex: searchQuery, $options: 'i' }
        }));
    }
    return filter;
};

/**
 * Função para calcular tempo decorrido
 * Esta função será passada para o template EJS para os cards da carga inicial.
 * Para cards carregados via AJAX, a mesma lógica deve estar no seu JS de frontend.
 */
const tempoDecorrido = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " anos";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " meses";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " dias";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " horas";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutos";
    return "há poucos segundos";
};


/**
 * GET /
 * Homepage pública – lista a PRIMEIRA PÁGINA de vagas ativas
 * Aceita ?search=termo para filtrar os resultados
 */
exports.homepage = async (req, res) => {
    const locals = {
        title: "vaply",
        description: "Aplicativo de Vagas.",
    };

    const searchQuery = req.query.search || "";

    try {
        const filtroVagas = buildSearchFilter(searchQuery, [
            'jobTitle',
            'companyName',
            'jobDescription'
        ]);
        filtroVagas.isActive = true;

        const vagasAtivas = await Job.find(filtroVagas)
            .populate('user', 'firstName profileImage') // <--- ADICIONADO: Popula o usuário e os campos desejados
            .sort({ createdAt: -1 })
            .limit(ITEMS_PER_PAGE)
            .lean();

        res.render('index', {
            locals,
            layout: '../views/layouts/front-page',
            // Mapeia as vagas para incluir userName e userPhoto no objeto da vaga
            // Isso facilita o acesso no template EJS e garante consistência com o frontend JS
            vagas: vagasAtivas.map(vaga => ({
                ...vaga,
                userName: vaga.user?.firstName || 'Anônimo', // Usa o nome do usuário populado ou 'Anônimo'
                userPhoto: vaga.user?.profileImage || '/images/default-user.png' // Usa a foto do usuário populada ou uma padrão
            })),
            userName: req.user?.firstName || null,
            userPhoto: req.user?.profileImage || null,
            search: searchQuery,
            tempoDecorrido: tempoDecorrido // <--- ADICIONADO: Passa a função para o EJS usar
        });

    } catch (error) {
        console.error("Erro na homepage:", error);
        res.status(500).send("Erro ao carregar conteúdo da homepage.");
    }
};

/**
 * GET /vagas/load
 * Scroll para carregar a PRÓXIMA PÁGINA de vagas (JSON)
 */
exports.carregarMaisVagas = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const searchQuery = req.query.search || "";

        const filtro = buildSearchFilter(searchQuery, [
            'jobTitle',
            'companyName',
            'jobDescription'
        ]);
        filtro.isActive = true;

        const vagas = await Job.find(filtro)
            .populate('user', 'firstName profileImage') // <--- ADICIONADO: Popula o usuário e os campos desejados
            .sort({ createdAt: -1 })
            .skip(ITEMS_PER_PAGE * (page - 1))
            .limit(ITEMS_PER_PAGE)
            .lean();

        // Mapeia os dados para o formato que o frontend espera, incluindo info do usuário
        res.json(vagas.map(vaga => ({
            _id: vaga._id, // Importante para o frontend rastrear cards
            jobTitle: vaga.jobTitle,
            companyName: vaga.companyName,
            location: vaga.location,
            jobType: vaga.jobType,
            experienceLevel: vaga.experienceLevel,
            salary: vaga.salary,
            jobDescription: vaga.jobDescription,
            createdAt: vaga.createdAt, // Necessário para a função timeAgo no frontend
            userName: vaga.user?.firstName || 'Anônimo',
            userPhoto: vaga.user?.profileImage || '/images/default-user.png'
        })));
    } catch (error) {
        console.error("Erro ao carregar vagas via scroll:", error);
        res.status(500).json({ error: 'Erro ao carregar mais vagas.' });
    }
};

/**
 * GET /about
 * Página estática "Sobre"
 */
exports.about = async (req, res) => {
    const locals = {
        title: "Sobre - vaply",
        description: "Aplicativo de Vagas.",
    };

    res.render('about', {
        locals,
        layout: '../views/layouts/front-page'
    });
};