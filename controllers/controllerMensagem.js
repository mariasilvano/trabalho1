const { Mensagem } = require('../models');

const mandarMensagem = async (req, res) => {
  try {
    const {
      remetenteId,
      destinatarioId,
      mensagemCriptografada,
      chaveCriptografada,
      vetor,
      assinaturaDigital,
      hashMensagem,
      certificado
    } = req.body;

    const novaMensagem = await Mensagem.create({
      remetenteId,
      destinatarioId,
      mensagemCriptografada,
      chaveCriptografada,
      vetor,
      assinaturaDigital,
      hashMensagem,
      certificado
    });

    res.status(201).json({ mensagem: 'Mensagem salva com sucesso!', dados: novaMensagem });
  } catch (error) {
    console.error('Erro ao salvar mensagem:', error);
    res.status(500).json({ erro: 'Erro interno ao salvar a mensagem.' });
  }
};

const listarMensagensPorDestinatario = async (req, res) => {
  try {
    const { destinatarioId } = req.params;

    const mensagens = await Mensagem.findAll({
      where: { destinatarioId }
    });

    res.status(200).json(mensagens);
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    res.status(500).json({ erro: 'Erro interno ao buscar mensagens.' });
  }
};

module.exports = {
  mandarMensagem,
  listarMensagensPorDestinatario
};
