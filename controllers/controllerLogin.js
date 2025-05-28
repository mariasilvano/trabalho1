const db = require('../models'); 
const speakeasy = require('speakeasy');
const bcrypt = require('bcrypt');

module.exports = {
  async getLogin(req, res) {
    res.render('login', { layout: 'noMenu.handlebars' });
  },

  async postLogin(req, res) {
    const { login, senha } = req.body;

    try {
      const usuarios = await db.Usuario.findAll({ where: { login } });
      
      
      if (usuarios.length === 0) {
        return res.redirect('/login');
      }

      const usuario = usuarios[0];

      // Compara a senha digitada com o hash armazenado
      const senhaValida = await bcrypt.compare(senha, usuario.senha); // usuario.senha é o hash

      if (!senhaValida) {
        // Senha incorreta
        return res.redirect('/login');
      }


      // Salva o usuário temporariamente na sessão para depois validar 2FA
      req.session.tempUser = { id: usuario.id, login: usuario.login };

      // Redireciona para a tela de 2FA
      res.redirect('/twofactor');
    } catch (err) {
      console.error(err);
      res.redirect('/');
    }
  },

  async getTwoFactor(req, res) {
    if (!req.session.tempUser) {
      return res.redirect('/');
    }
    res.render('twofactor', { layout: 'noMenu.handlebars', login: req.session.tempUser.login });
  },

  async postTwoFactor(req, res) {
    console.log('ENTROU NO POST /twofactor');
    const { token } = req.body;

    if (!req.session.tempUser) {
      return res.redirect('/');
    }

    try {
      const usuario = await db.Usuario.findByPk(req.session.tempUser.id);

      const tokenValid = speakeasy.totp.verify({
        secret: usuario.twoFactorSecret,
        encoding: 'base32',
        token,
        window: 2,
      });

      if (!tokenValid) {
        return res.render('twofactor', { layout: 'noMenu.handlebars', login: usuario.login, error: 'Token 2FA inválido' });
      }

      // Autenticação 2FA OK, cria sessão definitiva
      req.session.userId = usuario.id;
      req.session.login = usuario.login;
      delete req.session.tempUser;

    res.redirect('/chat');
    } catch (err) {
      console.error(err);
      res.redirect('/');
    }
  }
};
