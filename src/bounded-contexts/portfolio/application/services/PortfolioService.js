const Portfolio = require('../../domain/entities/Portfolio');
const logger = require('../../../../shared/infrastructure/logger');

class PortfolioService {
  constructor(portfolioRepository) {
    this.portfolioRepository = portfolioRepository;
  }

  async createPortfolio(userId, name) {
    try {
      const portfolio = new Portfolio(userId, name);
      await this.portfolioRepository.save(portfolio);
      
      logger.info(`Portfolio criado para usuario ${userId}`);
      return portfolio;
    } catch (error) {
      logger.error(`Erro ao criar portfolio: ${error.message}`);
      throw error;
    }
  }

  async getPortfolioByUserId(userId) {
    try {
      const portfolio = await this.portfolioRepository.findByUserId(userId);
      
      if (!portfolio) {
        // Cria portfolio automaticamente se não existir
        return await this.createPortfolio(userId);
      }
      
      return portfolio;
    } catch (error) {
      logger.error(`Erro ao buscar portfolio do usuario ${userId}: ${error.message}`);
      throw error;
    }
  }

  async addPositionToPortfolio(userId, positionData) {
    try {
      const portfolio = await this.getPortfolioByUserId(userId);
      
      // Validar dados da posição
      this.validatePositionData(positionData);
      
      portfolio.addPosition(positionData);
      await this.portfolioRepository.save(portfolio);
      
      logger.info(`Posicao adicionada ao portfolio do usuario ${userId}: ${positionData.assetId}`);
      return portfolio;
    } catch (error) {
      logger.error(`Erro ao adicionar posicao ao portfolio: ${error.message}`);
      throw error;
    }
  }

  async removePositionFromPortfolio(userId, assetId, quantity) {
    try {
      const portfolio = await this.getPortfolioByUserId(userId);
      
      portfolio.removePosition(assetId, quantity);
      await this.portfolioRepository.save(portfolio);
      
      logger.info(`Posicao removida do portfolio do usuario ${userId}: ${assetId}`);
      return portfolio;
    } catch (error) {
      logger.error(`Erro ao remover posicao do portfolio: ${error.message}`);
      throw error;
    }
  }

  async getPortfolioPerformance(userId) {
    try {
      const portfolio = await this.getPortfolioByUserId(userId);
      
      return {
        totalValue: portfolio.totalValue,
        totalInvested: portfolio.totalInvested,
        totalReturn: portfolio.totalReturn,
        returnPercentage: portfolio.returnPercentage,
        diversification: portfolio.getDiversification(),
        positionsCount: portfolio.positions.length
      };
    } catch (error) {
      logger.error(`Erro ao obter performance do portfolio: ${error.message}`);
      throw error;
    }
  }

  async updatePortfolioPrices(userId, priceUpdates) {
    try {
      const portfolio = await this.getPortfolioByUserId(userId);
      
      priceUpdates.forEach(update => {
        const position = portfolio.getPositionByAsset(update.assetId);
        if (position) {
          position.currentPrice = update.price;
          position.marketValue = position.quantity * update.price;
          position.updatedAt = new Date();
        }
      });
      
      portfolio.recalculatePortfolioValue();
      await this.portfolioRepository.save(portfolio);
      
      logger.info(`Precos atualizados no portfolio do usuario ${userId}`);
      return portfolio;
    } catch (error) {
      logger.error(`Erro ao atualizar precos do portfolio: ${error.message}`);
      throw error;
    }
  }

  validatePositionData(positionData) {
    const required = ['assetId', 'assetType', 'quantity', 'price'];
    
    for (const field of required) {
      if (!positionData[field]) {
        throw new Error(`Campo obrigatorio ausente: ${field}`);
      }
    }
    
    if (positionData.quantity <= 0) {
      throw new Error('Quantidade deve ser maior que zero');
    }
    
    if (positionData.price <= 0) {
      throw new Error('Preco deve ser maior que zero');
    }
  }
}

module.exports = PortfolioService; 