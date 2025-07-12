const express = require('express');
const PortfolioController = require('../controllers/PortfolioController');

const router = express.Router();
const portfolioController = new PortfolioController();

// Rotas do contexto Portfolio
router.get('/user/:userId', portfolioController.getPortfolio.bind(portfolioController));
router.post('/', portfolioController.createPortfolio.bind(portfolioController));
router.post('/user/:userId/positions', portfolioController.addPosition.bind(portfolioController));
router.delete('/user/:userId/positions/:assetId', portfolioController.removePosition.bind(portfolioController));
router.get('/user/:userId/performance', portfolioController.getPerformance.bind(portfolioController));
router.put('/user/:userId/prices', portfolioController.updatePrices.bind(portfolioController));

module.exports = router; 