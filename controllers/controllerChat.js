const crypto = require('crypto');
const { Mensagem, Usuario } = require('../models');
const { verificarAssinaturaCompleta } = require('../utils/cryptoHelpers');


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

async function listarDestinatarios(req, res) {
  const userId = req.session.userId;
  const userLogin = req.session.login;

  if (!userId) return res.status(401).json({ erro: 'Não autenticado' });

  try {
    const usuarios = await Usuario.findAll({
      where: { login: { [require('sequelize').Op.ne]: userLogin } }
    });
    const logins = usuarios.map(u => u.login);
    res.json(logins);
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao listar destinatários' });
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
        mensagemOriginal = Buffer.concat([decipher.update(textoCifrado), decipher.final()]).toString('utf-8');
      } catch {
        return { erro: `Erro ao descriptografar de ${remetente}`, remetente };
      }

      
      const hashCalculado = crypto.createHash('sha256').update(mensagemOriginal).digest('base64');
      const hashValido = hashCalculado === msg.hashMensagem;
      if (!hashValido) {
        erros.push('Hash inválido');
      }

     
      let certificadoObj = {};
      let certificadoValido = true;
      try {
        certificadoObj = typeof msg.certificado === 'string'
          ? JSON.parse(msg.certificado)
          : msg.certificado;

        if (
          !certificadoObj ||
          typeof certificadoObj !== 'object' ||
          !certificadoObj.nome ||
          !(certificadoObj.chavePublica || certificadoObj.publicKey)
        ) {
          certificadoValido = false;
        }
      } catch {
        certificadoValido = false;
      }
      if (!certificadoValido) {
        erros.push('Certificado inválido');
        erros.push('Assinatura não pôde ser validada devido a certificado inválido');
      }

      
      if (certificadoValido) {
        const errosAssinatura = verificarAssinaturaCompleta(
          mensagemOriginal,
          msg.assinaturaDigital,
          certificadoObj.chavePublica || certificadoObj.publicKey || '',
          certificadoObj.nome || '',
          remetente
        );
        erros.push(...errosAssinatura);
      }

      
      const errosUnicos = [...new Set(erros)];
      if (errosUnicos.length > 0) {
        return {
          erro: `${errosUnicos.join(' e ')} de ${remetente}`,
          remetente,
        };
      }

      
      return {
        texto: mensagemOriginal,
        chaveAES: msg.chaveCriptografada,
        iv: msg.vetor,
        assinatura: msg.assinaturaDigital,
        hash: msg.hashMensagem,
        certificate: certificadoObj,
        remetente,
      };
    });

    res.json({ mensagens: mensagensProcessadas });
  } catch (e) {
    console.error('Erro ao listar mensagens:', e);
    res.status(500).json({ erro: 'Erro ao listar mensagens' });
  }
}





async function inicializarChaves() {
  console.log('Chaves simuladas carregadas (função inicializarChaves)');
}

module.exports = {
  getChat,
  salvarMensagem,
  listarDestinatarios,
  listarMensagens,
  inicializarChaves
};
