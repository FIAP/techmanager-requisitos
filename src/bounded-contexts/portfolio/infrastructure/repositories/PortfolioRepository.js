class PortfolioRepository {
  constructor() {
    this.portfolios = new Map();
  }

  async save(portfolio) {
    this.portfolios.set(portfolio.id, portfolio);
    return portfolio;
  }

  async findById(id) {
    return this.portfolios.get(id) || null;
  }

  async findByUserId(userId) {
    for (const portfolio of this.portfolios.values()) {
      if (portfolio.userId === userId) {
        return portfolio;
      }
    }
    return null;
  }

  async findAll() {
    return Array.from(this.portfolios.values());
  }

  async delete(id) {
    return this.portfolios.delete(id);
  }

  async update(id, updatedPortfolio) {
    if (this.portfolios.has(id)) {
      this.portfolios.set(id, updatedPortfolio);
      return updatedPortfolio;
    }
    return null;
  }
}

module.exports = PortfolioRepository; 