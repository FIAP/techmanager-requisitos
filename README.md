# Plataforma de Investimentos

Este projeto implementa uma plataforma de investimentos 

A aplicação está organizada em 6 contextos:

### 1. Portfolio (Gestão de Carteira)
- **Responsabilidade**: Manter composição dos investimentos, histórico de movimentações e rentabilidade
- **Entidades**: Portfolio, Position
- **Endpoints**: 
  - `GET /api/portfolio/user/:userId` - Obter carteira do usuário
  - `POST /api/portfolio/user/:userId/positions` - Adicionar posição
  - `GET /api/portfolio/user/:userId/performance` - Obter performance

### 2. Transactions (Orquestração de Transações)
- **Responsabilidade**: Controlar ordens de compra/venda e validação de operações
- **Entidades**: Transaction
- **Endpoints**:
  - `POST /api/transactions` - Criar transação
  - `GET /api/transactions/user/:userId` - Listar transações do usuário
  - `PUT /api/transactions/:id/execute` - Executar transação

### 3. Suitability (Análise de Perfil de Investidor)
- **Responsabilidade**: Gerenciar perfil de risco baseado em questionários regulatórios
- **Entidades**: InvestorProfile
- **Endpoints**:
  - `GET /api/suitability/profile/:userId` - Obter perfil do investidor
  - `PUT /api/suitability/profile/:userId/questionnaire` - Atualizar questionário
  - `GET /api/suitability/profile/:userId/validate/:assetType` - Validar investimento

### 4. Product Catalog (Catálogo de Produtos)
- **Responsabilidade**: Centralizar oferta de ativos e regras de aplicação
- **Endpoints**:
  - `GET /api/products` - Listar produtos disponíveis
  - `GET /api/products/:id` - Obter produto específico
  - `GET /api/products/type/:type` - Filtrar por tipo de ativo

### 5. Backoffice (Compliance e Administração)
- **Responsabilidade**: Rotinas administrativas, relatórios e auditoria
- **Endpoints**:
  - `POST /api/backoffice/reports/compliance` - Gerar relatório de compliance
  - `GET /api/backoffice/reports` - Listar relatórios
  - `POST /api/backoffice/audit` - Registrar evento de auditoria

### 6. Auth (Gestão de Usuários e Segurança)
- **Responsabilidade**: Autenticação, autorização e gerenciamento de usuários
- **Endpoints**:
  - `POST /api/auth/register` - Registrar usuário
  - `POST /api/auth/login` - Fazer login
  - `GET /api/auth/profile` - Obter perfil do usuário logado

## Estrutura do Projeto

```
src/
├── bounded-contexts/           # Contextos limitados
│   ├── portfolio/             # Gestão de Carteira
│   │   ├── domain/
│   │   │   └── entities/
│   │   ├── application/
│   │   │   └── services/
│   │   └── infrastructure/
│   │       ├── controllers/
│   │       ├── repositories/
│   │       └── routes/
│   ├── transactions/          # Orquestração de Transações
│   ├── suitability/          # Análise de Perfil
│   ├── product-catalog/      # Catálogo de Produtos
│   ├── backoffice/           # Backoffice e Compliance
│   └── auth/                 # Gestão de Usuários
├── shared/                   # Componentes compartilhados
│   └── infrastructure/
│       └── logger.js
└── main.js                   # Ponto de entrada da aplicação
```

## Instalação e Execução

### Pré-requisitos
- Node.js 16+
- npm ou yarn

### Passos para execução

1. **Instalar dependências**:
```bash
npm install
```

2. **Configurar variáveis de ambiente**:
```bash
# Criar arquivo .env baseado no .env.example
cp .env.example .env
# Editar as variáveis conforme necessário
```

3. **Executar em modo desenvolvimento**:
```bash
npm run dev
```

4. **Executar em modo produção**:
```bash
npm start
```

5. **Executar testes**:
```bash
npm test
```

## Endpoints Principais

### Health Check
```bash
GET /health
```

### Exemplo de Uso - Fluxo Completo

1. **Registrar usuário**:
```bash
POST /api/auth/register
{
  "email": "usuario@teste.com",
  "password": "senha123",
  "name": "João Silva",
  "document": "12345678901"
}
```

2. **Fazer login**:
```bash
POST /api/auth/login
{
  "email": "usuario@teste.com",
  "password": "senha123"
}
```

3. **Obter perfil de suitability**:
```bash
GET /api/suitability/profile/USER_ID
```

4. **Atualizar questionário**:
```bash
PUT /api/suitability/profile/USER_ID/questionnaire
{
  "age": 30,
  "income": 8000,
  "investmentExperience": "MEDIUM",
  "timeHorizon": "LONG",
  "riskTolerance": "MEDIUM"
}
```

5. **Listar produtos disponíveis**:
```bash
GET /api/products
```

6. **Criar transação**:
```bash
POST /api/transactions
{
  "userId": "USER_ID",
  "assetId": "ASSET_ID",
  "type": "BUY",
  "quantity": 100,
  "price": 32.50
}
```

## Características Arquiteturais

### Separação de Responsabilidades
- Cada contexto tem sua própria responsabilidade bem definida
- Comunicação entre contextos através de interfaces bem definidas
- Isolamento de dados e regras de negócio

### Escalabilidade
- Estrutura modular permite escalar contextos independentemente
- Fácil adição de novos contextos conforme crescimento do negócio
- Preparado para evolução para microsserviços

### Conformidade e Auditoria
- Sistema de logs centralizado
- Rastreamento de todas as operações
- Relatórios de compliance automatizados

## Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **JWT** - Autenticação
- **bcrypt** - Criptografia de senhas
- **Winston** - Sistema de logs
- **Joi** - Validação de dados
- **Jest** - Testes
- **ESLint** - Linting de código

## Próximos Passos

1. **Integração com Banco de Dados**:
   - Implementar repositórios com MongoDB/PostgreSQL
   - Migrações e schemas

2. **Comunicação entre Contextos**:
   - Implementar eventos de domínio
   - Message queues para operações assíncronas

3. **Segurança Avançada**:
   - Rate limiting
   - Validação de entrada mais robusta
   - Auditoria detalhada

4. **Monitoramento**:
   - Métricas de performance
   - Alertas de sistema
   - Dashboard de saúde

5. **Testes**:
   - Testes unitários para cada contexto
   - Testes de integração
   - Testes end-to-end

## Contribuição

Este projeto segue os princípios do Domain-Driven Design. Ao contribuir:

1. Mantenha a separação clara entre contextos
2. Implemente testes para novas funcionalidades
3. Siga os padrões de código estabelecidos
4. Documente mudanças significativas

## Licença

Este projeto é licenciado sob a licença ISC. 