module.exports = {
  // Ambiente de teste
  testEnvironment: 'node',
  
  // Padrão para encontrar arquivos de teste
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // Diretórios para ignorar
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],
  
  // Configuração de cobertura
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/main.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js'
  ],
  
  // Diretório para relatórios de cobertura
  coverageDirectory: 'coverage',
  
  // Formato dos relatórios
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  
  // Limite mínimo de cobertura
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Setup para testes
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Verbose para mostrar todos os testes
  verbose: true,
  
  // Timeout para testes
  testTimeout: 10000
}; 