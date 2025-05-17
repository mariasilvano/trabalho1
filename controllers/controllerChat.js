module.exports = {
  async get(req, res) {
    if (!req.session.userId) {
      return res.redirect('/login');
    }

    res.render('chat', {
      layout: 'chatLayout.handlebars',
      user: req.session.login
    });
  },
  async mandarMensagem(req, res) {
    // lógica para enviar mensagem
  },

  async listarMensagensPorDestinatario(req, res) {
    // lógica para listar mensagens
  }
};
