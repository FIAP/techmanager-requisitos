// Configurações globais para os testes

// Configurar timeout para testes assíncronos
jest.setTimeout(10000);

// Configurar variáveis de ambiente para testes
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.LOG_LEVEL = 'error';

// Mock do console.log para reduzir ruído nos testes
const originalConsoleLog = console.log;
console.log = jest.fn();

// Restaurar console.log após todos os testes
afterAll(() => {
  console.log = originalConsoleLog;
});

// Configurar matchers customizados do Jest
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// Configurar mocks globais para Date se necessário
// const mockDate = new Date('2023-01-01T00:00:00.000Z');
// jest.spyOn(global, 'Date').mockImplementation(() => mockDate); 