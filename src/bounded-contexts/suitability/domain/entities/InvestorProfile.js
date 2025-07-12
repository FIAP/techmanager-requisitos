const { v4: uuidv4 } = require('uuid');

class InvestorProfile {
  constructor(userId) {
    this.id = uuidv4();
    this.userId = userId;
    this.riskProfile = 'CONSERVATIVE'; // CONSERVATIVE, MODERATE, AGGRESSIVE
    this.questionnaire = {
      age: null,
      income: null,
      investmentExperience: null,
      investmentGoal: null,
      timeHorizon: null,
      riskTolerance: null
    };
    this.score = 0;
    this.allowedAssetTypes = ['FIXED_INCOME'];
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.validUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 ano
  }

  updateQuestionnaire(answers) {
    this.questionnaire = { ...this.questionnaire, ...answers };
    this.calculateRiskProfile();
    this.updatedAt = new Date();
  }

  calculateRiskProfile() {
    let score = 0;
    
    // Pontuação baseada na idade
    if (this.questionnaire.age < 30) score += 3;
    else if (this.questionnaire.age < 50) score += 2;
    else score += 1;
    
    // Pontuação baseada na renda
    if (this.questionnaire.income > 10000) score += 3;
    else if (this.questionnaire.income > 5000) score += 2;
    else score += 1;
    
    // Pontuação baseada na experiência
    if (this.questionnaire.investmentExperience === 'HIGH') score += 3;
    else if (this.questionnaire.investmentExperience === 'MEDIUM') score += 2;
    else score += 1;
    
    // Pontuação baseada no horizonte de tempo
    if (this.questionnaire.timeHorizon === 'LONG') score += 3;
    else if (this.questionnaire.timeHorizon === 'MEDIUM') score += 2;
    else score += 1;
    
    // Pontuação baseada na tolerância ao risco
    if (this.questionnaire.riskTolerance === 'HIGH') score += 3;
    else if (this.questionnaire.riskTolerance === 'MEDIUM') score += 2;
    else score += 1;
    
    this.score = score;
    
    // Definir perfil de risco
    if (score >= 12) {
      this.riskProfile = 'AGGRESSIVE';
      this.allowedAssetTypes = ['FIXED_INCOME', 'STOCKS', 'DERIVATIVES', 'CRYPTO'];
    } else if (score >= 8) {
      this.riskProfile = 'MODERATE';
      this.allowedAssetTypes = ['FIXED_INCOME', 'STOCKS', 'FUNDS'];
    } else {
      this.riskProfile = 'CONSERVATIVE';
      this.allowedAssetTypes = ['FIXED_INCOME', 'FUNDS'];
    }
  }

  canInvestIn(assetType) {
    return this.allowedAssetTypes.includes(assetType);
  }

  isValid() {
    return new Date() < this.validUntil;
  }

  needsUpdate() {
    const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
    return this.updatedAt < sixMonthsAgo;
  }
}

module.exports = InvestorProfile; 