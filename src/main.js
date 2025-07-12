const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Importar rotas dos contextos
const portfolioRoutes = require('./bounded-contexts/portfolio/infrastructure/routes');
const transactionRoutes = require('./bounded-contexts/transactions/infrastructure/routes');
const suitabilityRoutes = require('./bounded-contexts/suitability/infrastructure/routes');
const productCatalogRoutes = require('./bounded-contexts/product-catalog/infrastructure/routes');
const backofficeRoutes = require('./bounded-contexts/backoffice/infrastructure/routes');
const authRoutes = require('./bounded-contexts/auth/infrastructure/routes');

// Middleware de logging
const logger = require('./shared/infrastructure/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globais
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de log
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Rotas dos contextos limitados
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/suitability', suitabilityRoutes);
app.use('/api/products', productCatalogRoutes);
app.use('/api/backoffice', backofficeRoutes);
app.use('/api/auth', authRoutes);

// Rota de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    contexts: [
      'portfolio',
      'transactions',
      'suitability',
      'product-catalog',
      'backoffice',
      'auth'
    ]
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
});

// Middleware 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota nao encontrada',
    message: `A rota ${req.method} ${req.path} nao existe`
  });
});

app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT}`);
  logger.info('Contextos limitados inicializados:');
  logger.info('- Portfolio (Gestao de Carteira)');
  logger.info('- Transactions (Orquestracao de Transacoes)');
  logger.info('- Suitability (Analise de Perfil de Investidor)');
  logger.info('- Product Catalog (Catalogo de Produtos Financeiros)');
  logger.info('- Backoffice (Backoffice e Compliance)');
  logger.info('- Auth (Gestao de Usuarios e Seguranca)');
});

module.exports = app; 