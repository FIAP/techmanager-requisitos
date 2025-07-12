const Portfolio = require('./Portfolio');

describe('Portfolio Entity', () => {
  let portfolio;
  const userId = 'test-user-id';

  beforeEach(() => {
    portfolio = new Portfolio(userId);
  });

  describe('constructor', () => {
    it('should create a portfolio with correct initial values', () => {
      expect(portfolio.userId).toBe(userId);
      expect(portfolio.name).toBe('Carteira Principal');
      expect(portfolio.positions).toEqual([]);
      expect(portfolio.totalValue).toBe(0);
      expect(portfolio.totalInvested).toBe(0);
      expect(portfolio.totalReturn).toBe(0);
      expect(portfolio.returnPercentage).toBe(0);
      expect(portfolio.id).toBeDefined();
      expect(portfolio.createdAt).toBeInstanceOf(Date);
      expect(portfolio.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a portfolio with custom name', () => {
      const customPortfolio = new Portfolio(userId, 'Carteira Personalizada');
      expect(customPortfolio.name).toBe('Carteira Personalizada');
    });
  });

  describe('addPosition', () => {
    const positionData = {
      assetId: 'ASSET001',
      assetType: 'STOCKS',
      quantity: 100,
      price: 50.00
    };

    it('should add a new position to empty portfolio', () => {
      portfolio.addPosition(positionData);
      
      expect(portfolio.positions).toHaveLength(1);
      expect(portfolio.positions[0].assetId).toBe('ASSET001');
      expect(portfolio.positions[0].quantity).toBe(100);
      expect(portfolio.positions[0].averagePrice).toBe(50.00);
      expect(portfolio.totalValue).toBe(5000);
      expect(portfolio.totalInvested).toBe(5000);
    });

    it('should merge positions with same asset', () => {
      portfolio.addPosition(positionData);
      portfolio.addPosition({
        ...positionData,
        quantity: 50,
        price: 60.00
      });

      expect(portfolio.positions).toHaveLength(1);
      expect(portfolio.positions[0].quantity).toBe(150);
      // Preço médio: (100 * 50 + 50 * 60) / 150 = 53.33
      expect(portfolio.positions[0].averagePrice).toBeCloseTo(53.33, 2);
    });

    it('should recalculate portfolio values after adding position', () => {
      portfolio.addPosition(positionData);
      
      expect(portfolio.totalValue).toBe(5000);
      expect(portfolio.totalInvested).toBe(5000);
      expect(portfolio.totalReturn).toBe(0);
      expect(portfolio.returnPercentage).toBe(0);
    });
  });

  describe('removePosition', () => {
    beforeEach(() => {
      portfolio.addPosition({
        assetId: 'ASSET001',
        assetType: 'STOCKS',
        quantity: 100,
        price: 50.00
      });
    });

    it('should remove partial quantity from position', () => {
      portfolio.removePosition('ASSET001', 30);
      
      expect(portfolio.positions).toHaveLength(1);
      expect(portfolio.positions[0].quantity).toBe(70);
      expect(portfolio.totalValue).toBe(3500);
    });

    it('should remove entire position when quantity matches', () => {
      portfolio.removePosition('ASSET001', 100);
      
      expect(portfolio.positions).toHaveLength(0);
      expect(portfolio.totalValue).toBe(0);
    });

    it('should throw error when position not found', () => {
      expect(() => {
        portfolio.removePosition('NONEXISTENT', 10);
      }).toThrow('Posicao nao encontrada na carteira');
    });

    it('should throw error when insufficient quantity', () => {
      expect(() => {
        portfolio.removePosition('ASSET001', 150);
      }).toThrow('Quantidade insuficiente para remover');
    });
  });

  describe('calculateAveragePrice', () => {
    it('should calculate correct average price', () => {
      const avgPrice = portfolio.calculateAveragePrice(100, 50, 50, 60);
      expect(avgPrice).toBeCloseTo(53.33, 2);
    });

    it('should handle zero quantities', () => {
      const avgPrice = portfolio.calculateAveragePrice(0, 0, 100, 50);
      expect(avgPrice).toBe(50);
    });
  });

  describe('getDiversification', () => {
    beforeEach(() => {
      portfolio.addPosition({
        assetId: 'STOCK001',
        assetType: 'STOCKS',
        quantity: 100,
        price: 50.00
      });
      portfolio.addPosition({
        assetId: 'BOND001',
        assetType: 'FIXED_INCOME',
        quantity: 50,
        price: 100.00
      });
    });

    it('should calculate diversification percentages', () => {
      const diversification = portfolio.getDiversification();
      
      expect(diversification.STOCKS).toBe(50);
      expect(diversification.FIXED_INCOME).toBe(50);
    });
  });

  describe('getPositionByAsset', () => {
    beforeEach(() => {
      portfolio.addPosition({
        assetId: 'ASSET001',
        assetType: 'STOCKS',
        quantity: 100,
        price: 50.00
      });
    });

    it('should return position when asset exists', () => {
      const position = portfolio.getPositionByAsset('ASSET001');
      expect(position).toBeDefined();
      expect(position.assetId).toBe('ASSET001');
    });

    it('should return undefined when asset not found', () => {
      const position = portfolio.getPositionByAsset('NONEXISTENT');
      expect(position).toBeUndefined();
    });
  });

  describe('recalculatePortfolioValue', () => {
    beforeEach(() => {
      portfolio.addPosition({
        assetId: 'ASSET001',
        assetType: 'STOCKS',
        quantity: 100,
        price: 50.00
      });
    });

    it('should recalculate values correctly after price change', () => {
      // Simular mudança de preço
      portfolio.positions[0].currentPrice = 60.00;
      portfolio.recalculatePortfolioValue();
      
      expect(portfolio.totalValue).toBe(6000);
      expect(portfolio.totalInvested).toBe(5000);
      expect(portfolio.totalReturn).toBe(1000);
      expect(portfolio.returnPercentage).toBe(20);
    });

    it('should handle negative returns', () => {
      portfolio.positions[0].currentPrice = 40.00;
      portfolio.recalculatePortfolioValue();
      
      expect(portfolio.totalValue).toBe(4000);
      expect(portfolio.totalReturn).toBe(-1000);
      expect(portfolio.returnPercentage).toBe(-20);
    });
  });
}); 