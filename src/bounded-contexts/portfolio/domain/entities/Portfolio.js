const { v4: uuidv4 } = require('uuid');

class Portfolio {
  constructor(userId, name = 'Carteira Principal') {
    this.id = uuidv4();
    this.userId = userId;
    this.name = name;
    this.positions = [];
    this.totalValue = 0;
    this.totalInvested = 0;
    this.totalReturn = 0;
    this.returnPercentage = 0;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  addPosition(position) {
    const existingPosition = this.positions.find(p => p.assetId === position.assetId);
    
    if (existingPosition) {
      existingPosition.quantity += position.quantity;
      existingPosition.averagePrice = this.calculateAveragePrice(
        existingPosition.quantity - position.quantity,
        existingPosition.averagePrice,
        position.quantity,
        position.price
      );
      existingPosition.updatedAt = new Date();
    } else {
      this.positions.push({
        id: uuidv4(),
        assetId: position.assetId,
        assetType: position.assetType,
        quantity: position.quantity,
        averagePrice: position.price,
        currentPrice: position.price,
        marketValue: position.quantity * position.price,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    this.recalculatePortfolioValue();
    this.updatedAt = new Date();
  }

  removePosition(assetId, quantity) {
    const position = this.positions.find(p => p.assetId === assetId);
    
    if (!position) {
      throw new Error('Posicao nao encontrada na carteira');
    }
    
    if (position.quantity < quantity) {
      throw new Error('Quantidade insuficiente para remover');
    }
    
    if (position.quantity === quantity) {
      this.positions = this.positions.filter(p => p.assetId !== assetId);
    } else {
      position.quantity -= quantity;
      position.updatedAt = new Date();
    }
    
    this.recalculatePortfolioValue();
    this.updatedAt = new Date();
  }

  calculateAveragePrice(oldQuantity, oldPrice, newQuantity, newPrice) {
    const totalOldValue = oldQuantity * oldPrice;
    const totalNewValue = newQuantity * newPrice;
    const totalQuantity = oldQuantity + newQuantity;
    
    return (totalOldValue + totalNewValue) / totalQuantity;
  }

  recalculatePortfolioValue() {
    this.totalValue = this.positions.reduce((sum, position) => {
      return sum + (position.quantity * position.currentPrice);
    }, 0);
    
    this.totalInvested = this.positions.reduce((sum, position) => {
      return sum + (position.quantity * position.averagePrice);
    }, 0);
    
    this.totalReturn = this.totalValue - this.totalInvested;
    this.returnPercentage = this.totalInvested > 0 ? 
      (this.totalReturn / this.totalInvested) * 100 : 0;
  }

  getPositionByAsset(assetId) {
    return this.positions.find(p => p.assetId === assetId);
  }

  getDiversification() {
    const assetTypes = {};
    
    this.positions.forEach(position => {
      const percentage = (position.marketValue / this.totalValue) * 100;
      
      if (!assetTypes[position.assetType]) {
        assetTypes[position.assetType] = 0;
      }
      
      assetTypes[position.assetType] += percentage;
    });
    
    return assetTypes;
  }
}

module.exports = Portfolio; 