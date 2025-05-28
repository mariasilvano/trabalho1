const express = require('express');
const path = require('path');
const handlebars = require('express-handlebars');
const db = require('./models');
const session = require('express-session');
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
app.set('views', path.join(__dirname, 'views'));

// ROTAS
app.use('/', routes);

// SYNC DO BANCO E GERAÇÃO DE USUÁRIOS COM 2FA
// Uso do force igual a true para resetar o banco a cada execução, então, se necessário, basta alterar para "false"

db.sequelize.sync({ force: true }).then(async () => {
  console.log('Banco sincronizado com force: true');

  app.listen(8082, () => {
    console.log('Servidor rodando em http://localhost:8082');
  });
}).catch(err => {
  console.error('Erro ao inicializar aplicação:', err);
});
