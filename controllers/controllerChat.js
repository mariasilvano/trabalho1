const crypto = require('crypto');
const { Mensagem, Usuario } = require('../models');
const { verificarAssinatura } = require('../utils/cryptoHelpers');

function getChat(req, res) {
  if (!req.session.userId) return res.redirect('/login');
  res.render('chat', {
    layout: 'chatLayout.handlebars',
    user: req.session.login
  });
}

async function salvarMensagem(req, res) {
  try {
    const login = req.session.login;
    if (!login) return res.status(401).json({ erro: 'Usuário não autenticado' });

    const {
      destinatario,
      texto,
      chaveAES,
      iv,
      hash,
      assinatura,
      certificate
    } = req.body;

    if (!assinatura) return res.status(400).json({ erro: 'Assinatura ausente' });

    const remetente = await Usuario.findOne({ where: { login } });
    const destino = await Usuario.findOne({ where: { login: destinatario } });

    if (!remetente || !destino) return res.status(404).json({ erro: 'Usuários não encontrados' });

    await Mensagem.create({
      remetenteId: remetente.id,
      destinatarioId: destino.id,
      mensagemCriptografada: texto,
      chaveCriptografada: chaveAES,
      vetor: iv,
      assinaturaDigital: assinatura,
      hashMensagem: hash,
      certificado: JSON.stringify(certificate)
    });

    return res.status(201).json({
      remetente: remetente.login,
      destinatario,
      texto,
      chaveAES,
      iv,
      hash,
      assinatura,
      certificate
    });
  } catch (e) {
    console.error("Erro ao salvar:", e);
    res.status(500).json({ erro: 'Erro ao salvar mensagem' });
  }
}

async function listarMensagens(req, res) {
  const usuarioId = req.session.userId;
  if (!usuarioId) return res.status(401).json({ erro: 'Usuário não autenticado' });

  try {
    const mensagens = await Mensagem.findAll({
      where: { destinatarioId: usuarioId },
      include: [{ model: Usuario, as: 'Remetente' }],
      order: [['criado_em', 'ASC']],
    });

    const mensagensProcessadas = mensagens.map((msg) => {
      const erros = [];
      const remetente = msg.Remetente.login;

      const textoCifrado = Buffer.from(msg.mensagemCriptografada, 'base64');
      const chave = Buffer.from(msg.chaveCriptografada, 'base64');
      const iv = Buffer.from(msg.vetor, 'base64');

      let mensagemOriginal;
      try {
        const decipher = crypto.createDecipheriv('aes-256-cbc', chave, iv);
        mensagemOriginal = decipher.update(textoCifrado);
        mensagemOriginal = Buffer.concat([mensagemOriginal, decipher.final()]);
        mensagemOriginal = mensagemOriginal.toString('utf-8');
      } catch (e) {
        return {
          erro: 'Erro ao descriptografar',
          remetente,
        };
      }

      
      const hashCalculado = crypto.createHash('sha256').update(mensagemOriginal).digest('base64');
      if (hashCalculado !== msg.hashMensagem) {
        erros.push('Hash inválido');
      }

      
      const resultadoAssinatura = verificarAssinatura(
        mensagemOriginal,
        msg.assinaturaDigital,
        msg.certificado
      );

      if (!resultadoAssinatura.valido) {
        erros.push(resultadoAssinatura.erro);
      }

      
      try {
        const certificado = JSON.parse(msg.certificado);
        if (certificado.nome !== remetente) {
          erros.push('Certificado inválido');
        }
      } catch {
        erros.push('Certificado inválido');
      }

      if (erros.length > 0) {
        return {
          erro: erros.join(' e '),
          remetente,
        };
      }

      return {
        texto: msg.mensagemCriptografada,
        chaveAES: msg.chaveCriptografada,
        iv: msg.vetor,
        assinatura: msg.assinaturaDigital,
        hash: msg.hashMensagem,
        certificate: JSON.parse(msg.certificado),
        remetente,
      };
    });

    res.json({ mensagens: mensagensProcessadas });
  } catch (e) {
    console.error("Erro ao listar mensagens:", e);
    res.status(500).json({ erro: 'Erro ao listar mensagens' });
  }
}


async function inicializarChaves() {
  console.log('Chaves simuladas carregadas (função inicializarChaves)');
}

module.exports = {
  getChat,
  salvarMensagem,
  listarMensagens,
  inicializarChaves
};
