const express = require('express');
const router = express.Router();
const mainController = require('../controllers/mainController');

//Rotas públicas da aplicação
router.get('/', mainController.homepage);   // Homepage: exibe todas as notas públicas
router.get('/about', mainController.about); // Página institucional ou descritiva
router.get('/notas/load', mainController.carregarMaisNotas);


// 📌 Aqui você pode adicionar futuras rotas públicas, como:
// router.get('/contact', mainController.contact);
// router.get('/faq', mainController.faq);

module.exports = router;
