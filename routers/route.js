const express = require('express');
const route = express.Router();

const controllerLogin = require('../controllers/controllerLogin');
const controllerMensagem = require('../controllers/controllerChat');

// Rotas
route.get("/", controllerLogin.getLogin);
route.post("/login", controllerLogin.postLogin);

route.post('/mandarMensagem', controllerMensagem.mandarMensagem);
route.get('/ListarMensagem/:destinatario', controllerMensagem.listarMensagensPorDestinatario);
route.get('/twofactor', controllerLogin.getTwoFactor);
route.post('/twofactor', controllerLogin.postTwoFactor);

route.get('/chat', controllerMensagem.get);

module.exports = route;
