const express = require('express');
const path = require('path');
const handlebars = require('express-handlebars');
const db = require('./models');
const speakeasy = require('speakeasy');
const session = require('express-session');
const QRCode = require('qrcode');
const routes = require('./routers/route');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// CONFIGURAÇÃO DA SESSION
app.use(session({
  secret: 'SegredoSecreto',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 10 * 60 * 1000 } // 10 minutos
}));

// CONFIGURAÇÃO DO HANDLEBARS
app.engine('handlebars', handlebars.engine({
  helpers: {
    if: function (conditional, options) {
      return conditional ? options.fn(this) : options.inverse(this);
    },
    switch: function (value, options) {
      this._switch_value_ = value;
      const html = options.fn(this);
      delete this._switch_value_;
      return html;
    },
    case: function (value, options) {
      if (value === this._switch_value_) {
        return options.fn(this);
      }
    }
  }
}));
app.set('view engine', 'handlebars');

// ROTAS
app.use('/', routes);

// SYNC DO BANCO E GERAÇÃO DE USUÁRIOS COM 2FA
const { inicializarChaves } = require('./controllers/controllerChat');
const resetarBanco = true; // dessa forma está resetando o banco a cada execução, então, se necessário, basta alterar para "false"

db.sequelize.sync({ force: resetarBanco }).then(async () => {
  console.log('Banco sincronizado com force: true');

  const secretAlice = speakeasy.generateSecret({ length: 20, name: 'SeuApp (Alice)' });
  const secretBob = speakeasy.generateSecret({ length: 20, name: 'SeuApp (Bob)' });

  await db.Usuario.create({ login: 'Alice', senha: '123', twoFactorSecret: secretAlice.base32 });
  await db.Usuario.create({ login: 'Bob', senha: '1234', twoFactorSecret: secretBob.base32 });

  try {
    console.log('QR Code para Alice:');
    const qrAlice = await QRCode.toString(secretAlice.otpauth_url, { type: 'terminal' });
    console.log(qrAlice);
    console.log(`Chave manual Alice: ${secretAlice.base32}\n`);

    console.log('QR Code para Bob:');
    const qrBob = await QRCode.toString(secretBob.otpauth_url, { type: 'terminal' });
    console.log(qrBob);
    console.log(`Chave manual Bob: ${secretBob.base32}\n`);
  } catch (err) {
    console.error('Erro ao gerar QR Codes:', err);
  }

  // Gera as chaves RSA e certificados para todos os usuários
  await inicializarChaves();

  app.listen(8082, () => {
    console.log('Servidor rodando em http://localhost:8082');
  });
}).catch(err => {
  console.error('Erro ao sincronizar o banco:', err);
});
