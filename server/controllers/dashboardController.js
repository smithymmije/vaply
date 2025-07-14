// controllers/dashboardController.js
const Note = require('../models/Notes'); // Modelo existente para notas
const Job = require('../models/job');     // ✅ NOVO: Importar o modelo Job
const mongoose = require('mongoose');

/**
 * GET /
 * Dashboard pessoal do usuário (ainda para Notas, mas pode ser expandido para Vagas depois)
 */
exports.dashboard = async (req, res) => {
    const perPage = 10;
    const page = req.query.page || 1;

    const locals = {
        title: "Dashboard",
        description: "Aplicação de Notas e Vagas em NodeJS", // Atualizei a descrição
    };

    try {
        // Busca notas do usuário com paginação (mantido como está)
        const notes = await Note.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
            { $sort: { updatedAt: -1 } },
            {
                $project: {
                    title: { $substr: ["$title", 0, 30] },
                    body: { $substr: ["$body", 0, 100] }
                }
            }
        ])
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec();

        const count = await Note.countDocuments({ user: req.user.id });

        // ✅ Opcional: Você pode querer buscar as vagas do usuário aqui também
        // const jobs = await Job.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(10).lean();

        res.render('dashboard/index', {
            userName: req.user.firstName,
            // userPhoto: req.user.googleId ? req.user.photo : null, // Se você tiver foto do usuário
            locals,
            notes,
            // jobs, // Se decidir buscar vagas aqui
            layout: "../views/layouts/dashboard",
            current: page,
            pages: Math.ceil(count / perPage)
        });

    } catch (error) {
        console.log("Erro ao carregar dashboard:", error);
        res.status(500).send("Erro interno do servidor.");
    }
};

/**
 * GET /
 * Visualizar nota específica (mantido)
 */
exports.dashboardViewNote = async (req, res) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, user: req.user.id }).lean();

        if (!note) {
            req.flash('info', 'Nota não encontrada ou acesso negado.'); // Exemplo de flash message
            return res.redirect('/dashboard');
        }

        res.render('dashboard/view-note', {
            noteID: req.params.id,
            note,
            layout: '../views/layouts/dashboard'
        });

    } catch (error) {
        console.log("Erro ao visualizar nota:", error);
        res.status(500).send("Erro interno do servidor.");
    }
};

/**
 * PUT /
 * Atualizar nota específica (mantido)
 */
exports.dashboardUpdateNote = async (req, res) => {
    try {
        await Note.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            {
                title: req.body.title,
                body: req.body.body,
                updatedAt: Date.now()
            },
            { new: true } // Retorna o documento atualizado
        );
        res.redirect('/dashboard');
    } catch (error) {
        console.log("Erro ao atualizar nota:", error);
        res.status(500).send("Erro interno do servidor.");
    }
};

/**
 * DELETE /
 * Excluir nota específica (mantido)
 */
exports.dashboardDeleteNote = async (req, res) => {
    try {
        await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        res.redirect('/dashboard');
    } catch (error) {
        console.log("Erro ao excluir nota:", error);
        res.status(500).send("Erro interno do servidor.");
    }
};

/**
 * GET /
 * Formulário para adicionar nota (mantido)
 */
exports.dashboardAddNote = async (req, res) => {
    res.render('dashboard/add', {
        layout: '../views/layouts/dashboard'
    });
};

/**
 * POST /
 * Adicionar nota (mantido)
 */
exports.dashboardAddNoteSubmit = async (req, res) => {
    try {
        // Se você não quer que `isPublic` seja controlado pelo formulário, remova-o do req.body.
        // req.body.isPublic é definido como true por padrão no schema, se não for enviado.
        req.body.user = req.user.id; // Atribui o ID do usuário logado à nota
        await Note.create(req.body);
        res.redirect("/dashboard");
    } catch (error) {
        console.log("Erro ao criar nota:", error);
        // Exemplo de como enviar um erro mais específico para o cliente
        res.status(500).send("Erro ao criar nota. Verifique os dados e tente novamente.");
    }
};

/**
 * GET /
 * Página de busca (mantido)
 */
exports.dashboardSearch = async (req, res) => {
    res.render("dashboard/search", {
        searchResults: "",
        layout: "../views/layouts/dashboard",
    });
};

/**
 * POST /
 * Buscar notas pessoais (mantido)
 */
exports.dashboardSearchSubmit = async (req, res) => {
    try {
        const searchTerm = req.body.searchTerm || "";
        const cleanTerm = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");

        const searchResults = await Note.find({
            user: req.user.id,
            $or: [
                { title: { $regex: new RegExp(cleanTerm, 'i') } },
                { body: { $regex: new RegExp(cleanTerm, 'i') } }
            ]
        }).lean();

        res.render("dashboard/search", {
            searchResults,
            layout: "../views/layouts/dashboard"
        });

    } catch (error) {
        console.log("Erro na busca:", error);
        res.status(500).send("Erro interno do servidor na busca.");
    }
};


/* ==================================================================== */
/* === NOVAS FUNÇÕES PARA VAGAS DE EMPREGO (JOBS) ==================== */
/* ==================================================================== */

/**
 * GET /dashboard/add-job
 * Formulário para adicionar uma nova vaga
 */
exports.dashboardAddJob = async (req, res) => {
    try {
        res.render('dashboard/add-job', { // ✅ Renderiza a view 'add-job.ejs'
            layout: '../views/layouts/dashboard',
            locals: {
                title: "Publicar Nova Vaga",
                description: "Formulário para publicar uma nova vaga de emprego."
            }
        });
    } catch (error) {
        console.log("Erro ao carregar formulário de vaga:", error);
        res.status(500).send("Não foi possível carregar o formulário de publicação de vaga.");
    }
};


/**
 * POST /dashboard/add-job
 * Adicionar uma nova vaga
 */
exports.dashboardAddJobSubmit = async (req, res) => {
    try {
        // Verifica se req.user.id está disponível (garantido pelo isLoggedIn middleware)
        if (!req.user || !req.user.id) {
            console.error("ID do usuário não encontrado na requisição para adicionar vaga.");
            return res.status(401).send("Usuário não autenticado ou ID do usuário ausente.");
        }

        // Extrai os dados do corpo da requisição (req.body)
        const newJobData = {
            user: req.user.id, // Associa a vaga ao usuário logado
            jobTitle: req.body.jobTitle,
            companyName: req.body.companyName,
            location: req.body.location,
            jobType: req.body.jobType,
            experienceLevel: req.body.experienceLevel,
            salary: req.body.salary,
            jobDescription: req.body.jobDescription,
            isActive: true // Vagas recém-criadas são ativas por padrão
        };

        // Cria uma nova instância do modelo Job com os dados
        const newJob = await Job.create(newJobData);

        // Opcional: Flash message de sucesso
        // req.flash('info', 'Vaga publicada com sucesso!');

        // Redireciona para o dashboard ou para uma página de sucesso/visualização da vaga
        res.redirect('/dashboard'); // Ou '/dashboard/job/' + newJob._id
    } catch (error) {
        // Lidar com erros de validação do Mongoose ou outros erros
        if (error.name === 'ValidationError') {
            console.error("Erro de validação ao criar vaga:", error.message);
            // Você pode renderizar o formulário novamente com mensagens de erro
            return res.status(400).render('dashboard/add-job', {
                layout: '../views/layouts/dashboard',
                locals: {
                    title: "Erro ao Publicar Vaga",
                    description: "Por favor, verifique os campos obrigatórios."
                },
                jobData: req.body, // Para preencher o formulário novamente
                errors: error.errors // Enviar erros de validação
            });
        }
        console.error("Erro ao criar vaga:", error);
        res.status(500).send("Erro interno do servidor ao publicar a vaga.");
    }
};

/**
 * GET /dashboard/job/:id
 * Visualizar uma vaga específica (Opcional)
 */
exports.dashboardViewJob = async (req, res) => {
    try {
        const job = await Job.findOne({ _id: req.params.id, user: req.user.id }).lean();

        if (!job) {
            // req.flash('info', 'Vaga não encontrada ou acesso negado.');
            return res.redirect('/dashboard');
        }

        res.render('dashboard/view-job', { // Renderiza uma nova view para ver a vaga
            jobID: req.params.id,
            job,
            layout: '../views/layouts/dashboard',
            locals: {
                title: job.jobTitle, // Título da página será o título da vaga
                description: "Detalhes da vaga de emprego."
            }
        });
    } catch (error) {
        console.log("Erro ao visualizar vaga:", error);
        res.status(500).send("Erro interno do servidor ao visualizar vaga.");
    }
};

/**
 * PUT /dashboard/job/:id
 * Atualizar uma vaga específica (Opcional)
 */
exports.dashboardUpdateJob = async (req, res) => {
    try {
        await Job.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            {
                jobTitle: req.body.jobTitle,
                companyName: req.body.companyName,
                location: req.body.location,
                jobType: req.body.jobType,
                experienceLevel: req.body.experienceLevel,
                salary: req.body.salary,
                jobDescription: req.body.jobDescription,
                updatedAt: Date.now() // Atualiza o timestamp de modificação
            },
            { new: true, runValidators: true } // Retorna o doc atualizado e roda as validações do schema
        );
        res.redirect('/dashboard/job/' + req.params.id); // Redireciona para a própria vaga após atualizar
    } catch (error) {
        console.log("Erro ao atualizar vaga:", error);
        res.status(500).send("Erro interno do servidor ao atualizar vaga.");
    }
};

/**
 * DELETE /dashboard/job-delete/:id
 * Excluir uma vaga específica (Opcional)
 */
exports.dashboardDeleteJob = async (req, res) => {
    try {
        await Job.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        // req.flash('info', 'Vaga excluída com sucesso!');
        res.redirect('/dashboard'); // Redireciona para o dashboard após exclusão
    } catch (error) {
        console.log("Erro ao excluir vaga:", error);
        res.status(500).send("Erro interno do servidor ao excluir vaga.");
    }
};

/**
 * VISUALIZAR no dashboarder
 * 
 */
exports.dashboard = async (req, res) => {
  try {
    const vagasDoUsuario = await Job.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    res.render('dashboard/index', {
      layout: '../views/layouts/dashboard',
      userName: req.user.firstName,
      userPhoto: req.user.profileImage,
      vagas: vagasDoUsuario // 👈 ESSENCIAL para funcionar no EJS!
    });
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error);
    res.status(500).send('Erro interno ao carregar a dashboard.');
  }
};