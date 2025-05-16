const express = require('express');
const path = require('path');
const handlebars = require('express-handlebars');
const db = require('./models');  
const speakeasy = require('speakeasy');
const session = require('express-session');

const routes = require('./routers/route');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CONFIGURAÇÃO DO SESSION
app.use(session({
  secret: 'SegredoSecreto',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 10 * 60 * 1000 } // 10 minutos
}));

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

app.use('/', routes);

/*db.sequelize.sync({ force: true }).then(async () => {
  console.log('Banco sincronizado com force: true');

  const secretAlice = speakeasy.generateSecret({ length: 20, name: 'SeuApp (Alice)' });
  const secretBob = speakeasy.generateSecret({ length: 20, name: 'SeuApp (Bob)' });

  await db.Usuario.create({ login: 'Alice', senha: '123', twoFactorSecret: secretAlice.base32 });
  await db.Usuario.create({ login: 'Bob', senha: '1234', twoFactorSecret: secretBob.base32 });

  console.log('Usuários criados com 2FA');
  console.log('Alice QR URL:', secretAlice.otpauth_url);
  console.log('Bob QR URL:', secretBob.otpauth_url);
}).catch(err => {
  console.error('Erro ao sincronizar o banco:', err);
});*/

app.listen(8082, () => {
  console.log('Servidor rodando em http://localhost:8082');
});
