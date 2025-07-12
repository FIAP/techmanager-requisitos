# ADR-002: Estratégia de Banco de Dados para Bounded Contexts

## Status
Proposto

## Data
2025-01-12

## Contexto

### Situação Atual
A plataforma de investimentos atualmente utiliza **armazenamento em memória** (Arrays e Maps JavaScript) para persistência de dados. Esta abordagem foi adequada para prototipagem e desenvolvimento inicial, mas apresenta limitações críticas para um ambiente de produção:

#### Problemas Identificados:
- **Perda de dados** ao reiniciar a aplicação
- **Falta de durabilidade** para transações financeiras
- **Ausência de auditoria** necessária para compliance
- **Impossibilidade de backup** e recuperação de dados
- **Limitação de concorrência** entre usuários
- **Falta de integridade transacional** (ACID)

### Requisitos do Negócio
Como uma plataforma de investimentos, temos requisitos específicos:

1. **Compliance Regulatório**
   - Trilha de auditoria completa (CVM, BACEN)
   - Retenção de dados por anos
   - Relatórios regulatórios automáticos

2. **Integridade Financeira**
   - Transações ACID obrigatórias
   - Precisão de valores monetários
   - Consistência entre contextos

3. **Performance e Escalabilidade**
   - Consultas rápidas de portfolio
   - Cálculos de performance em tempo real
   - Suporte a milhares de usuários

4. **Bounded Contexts**
   - 6 contextos distintos: Auth, Portfolio, Transactions, Suitability, Product Catalog, Backoffice
   - Cada contexto pode ter necessidades diferentes de persistência

## Opções Consideradas

### Opção 1: Banco Único Relacional (PostgreSQL)
**Abordagem:** Um único banco PostgreSQL compartilhado entre todos os contextos

**Vantagens:**
- ✅ Transações ACID entre contextos
- ✅ Consistência forte
- ✅ Suporte JSON nativo para flexibilidade
- ✅ Maturidade e confiabilidade
- ✅ Excelente para dados financeiros

**Desvantagens:**
- ❌ Acoplamento entre contextos
- ❌ Dificuldade de escalar contextos independentemente
- ❌ Single point of failure
- ❌ Viola princípios de bounded contexts

### Opção 2: Database per Service (PostgreSQL por Contexto)
**Abordagem:** Cada bounded context tem sua própria instância PostgreSQL

**Vantagens:**
- ✅ Isolamento completo entre contextos
- ✅ Escalabilidade independente
- ✅ Autonomia dos times
- ✅ Fault isolation
- ✅ Tecnologia adequada para dados financeiros

**Desvantagens:**
- ❌ Complexidade operacional
- ❌ Eventual consistency entre contextos
- ❌ Overhead de infraestrutura
- ❌ Joins complexos entre contextos

### Opção 3: Abordagem Híbrida (PostgreSQL + MongoDB)
**Abordagem:** PostgreSQL para contextos críticos, MongoDB para outros

**Vantagens:**
- ✅ Otimização por tipo de dado
- ✅ Flexibilidade de esquema onde necessário
- ✅ Performance adequada para cada caso

**Desvantagens:**
- ❌ Complexidade de múltiplas tecnologias
- ❌ Expertise necessária em duas tecnologias
- ❌ Overhead operacional

### Opção 4: Monolith Database com Schemas Separados
**Abordagem:** PostgreSQL único com schemas dedicados por contexto

**Vantagens:**
- ✅ Isolamento lógico entre contextos
- ✅ Operação simplificada
- ✅ Transações cross-context quando necessário
- ✅ Menor overhead de infraestrutura

**Desvantagens:**
- ❌ Acoplamento operacional
- ❌ Escalabilidade limitada
- ❌ Potencial para vazamento entre contextos

## Decisão

**Escolhemos a Opção 2: Database per Service com PostgreSQL**

### Justificativa:

1. **Alinhamento com DDD:** Cada bounded context mantém sua autonomia de dados
2. **Adequação Financeira:** PostgreSQL oferece precisão numérica e ACID necessários
3. **Escalabilidade:** Cada contexto pode escalar independentemente
4. **Isolamento de Falhas:** Problemas em um contexto não afetam outros
5. **Autonomia de Times:** Cada squad pode evoluir seu schema independentemente

### Mapeamento por Contexto:

```
Auth Context          → PostgreSQL (user_auth_db)
Portfolio Context     → PostgreSQL (portfolio_db) 
Transactions Context  → PostgreSQL (transactions_db)
Suitability Context   → PostgreSQL (suitability_db)
Product Catalog Context → PostgreSQL (catalog_db)
Backoffice Context    → PostgreSQL (backoffice_db)
```

## Consequências

### Positivas ✅

1. **Isolamento de Dados**
   - Cada contexto possui seus próprios dados
   - Schemas podem evoluir independentemente
   - Falhas isoladas não propagam

2. **Compliance e Auditoria**
   - PostgreSQL oferece logging detalhado
   - Suporte nativo para triggers de auditoria
   - Backup e recovery por contexto

3. **Performance**
   - Otimização específica por contexto
   - Indexes adequados para cada caso de uso
   - Scaling horizontal por contexto

4. **Precisão Financeira**
   - NUMERIC type para valores monetários
   - Transações ACID garantidas
   - Constraints de integridade

### Negativas ⚠️

1. **Complexidade Operacional**
   - 6 instâncias de PostgreSQL para gerenciar
   - Monitoring e backup distribuído
   - Configuração de alta disponibilidade

2. **Eventual Consistency**
   - Dados entre contextos podem ficar temporariamente inconsistentes
   - Necessidade de compensação (Saga pattern)
   - Complexidade de debugging distribuído

3. **Overhead de Infraestrutura**
   - Mais recursos computacionais necessários
   - Configuração de rede entre bancos
   - Licenciamento e custos

## Estratégia de Implementação

### Fase 1: Migração Gradual (1-2 meses)
```
Memória → PostgreSQL por contexto
Prioridade: Auth > Transactions > Portfolio > Outros
```

### Fase 2: Otimização (1 mês)
```
- Implementar connection pooling
- Configurar replicação read-only
- Otimizar queries e indexes
```

### Fase 3: Produção (1 mês)
```
- Backup automático
- Monitoring e alertas
- Alta disponibilidade
```

## Detalhes de Implementação

### Schema de Conexão
```javascript
// Database configuration per context
const dbConfig = {
  auth: {
    host: process.env.AUTH_DB_HOST,
    database: 'user_auth_db',
    user: process.env.AUTH_DB_USER,
    password: process.env.AUTH_DB_PASSWORD
  },
  portfolio: {
    host: process.env.PORTFOLIO_DB_HOST,
    database: 'portfolio_db',
    user: process.env.PORTFOLIO_DB_USER,
    password: process.env.PORTFOLIO_DB_PASSWORD
  }
  // ... outros contextos
};
```

### Estratégia de Backup
```bash
# Backup automático por contexto
0 2 * * * pg_dump user_auth_db > backup/auth_$(date +%Y%m%d).sql
0 2 * * * pg_dump portfolio_db > backup/portfolio_$(date +%Y%m%d).sql
# ... outros contextos
```

### Monitoramento
```yaml
# Prometheus metrics per database
- postgres_connections_active{database="user_auth_db"}
- postgres_query_duration{database="portfolio_db"}
- postgres_transaction_conflicts{database="transactions_db"}
```

## Alternativas Rejeitadas

### MongoDB
- Rejeitado devido à falta de transações ACID robustas para dados financeiros
- Consistência eventual não adequada para valores monetários

### Shared Database
- Rejeitado por violar princípios de bounded contexts
- Criaria acoplamento indesejado entre contextos

### NoSQL Distribuído (Cassandra/DynamoDB)
- Rejeitado devido à complexidade operacional
- Eventual consistency inadequada para dados financeiros

## Métricas de Sucesso

### Performance
- Tempo de resposta < 200ms para 95% das queries
- Throughput > 1000 transações/segundo por contexto
- Disponibilidade > 99.9%

### Operacional
- Backup successful rate > 99%
- Recovery time < 15 minutos
- Zero data loss em failover

### Desenvolvimento
- Deploy independente de contextos
- Time to market reduzido para novas features
- Zero breaking changes entre contextos

## Riscos e Mitigações

### Risco: Complexidade Operacional
**Mitigação:** 
- Usar Docker Compose para desenvolvimento
- Kubernetes operators para produção
- Automação completa de deploy

### Risco: Eventual Consistency
**Mitigação:**
- Implementar Saga pattern para transações distribuídas
- Event sourcing para auditoria
- Compensação automática de transações

### Risco: Performance
**Mitigação:**
- Connection pooling (PgBouncer)
- Read replicas para queries
- Caching com Redis quando apropriado

## Revisão e Aprovação

**Autor:** Equipe de Arquitetura  
**Revisor:** Tech Lead + Product Owner  
**Aprovação:** CTO  

**Next Review Date:** 2025-04-12

---

## Anexos

### Docker Compose para Desenvolvimento
```yaml
services:
  auth-db:
    image: postgres:15
    environment:
      POSTGRES_DB: user_auth_db
      POSTGRES_USER: auth_user
      POSTGRES_PASSWORD: auth_pass
    volumes:
      - auth_data:/var/lib/postgresql/data
      
  portfolio-db:
    image: postgres:15
    environment:
      POSTGRES_DB: portfolio_db
      POSTGRES_USER: portfolio_user
      POSTGRES_PASSWORD: portfolio_pass
    volumes:
      - portfolio_data:/var/lib/postgresql/data
      
  # ... outros contextos

volumes:
  auth_data:
  portfolio_data:
  # ... outros volumes
```

### Exemplo de Migration Script
```sql
-- Portfolio Context Migration
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    total_value NUMERIC(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES portfolios(id),
    asset_symbol VARCHAR(10) NOT NULL,
    quantity NUMERIC(15,8) NOT NULL,
    average_price NUMERIC(15,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_positions_portfolio_id ON positions(portfolio_id);
``` 