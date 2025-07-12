const PortfolioService = require('../../application/services/PortfolioService');
const PortfolioRepository = require('../repositories/PortfolioRepository');
const logger = require('../../../../shared/infrastructure/logger');

class PortfolioController {
  constructor() {
    this.portfolioRepository = new PortfolioRepository();
    this.portfolioService = new PortfolioService(this.portfolioRepository);
  }

  async getPortfolio(req, res) {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({
          error: 'ID do usuario eh obrigatorio'
        });
      }

      const portfolio = await this.portfolioService.getPortfolioByUserId(userId);
      
      res.json({
        success: true,
        data: portfolio
      });
    } catch (error) {
      logger.error(`Erro ao obter portfolio: ${error.message}`);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }

  async createPortfolio(req, res) {
    try {
      const { userId, name } = req.body;
      
      if (!userId) {
        return res.status(400).json({
          error: 'ID do usuario eh obrigatorio'
        });
      }

      const portfolio = await this.portfolioService.createPortfolio(userId, name);
      
      res.status(201).json({
        success: true,
        data: portfolio
      });
    } catch (error) {
      logger.error(`Erro ao criar portfolio: ${error.message}`);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }

  async addPosition(req, res) {
    try {
      const { userId } = req.params;
      const positionData = req.body;
      
      if (!userId) {
        return res.status(400).json({
          error: 'ID do usuario eh obrigatorio'
        });
      }

      const portfolio = await this.portfolioService.addPositionToPortfolio(userId, positionData);
      
      res.json({
        success: true,
        data: portfolio
      });
    } catch (error) {
      logger.error(`Erro ao adicionar posicao: ${error.message}`);
      res.status(400).json({
        error: 'Erro ao adicionar posicao',
        message: error.message
      });
    }
  }

  async removePosition(req, res) {
    try {
      const { userId, assetId } = req.params;
      const { quantity } = req.body;
      
      if (!userId || !assetId) {
        return res.status(400).json({
          error: 'ID do usuario e do ativo sao obrigatorios'
        });
      }

      const portfolio = await this.portfolioService.removePositionFromPortfolio(
        userId, 
        assetId, 
        quantity
      );
      
      res.json({
        success: true,
        data: portfolio
      });
    } catch (error) {
      logger.error(`Erro ao remover posicao: ${error.message}`);
      res.status(400).json({
        error: 'Erro ao remover posicao',
        message: error.message
      });
    }
  }

  async getPerformance(req, res) {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({
          error: 'ID do usuario eh obrigatorio'
        });
      }

      const performance = await this.portfolioService.getPortfolioPerformance(userId);
      
      res.json({
        success: true,
        data: performance
      });
    } catch (error) {
      logger.error(`Erro ao obter performance: ${error.message}`);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }

  async updatePrices(req, res) {
    try {
      const { userId } = req.params;
      const { priceUpdates } = req.body;
      
      if (!userId) {
        return res.status(400).json({
          error: 'ID do usuario eh obrigatorio'
        });
      }

      if (!priceUpdates || !Array.isArray(priceUpdates)) {
        return res.status(400).json({
          error: 'Lista de atualizacoes de precos eh obrigatoria'
        });
      }

      const portfolio = await this.portfolioService.updatePortfolioPrices(userId, priceUpdates);
      
      res.json({
        success: true,
        data: portfolio
      });
    } catch (error) {
      logger.error(`Erro ao atualizar precos: ${error.message}`);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
}

module.exports = PortfolioController; 