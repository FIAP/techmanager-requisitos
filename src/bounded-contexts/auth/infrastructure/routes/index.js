const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const logger = require('../../../../shared/infrastructure/logger');

const router = express.Router();

// Mock data para demonstração
const users = [];
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

// Registrar usuário
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, document } = req.body;
    
    if (!email || !password || !name || !document) {
      return res.status(400).json({
        error: 'Todos os campos sao obrigatorios'
      });
    }
    
    // Verificar se usuário já existe
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({
        error: 'Usuario ja existe'
      });
    }
    
    // Criptografar senha
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      name,
      document,
      role: 'INVESTOR',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    users.push(user);
    
    logger.info(`Usuario registrado: ${email}`);
    
    // Retornar sem a senha
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(201).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    logger.error(`Erro ao registrar usuario: ${error.message}`);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email e senha sao obrigatorios'
      });
    }
    
    // Encontrar usuário
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        error: 'Credenciais invalidas'
      });
    }
    
    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Credenciais invalidas'
      });
    }
    
    // Gerar token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    logger.info(`Usuario logado: ${email}`);
    
    // Retornar dados do usuário sem a senha
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    logger.error(`Erro ao fazer login: ${error.message}`);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Verificar token (middleware de autenticação)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalido' });
    }
    req.user = user;
    next();
  });
};

// Obter perfil do usuário logado
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario nao encontrado' });
    }
    
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    logger.error(`Erro ao obter perfil: ${error.message}`);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar perfil
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, document } = req.body;
    
    const userIndex = users.findIndex(u => u.id === req.user.userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Usuario nao encontrado' });
    }
    
    if (name) users[userIndex].name = name;
    if (document) users[userIndex].document = document;
    users[userIndex].updatedAt = new Date();
    
    const { password: _, ...userWithoutPassword } = users[userIndex];
    
    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    logger.error(`Erro ao atualizar perfil: ${error.message}`);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Logout (simulado - em produção seria necessário invalidar o token)
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    logger.info(`Usuario deslogado: ${req.user.email}`);
    
    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
  } catch (error) {
    logger.error(`Erro ao fazer logout: ${error.message}`);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 