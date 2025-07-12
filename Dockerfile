# Usar imagem oficial do Node.js LTS
FROM node:18-alpine

# Definir variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000

# Criar diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências de produção
RUN npm ci --only=production && npm cache clean --force

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Criar diretório de logs
RUN mkdir -p /app/logs && chown -R nodejs:nodejs /app/logs

# Copiar código da aplicação
COPY --chown=nodejs:nodejs src ./src

# Mudar para usuário não-root
USER nodejs

# Expor porta
EXPOSE 3000

# Comando para verificar se a aplicação está funcionando
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); \
    const options = { host: 'localhost', port: 3000, path: '/health', timeout: 2000 }; \
    const req = http.request(options, (res) => { \
      process.exit(res.statusCode === 200 ? 0 : 1); \
    }); \
    req.on('error', () => process.exit(1)); \
    req.end();"

# Comando para iniciar a aplicação
CMD ["node", "src/main.js"] 