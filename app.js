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

// CONFIGURAÇÃO DO SESSION
app.use(session({
  secret: 'SegredoSecreto',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 10 * 60 * 1000 } // 10 minutos
}));

// CONFIGURAÇÃO DO HANDLEBARS
app.engine('handlebars', handlebars.engine({
  defaultLayout: 'main',
  helpers: {
    if: function (conditional, options) {
      if (conditional) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
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

/* SYNC E GERAÇÃO DE USUÁRIOS COM 2FA E QR CODES 
db.sequelize.sync({ force: true }).then(async () => {
  console.log('Banco sincronizado com force: true');

  const secretAlice = speakeasy.generateSecret({ length: 20, name: 'SeuApp (Alice)' });
  const secretBob = speakeasy.generateSecret({ length: 20, name: 'SeuApp (Bob)' });

  await db.Usuario.create({ login: 'Alice', senha: '123', twoFactorSecret: secretAlice.base32 });
  await db.Usuario.create({ login: 'Bob', senha: '1234', twoFactorSecret: secretBob.base32 });

   //Exibe os QR Codes no console (apenas uma vez cada)
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
}).catch(err => {
  console.error('Erro ao sincronizar o banco:', err);
});*/

// INICIALIZA O SERVIDOR
app.listen(8082, () => {
  console.log('Servidor rodando em http://localhost:8082');
});
