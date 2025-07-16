// controllers/dashboardController.js
const Note = require('../models/Notes');
const Job  = require('../models/job');
const mongoose = require('mongoose');

const perPage = 10;

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
    const newJob = {
      user: req.user.id,
      jobTitle: req.body.jobTitle,
      companyName: req.body.companyName,
      location: req.body.location,
      jobType: req.body.jobType,
      experienceLevel: req.body.experienceLevel,
      salary: req.body.salary,
      jobDescription: req.body.jobDescription,
      isActive: true
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
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
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