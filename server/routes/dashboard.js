// routes/dashboard.js
const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/checkAuth');
const dashboardController = require('../controllers/dashboardController');

/**
 * Dashboard Routes (Existing)
 */
router.get('/dashboard', isLoggedIn, dashboardController.dashboard);
router.get('/dashboard/item/:id', isLoggedIn, dashboardController.dashboardViewNote);
router.put('/dashboard/item/:id', isLoggedIn, dashboardController.dashboardUpdateNote);
router.delete('/dashboard/item-delete/:id', isLoggedIn, dashboardController.dashboardDeleteNote);
router.get('/dashboard/add', isLoggedIn, dashboardController.dashboardAddNote); // Rota para o formulário de adicionar NOTA
router.post('/dashboard/add', isLoggedIn, dashboardController.dashboardAddNoteSubmit); // Rota para submeter NOTA
router.get('/dashboard/search', isLoggedIn, dashboardController.dashboardSearch);
router.post('/dashboard/search', isLoggedIn, dashboardController.dashboardSearchSubmit);

/**
 * Job Posting Routes (NOVAS ROTAS PARA VAGAS)
 */

// Rota para exibir o formulário de publicação de vaga
// É uma boa prática ter uma rota GET para renderizar a página do formulário
router.get('/dashboard/add-job', isLoggedIn, dashboardController.dashboardAddJob);

// Rota para submeter os dados do formulário de publicação de vaga
router.post('/dashboard/add-job', isLoggedIn, dashboardController.dashboardAddJobSubmit);

// Opcional: Rotas para visualizar e editar uma vaga específica
router.get('/dashboard/job/:id', isLoggedIn, dashboardController.dashboardViewJob);
router.put('/dashboard/job/:id', isLoggedIn, dashboardController.dashboardUpdateJob);
router.delete('/dashboard/job-delete/:id', isLoggedIn, dashboardController.dashboardDeleteJob);


module.exports = router;