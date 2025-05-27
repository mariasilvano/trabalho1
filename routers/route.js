const express = require('express');
const route = express.Router();
const controllerLogin = require('../controllers/controllerLogin');
const controllerChat = require('../controllers/controllerChat');

// Rota inicial
route.get('/', (req, res) => res.redirect('/login'));

// Login e Two-Factor Authentication
route.get('/login', controllerLogin.getLogin);
route.post('/login', controllerLogin.postLogin);
route.get('/twofactor', controllerLogin.getTwoFactor);
route.post('/twofactor', controllerLogin.postTwoFactor);

// Página do chat principal (protegido por sessão)
route.get('/chat', controllerChat.getChat);

// API - Salvar nova mensagem
route.post('/salvarMensagem', controllerChat.salvarMensagem);
// API - Listar mensagens (do usuário logado)
route.get('/listarMensagens', controllerChat.listarMensagens);

module.exports = route;
