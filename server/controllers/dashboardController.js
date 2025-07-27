// controllers/dashboardController.js
const Note = require('../models/Notes');
const Job  = require('../models/job');
const mongoose = require('mongoose');

const perPage = 9;

/* =========================================================
   DASHBOARD  –  LISTA TANTO NOTAS QUANTO VAGAS
   ========================================================= */
exports.dashboard = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);

  const locals = {
    title: 'Dashboard',
    description: 'Aplicação de Notas e Vagas em NodeJS'
  };

  try {
    /* NOTAS */
    const notes = await Note.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
      { $sort: { updatedAt: -1 } },
      {
        $project: {
          title: { $substr: ['$title', 0, 30] },
          body:  { $substr: ['$body',  0, 100] }
        }
      }
    ])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();

    const notesCount = await Note.countDocuments({ user: req.user.id });

    /* VAGAS */
    const jobs = await Job
      .find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(perPage * page - perPage)
      .limit(perPage)
      .lean();

    const jobsCount = await Job.countDocuments({ user: req.user.id });

    res.render('dashboard/index', {
      layout: '../views/layouts/dashboard',
      locals,
      userName: req.user.firstName,
      notes,
      jobs,
      current: page,
      pages: Math.max(
        Math.ceil(notesCount / perPage),
        Math.ceil(jobsCount  / perPage)
      )
    });

  } catch (err) {
    console.error('Erro ao carregar dashboard:', err);
    res.status(500).send('Erro interno do servidor.');
  }
};

/* =========================================================
   NOTAS – CRUD já existente
   ========================================================= */
exports.dashboardViewNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id }).lean();
    if (!note) {
      req.flash('info', 'Nota não encontrada ou acesso negado.');
      return res.redirect('/dashboard');
    }
    res.render('dashboard/view-note', {
      noteID: req.params.id, note,
      layout: '../views/layouts/dashboard'
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Erro ao visualizar nota.');
  }
};

exports.dashboardUpdateNote = async (req, res) => {
  try {
    await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { title: req.body.title, body: req.body.body, updatedAt: Date.now() },
      { new: true }
    );
    res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
    res.status(500).send('Erro ao atualizar nota.');
  }
};

exports.dashboardDeleteNote = async (req, res) => {
  try {
    await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
    res.status(500).send('Erro ao excluir nota.');
  }
};

exports.dashboardAddNote = (req, res) => {
  res.render('dashboard/add', { layout: '../views/layouts/dashboard' });
};

exports.dashboardAddNoteSubmit = async (req, res) => {
  try {
    req.body.user = req.user.id;
    await Note.create(req.body);
    res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
    res.status(500).send('Erro ao criar nota.');
  }
};

exports.dashboardSearch = (req, res) => {
  res.render('dashboard/search', {
    searchResults: '',
    layout: '../views/layouts/dashboard'
  });
};

exports.dashboardSearchSubmit = async (req, res) => {
    try {
      const term = (req.body.searchTerm || '').replace(/[^a-zA-Z0-9 ]/g, '');
      const userId = new mongoose.Types.ObjectId(req.user.id);
  
      /* Busca notas do usuário */
      const notes = await Note.find({
        user: userId,
        $or: [
          { title: { $regex: term, $options: 'i' } },
          { body:  { $regex: term, $options: 'i' } }
        ]
      }).lean();
  
      /* Busca vagas do usuário */
      const jobs = await Job.find({
        user: userId,
        $or: [
          { jobTitle:       { $regex: term, $options: 'i' } },
          { companyName:    { $regex: term, $options: 'i' } },
          { jobDescription: { $regex: term, $options: 'i' } }
        ]
      }).lean();
  
      res.render('dashboard/search', {
        notes,          // envia notas
        jobs,           // envia vagas
        layout: '../views/layouts/dashboard',
        locals: { title: 'Resultados da Busca' }
      });
  
    } catch (error) {
      console.error('Erro na busca:', error);
      res.status(500).send('Erro interno do servidor.');
    }
  };
/* =========================================================
   VAGAS – CRUD “espelhado” nas notas
   ========================================================= */

exports.dashboardAddJob = (req, res) => {
  res.render('dashboard/add', {
    layout: '../views/layouts/dashboard',
    locals: { title: 'Publicar Nova Vaga' }
  });
};

exports.dashboardAddJobSubmit = async (req, res) => {
  try {
    // ===> Validação inicial do usuário autenticado (MUITO IMPORTANTE!) <===
    // Sempre verifique se o usuário está logado antes de tentar usar req.user.id
    if (!req.user || !req.user.id) {
      req.flash('error', 'Você precisa estar logado para publicar uma vaga.');
      return res.redirect('/login'); // Redireciona para a página de login ou dashboard
    }

    // ===> Objeto 'newJob' com todos os campos do seu JobSchema <===
    // Mapeie req.body.[nomeDoCampo] para cada campo do seu schema.
    const newJob = {
      user: req.user.id, // O ID do usuário logado que está criando a vaga
      jobTitle: req.body.jobTitle,
      companyName: req.body.companyName,
      location: req.body.location,
      contractType: req.body.contractType,
      workSchedule: req.body.workSchedule,
      // Novos campos do seu schema:
      workScheduleDetails: req.body.workScheduleDetails,
      mission: req.body.mission,
      responsibilities: req.body.responsibilities, // Campo required
      education: req.body.education,
      experience: req.body.experience,
      technicalSkills: req.body.technicalSkills,
      desiredSkills: req.body.desiredSkills,
      differentials: req.body.differentials,
      salaryRange: req.body.salaryRange, // CORRIGIDO: usa salaryRange, não vagaSalary ou salary aninhado
      benefitsText: req.body.benefitsText, // O novo campo de benefícios
      applicationEmail: req.body.applicationEmail,
      applicationLink: req.body.applicationLink,
      applicationSite: req.body.applicationSite,
      submissionInstructions: req.body.submissionInstructions,
      deadline: req.body.deadline,
      institutionalMessage: req.body.institutionalMessage,
      isActive: true // Como definido no seu schema, o padrão é true
    };
    
    
    await Job.create(newJob);
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao salvar vaga.');
  }
};

exports.dashboardViewJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, user: req.user.id }).lean();
    if (!job) return res.redirect('/dashboard');
    res.render('dashboard/view-note', {
      jobID: req.params.id, job,
      layout: '../views/layouts/dashboard',
      locals: { title: job.jobTitle }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao visualizar vaga.');
  }
};

exports.dashboardUpdateJob = async (req, res) => {
  try {
    
    const updateData = {
      jobTitle: req.body.jobTitle,
      companyName: req.body.companyName,
      location: req.body.location,
      contractType: req.body.contractType,
      workSchedule: req.body.workSchedule,
      workScheduleDetails: req.body.workScheduleDetails,
      mission: req.body.mission,
      responsibilities: req.body.responsibilities,
      education: req.body.education,
      experience: req.body.experience,
      technicalSkills: req.body.technicalSkills,
      desiredSkills: req.body.desiredSkills,
      differentials: req.body.differentials,
      salaryRange: req.body.salaryRange,
      benefitsText: req.body.benefitsText,
      applicationEmail: req.body.applicationEmail,
      applicationLink: req.body.applicationLink,
      applicationSite: req.body.applicationSite,
      submissionInstructions: req.body.submissionInstructions,
      deadline: req.body.deadline,
      institutionalMessage: req.body.institutionalMessage,
      isActive: true,
      updatedAt: Date.now(),
    };

    await Job.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updateData,
      { new: true }
    );

    res.redirect('/dashboard/job/' + req.params.id);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao atualizar vaga.');
  }
};

exports.dashboardDeleteJob = async (req, res) => {
  try {
    await Job.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao excluir vaga.');
  }
};