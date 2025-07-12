#!/bin/bash

# Script de setup para a Plataforma de Investimentos DDD
# Executa a configuração inicial do projeto

echo "=== Configuração da Plataforma de Investimentos ==="
echo ""

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo " Node.js não está instalado. Por favor, instale o Node.js 16+ antes de continuar."
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node --version)
echo " Node.js detectado: $NODE_VERSION"

# Verificar se o npm está instalado
if ! command -v npm &> /dev/null; then
    echo " npm não está instalado. Por favor, instale o npm antes de continuar."
    exit 1
fi

NPM_VERSION=$(npm --version)
echo " npm detectado: $NPM_VERSION"

echo ""
echo " Instalando dependências..."
npm install

if [ $? -ne 0 ]; then
    echo " Erro ao instalar dependências. Verifique os logs acima."
    exit 1
fi

echo " Dependências instaladas com sucesso!"
echo ""

# Criar diretório de logs se não existir
if [ ! -d "logs" ]; then
    mkdir logs
    echo " Diretório de logs criado"
fi

# Criar arquivo .env se não existir
if [ ! -f ".env" ]; then
    echo "🔧 Criando arquivo .env..."
    cat > .env << EOL
# Configurações do servidor
PORT=3000
NODE_ENV=development

# Configurações de autenticação
JWT_SECRET=seu-jwt-secret-muito-seguro-aqui-$(openssl rand -hex 32)

# Configurações de logging
LOG_LEVEL=info

# Configurações de banco de dados (futuro)
DATABASE_URL=mongodb://localhost:27017/investimentos

# Configurações de APIs externas (futuro)
MARKET_DATA_API_KEY=sua-api-key-aqui
COMPLIANCE_API_URL=https://api.compliance.com

# Configurações de notificações (futuro)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app
EOL
    echo " Arquivo .env criado com configurações padrão"
    echo "  Lembre-se de atualizar as configurações no arquivo .env conforme necessário"
else
    echo "ℹ  Arquivo .env já existe, mantendo configurações existentes"
fi

echo ""
echo "🧪 Executando testes..."
npm test

if [ $? -ne 0 ]; then
    echo "  Alguns testes falharam. Verifique os logs acima."
else
    echo " Todos os testes passaram!"
fi

echo ""
echo "=== Configuração concluída! ==="
echo ""
echo "🚀 Para iniciar a aplicação em modo desenvolvimento:"
echo "   npm run dev"
echo ""
echo "🚀 Para iniciar a aplicação em modo produção:"
echo "   npm start"
echo ""
echo "🔍 Para executar testes:"
echo "   npm test"
echo ""
echo "🐳 Para executar com Docker:"
echo "   docker-compose up"
echo ""
echo "📚 Para mais informações, consulte o README.md"
echo ""
echo "✨ Contextos limitados disponíveis:"
echo "   - Portfolio (Gestão de Carteira)"
echo "   - Transactions (Orquestração de Transações)"
echo "   - Suitability (Análise de Perfil de Investidor)"
echo "   - Product Catalog (Catálogo de Produtos Financeiros)"
echo "   - Backoffice (Backoffice e Compliance)"
echo "   - Auth (Gestão de Usuários e Segurança)"
echo ""
echo "🌐 Acesse http://localhost:3000/health para verificar se a aplicação está funcionando" 