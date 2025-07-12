const express = require('express');
const InvestorProfile = require('../../domain/entities/InvestorProfile');
const logger = require('../../../../shared/infrastructure/logger');

const router = express.Router();
const profiles = new Map();

// Obter perfil do investidor
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    let profile = profiles.get(userId);
    
    if (!profile) {
      profile = new InvestorProfile(userId);
      profiles.set(userId, profile);
    }
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    logger.error(`Erro ao obter perfil: ${error.message}`);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar questionário de perfil
router.put('/profile/:userId/questionnaire', async (req, res) => {
  try {
    const { userId } = req.params;
    const answers = req.body;
    
    let profile = profiles.get(userId);
    if (!profile) {
      profile = new InvestorProfile(userId);
      profiles.set(userId, profile);
    }
    
    profile.updateQuestionnaire(answers);
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    logger.error(`Erro ao atualizar perfil: ${error.message}`);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Validar se pode investir em um tipo de ativo
router.get('/profile/:userId/validate/:assetType', async (req, res) => {
  try {
    const { userId, assetType } = req.params;
    const profile = profiles.get(userId);
    
    if (!profile) {
      return res.status(404).json({ error: 'Perfil nao encontrado' });
    }
    
    const canInvest = profile.canInvestIn(assetType);
    
    res.json({
      success: true,
      data: {
        canInvest,
        riskProfile: profile.riskProfile,
        allowedAssetTypes: profile.allowedAssetTypes
      }
    });
  } catch (error) {
    logger.error(`Erro ao validar investimento: ${error.message}`);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 