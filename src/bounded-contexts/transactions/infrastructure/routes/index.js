const express = require('express');
const TransactionController = require('../controllers/TransactionController');

const router = express.Router();
const transactionController = new TransactionController();

// Rotas do contexto Transactions
router.post('/', transactionController.createTransaction.bind(transactionController));
router.get('/user/:userId', transactionController.getTransactions.bind(transactionController));
router.put('/:transactionId/execute', transactionController.executeTransaction.bind(transactionController));
router.put('/:transactionId/cancel', transactionController.cancelTransaction.bind(transactionController));

module.exports = router; 