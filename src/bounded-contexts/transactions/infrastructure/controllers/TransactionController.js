const Transaction = require('../../domain/entities/Transaction');
const logger = require('../../../../shared/infrastructure/logger');

class TransactionController {
  constructor() {
    this.transactions = new Map();
  }

  async createTransaction(req, res) {
    try {
      const { userId, assetId, type, quantity, price } = req.body;
      
      if (!userId || !assetId || !type || !quantity || !price) {
        return res.status(400).json({
          error: 'Todos os campos sao obrigatorios'
        });
      }

      const transaction = new Transaction(userId, assetId, type, quantity, price);
      this.transactions.set(transaction.id, transaction);
      
      logger.info(`Transacao criada: ${transaction.id} - ${type} ${quantity} ${assetId}`);
      
      res.status(201).json({
        success: true,
        data: transaction
      });
    } catch (error) {
      logger.error(`Erro ao criar transacao: ${error.message}`);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }

  async getTransactions(req, res) {
    try {
      const { userId } = req.params;
      
      const userTransactions = Array.from(this.transactions.values())
        .filter(t => t.userId === userId);
      
      res.json({
        success: true,
        data: userTransactions
      });
    } catch (error) {
      logger.error(`Erro ao obter transacoes: ${error.message}`);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }

  async executeTransaction(req, res) {
    try {
      const { transactionId } = req.params;
      
      const transaction = this.transactions.get(transactionId);
      if (!transaction) {
        return res.status(404).json({
          error: 'Transacao nao encontrada'
        });
      }

      transaction.execute();
      
      logger.info(`Transacao executada: ${transactionId}`);
      
      res.json({
        success: true,
        data: transaction
      });
    } catch (error) {
      logger.error(`Erro ao executar transacao: ${error.message}`);
      res.status(400).json({
        error: 'Erro ao executar transacao',
        message: error.message
      });
    }
  }

  async cancelTransaction(req, res) {
    try {
      const { transactionId } = req.params;
      
      const transaction = this.transactions.get(transactionId);
      if (!transaction) {
        return res.status(404).json({
          error: 'Transacao nao encontrada'
        });
      }

      transaction.cancel();
      
      logger.info(`Transacao cancelada: ${transactionId}`);
      
      res.json({
        success: true,
        data: transaction
      });
    } catch (error) {
      logger.error(`Erro ao cancelar transacao: ${error.message}`);
      res.status(400).json({
        error: 'Erro ao cancelar transacao',
        message: error.message
      });
    }
  }
}

module.exports = TransactionController; 