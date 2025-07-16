// controllers/mainController.js
const Note = require('../models/Notes');
const Job  = require('../models/job');

/**
 * GET /
 * Homepage pública – lista notas públicas + vagas ativas
 * Aceita ?search=termo  para filtrar ambos os conteúdos
 */
exports.homepage = async (req, res) => {
  const locals = {
    title: "Vagora",
    description: "Aplicativo de Notas e Vagas.",
  };

  const searchQuery = req.query.search || "";

  try {
    /* ---------- NOTAS PÚBLICAS ---------- */
    const filtroNotas = { isPublic: true };
    if (searchQuery) {
      filtroNotas.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { body:  { $regex: searchQuery, $options: 'i' } }
      ];
    }

    const notasPublicas = await Note.find(filtroNotas)
      .populate('user', 'firstName')
      .sort({ updatedAt: -1 })
      .limit(9)
      .lean();

    /* ---------- VAGAS ATIVAS ---------- */
    const filtroVagas = { isActive: true };
    if (searchQuery) {
      filtroVagas.$or = [
        { jobTitle:       { $regex: searchQuery, $options: 'i' } },
        { companyName:    { $regex: searchQuery, $options: 'i' } },
        { jobDescription: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    const vagasAtivas = await Job.find(filtroVagas)
      .sort({ createdAt: -1 })
      .limit(9)
      .lean();

    /* ---------- RENDER ---------- */
    res.render('index', {
      locals,
      layout: '../views/layouts/front-page',
      notas: notasPublicas.map(nota => ({
        ...nota,
        userName: nota.user?.firstName || 'Anônimo'
      })),
      vagas: vagasAtivas,
      userName: req.user?.firstName || null,
      userPhoto: req.user?.profileImage || null,
      search: searchQuery
    });

  } catch (error) {
    console.error("Erro na homepage:", error);
    res.status(500).send("Erro ao carregar conteúdo da homepage.");
  }
};

/**
 * GET /notas/load
 * Scroll infinito: mais notas públicas (JSON)
 */
exports.carregarMaisNotas = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const perPage = 9;
  const searchQuery = req.query.search || "";

  const filtro = { isPublic: true };
  if (searchQuery) {
    filtro.$or = [
      { title: { $regex: searchQuery, $options: 'i' } },
      { body:  { $regex: searchQuery, $options: 'i' } }
    ];
  }

  try {
    const notas = await Note.find(filtro)
      .populate('user', 'firstName')
      .sort({ updatedAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .lean();

    res.json(notas.map(nota => ({
      _id: nota._id,
      title: nota.title,
      body: nota.body,
      createdAt: nota.createdAt,
      userName: nota.user?.firstName || 'Anônimo'
    })));
  } catch (error) {
    console.error("Erro ao carregar notas via scroll:", error);
    res.status(500).json({ error: 'Erro ao carregar mais notas.' });
  }
};

/**
 * GET /vagas/load
 * Scroll infinito: mais vagas públicas (JSON)
 */
exports.carregarMaisVagas = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const perPage = 9;
  const searchQuery = req.query.search || "";

  const filtro = { isActive: true };
  if (searchQuery) {
    filtro.$or = [
      { jobTitle:       { $regex: searchQuery, $options: 'i' } },
      { companyName:    { $regex: searchQuery, $options: 'i' } },
      { jobDescription: { $regex: searchQuery, $options: 'i' } }
    ];
  }

  try {
    const vagas = await Job.find(filtro)
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .lean();

    res.json(vagas);
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
    title: "Sobre - Vagora",
    description: "Aplicativo de Notas e Vagas.",
  };

  res.render('about', {
    locals,
    layout: '../views/layouts/front-page'
  });
};