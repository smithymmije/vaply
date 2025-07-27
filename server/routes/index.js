const express = require('express');
const router = express.Router();
const mainController = require('../controllers/mainController');
const Job = require('../models/job'); // Importa o modelo para gerar o sitemap

// Rotas públicas da aplicação
router.get('/', mainController.homepage);   // Homepage
router.get('/about', mainController.about); // Página institucional
router.get('/vagas/load', mainController.carregarMaisVagas); // 🆕 Scroll infinito para vagas
router.get('/vaga/:id', mainController.vagaDetalhes); // 🆕 Página de detalhes da vaga

// Rota do sitemap.xml
router.get('/sitemap.xml', async (req, res) => {
  try {
    const jobs = await Job.find({ isActive: true }).sort({ createdAt: -1 }).lean();

    const urls = jobs.map(job => `
      <url>
        <loc>https://vaply.com.br/vaga/${job._id}</loc>
        <lastmod>${job.updatedAt ? job.updatedAt.toISOString() : job.createdAt.toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>
    `).join('');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
          <loc>https://vaply.com.br/</loc>
          <changefreq>daily</changefreq>
          <priority>1.0</priority>
        </url>
        ${urls}
      </urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error("Erro ao gerar sitemap:", error);
    res.status(500).send("Erro ao gerar sitemap");
  }
});

module.exports = router;
