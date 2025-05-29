const express = require('express');
const route = express.Router();
const controllerLogin = require('../controllers/controllerLogin');
const controllerChat = require('../controllers/controllerChat');
const controllerRegister = require('../controllers/controllerRegister');

// Rota inicial
route.get('/', (req, res) => res.redirect('/register'));

// Login e Two-Factor Authentication
route.get('/login', controllerLogin.getLogin);
route.post('/login', controllerLogin.postLogin);
route.get('/twofactor', controllerLogin.getTwoFactor);
route.post('/twofactor', controllerLogin.postTwoFactor);

// Página do chat principal (protegido por sessão)
route.get('/chat', controllerChat.getChat);

// API - Salvar nova mensagem
route.post('/salvarMensagem', controllerChat.salvarMensagem);
route.get('/destinatarios', controllerChat.listarDestinatarios);

// API - Listar mensagens (do usuário logado)
route.get('/listarMensagens', controllerChat.listarMensagens);

// Tela de Cadastro para criar hash senha usuário
route.get('/register', controllerRegister.getRegister);
route.post('/register', controllerRegister.registerUser);

module.exports = route;
