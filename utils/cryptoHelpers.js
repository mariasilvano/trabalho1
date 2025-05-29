const crypto = require('crypto');

function calcularHash(texto) {
  return crypto.createHash('sha256').update(texto).digest('hex');
}

function verificarHash(mensagem, hashEsperado) {
  const hashCalculado = crypto.createHash('sha256').update(mensagem).digest('base64');
  return hashCalculado === hashEsperado;
}

function verificarAssinaturaCompleta(mensagem, assinaturaBase64, chavePublicaPEM, nomeCertificado, nomeEsperado) {
  const erros = [];
  let chavePublica;

  if (nomeCertificado !== nomeEsperado) {
    erros.push('Certificado inválido');
  }

  try {
    const chaveLimpa = chavePublicaPEM
      .replace(/-----BEGIN PUBLIC KEY-----/, '')
      .replace(/-----END PUBLIC KEY-----/, '')
      .replace(/\s/g, '');
    const chaveDer = Buffer.from(chaveLimpa, 'base64');
    chavePublica = crypto.createPublicKey({ key: chaveDer, format: 'der', type: 'spki' });
  } catch {
    erros.push('Certificado inválido');
    
    return [...new Set(erros)];
  }

  try {
    const assinatura = Buffer.from(assinaturaBase64, 'base64');
    const assinaturaValida = crypto.verify(
      'sha256',
      Buffer.from(mensagem),
      chavePublica,
      assinatura
    );
    if (!assinaturaValida) erros.push('Assinatura inválida');
  } catch {
    erros.push('Assinatura inválida');
  }

  return [...new Set(erros)];
}



module.exports = {
  calcularHash,
  verificarHash,
  verificarAssinaturaCompleta
};
