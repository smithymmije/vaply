const express = require('express');
const router = express.Router();
const mainController = require('../controllers/mainController');

// Rotas públicas da aplicação
router.get('/', mainController.homepage);   // Homepage
router.get('/about', mainController.about); // Página institucional
router.get('/vagas/load', mainController.carregarMaisVagas); // 🆕 Scroll infinito para vagas
router.get('/vaga/:id', mainController.vagaDetalhes); // 🆕 Página de detalhes da vaga

module.exports = router;
