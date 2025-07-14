const Note = require('../models/Notes');
const Job = require('../models/job'); // 👈 novo modelo

/**
 * GET /
 * Homepage pública (primeira carga sem paginação)
 */
exports.homepage = async (req, res) => {
  const locals = {
    title: "Vagora",
    description: "Aplicativo de Notas e Vagas.",
  };

  const searchQuery = req.query.search || "";

  try {
    const filtroNotas = { isPublic: true };

    if (searchQuery) {
      filtroNotas.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { body:  { $regex: searchQuery, $options: 'i' } }
      ];
    }

    // 📋 Buscar notas públicas
    const notasPublicas = await Note.find(filtroNotas)
      .populate('user', 'firstName')
      .sort({ updatedAt: -1 })
      .limit(9)
      .lean();

    // 💼 Buscar vagas ativas
    const vagasAtivas = await Job.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(9)
      .lean();

    const userName = req.user ? req.user.firstName : null;
    const userPhoto = req.user ? req.user.profileImage : null;

    // 🎯 Renderizar homepage com notas + vagas
    res.render('index', {
      locals,
      layout: '../views/layouts/front-page',
      notas: notasPublicas.map(nota => ({
        ...nota,
        userName: nota.user?.firstName || 'Anônimo'
      })),
      vagas: vagasAtivas,
      userName,
      userPhoto,
      search: searchQuery
    });

  } catch (error) {
    console.log("Erro na homepage:", error);
    res.status(500).send("Erro ao carregar conteúdo da homepage.");
  }
};


/**
 * GET /notas/load
 * Retorna notas públicas paginadas (JSON) para scroll infinito via JavaScript
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
    console.log("Erro ao carregar notas via scroll:", error);
    res.status(500).json({ error: 'Erro ao carregar mais notas.' });
  }
};


/**
 * GET /about
 * Página Sobre
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
