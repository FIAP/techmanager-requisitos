const express = require('express');
const { v4: uuidv4 } = require('uuid');
const logger = require('../../../../shared/infrastructure/logger');

const router = express.Router();

// Produtos mock para demonstração - agora com array dinâmico
const products = [
  {
    id: uuidv4(),
    name: 'Tesouro Direto - Selic 2029',
    type: 'FIXED_INCOME',
    description: 'Titulo publico indexado a taxa Selic',
    minimumInvestment: 100,
    currentPrice: 98.50,
    yield: 0.035,
    riskRating: 'LOW',
    category: 'GOVERNMENT_BONDS',
    isActive: true,
    createdAt: new Date()
  },
  {
    id: uuidv4(),
    name: 'Acoes PETR4',
    type: 'STOCKS',
    description: 'Acoes ordinarias da Petrobras',
    minimumInvestment: 1,
    currentPrice: 32.45,
    yield: null,
    riskRating: 'HIGH',
    category: 'EQUITIES',
    isActive: true,
    createdAt: new Date()
  },
  {
    id: uuidv4(),
    name: 'Fundo Multimercado XYZ',
    type: 'FUNDS',
    description: 'Fundo de investimento multimercado',
    minimumInvestment: 1000,
    currentPrice: 1.45,
    yield: 0.08,
    riskRating: 'MEDIUM',
    category: 'MULTIMARKET_FUNDS',
    isActive: true,
    createdAt: new Date()
  }
];

// Listar todos os produtos
router.get('/', async (req, res) => {
  try {
    const { type, category, riskRating } = req.query;
    
    let filteredProducts = products.filter(p => p.isActive);
    
    if (type) {
      filteredProducts = filteredProducts.filter(p => p.type === type);
    }
    
    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }
    
    if (riskRating) {
      filteredProducts = filteredProducts.filter(p => p.riskRating === riskRating);
    }
    
    res.json({
      success: true,
      data: filteredProducts
    });
  } catch (error) {
    logger.error(`Erro ao listar produtos: ${error.message}`);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar novo produto
router.post('/', async (req, res) => {
  try {
    const { name, type, description, minimumInvestment, currentPrice, yield: productYield, riskRating, category } = req.body;
    
    // Validações básicas
    if (!name || !type || !description || !minimumInvestment || !currentPrice || !riskRating || !category) {
      return res.status(400).json({
        error: 'Todos os campos obrigatorios devem ser preenchidos'
      });
    }
    
    const newProduct = {
      id: uuidv4(),
      name,
      type,
      description,
      minimumInvestment,
      currentPrice,
      yield: productYield || null,
      riskRating,
      category,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    products.push(newProduct);
    
    logger.info(`Produto criado: ${name} (${type})`);
    
    res.status(201).json({
      success: true,
      data: newProduct
    });
  } catch (error) {
    logger.error(`Erro ao criar produto: ${error.message}`);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter produto por ID
router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Produto nao encontrado' });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    logger.error(`Erro ao obter produto: ${error.message}`);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar produto
router.put('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, type, description, minimumInvestment, currentPrice, yield: productYield, riskRating, category, isActive } = req.body;
    
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Produto nao encontrado' });
    }
    
    // Atualizar campos se fornecidos
    if (name) products[productIndex].name = name;
    if (type) products[productIndex].type = type;
    if (description) products[productIndex].description = description;
    if (minimumInvestment) products[productIndex].minimumInvestment = minimumInvestment;
    if (currentPrice) products[productIndex].currentPrice = currentPrice;
    if (productYield !== undefined) products[productIndex].yield = productYield;
    if (riskRating) products[productIndex].riskRating = riskRating;
    if (category) products[productIndex].category = category;
    if (isActive !== undefined) products[productIndex].isActive = isActive;
    
    products[productIndex].updatedAt = new Date();
    
    logger.info(`Produto atualizado: ${products[productIndex].name}`);
    
    res.json({
      success: true,
      data: products[productIndex]
    });
  } catch (error) {
    logger.error(`Erro ao atualizar produto: ${error.message}`);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar produto (desativar)
router.delete('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Produto nao encontrado' });
    }
    
    products[productIndex].isActive = false;
    products[productIndex].updatedAt = new Date();
    
    logger.info(`Produto desativado: ${products[productIndex].name}`);
    
    res.json({
      success: true,
      message: 'Produto desativado com sucesso'
    });
  } catch (error) {
    logger.error(`Erro ao deletar produto: ${error.message}`);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter produtos por tipo
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const productsByType = products.filter(p => p.type === type && p.isActive);
    
    res.json({
      success: true,
      data: productsByType
    });
  } catch (error) {
    logger.error(`Erro ao obter produtos por tipo: ${error.message}`);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter categorias disponíveis
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = [...new Set(products.map(p => p.category))];
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    logger.error(`Erro ao obter categorias: ${error.message}`);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 