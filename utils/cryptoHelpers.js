const crypto = require('crypto');

function calcularHash(texto) {
  return crypto.createHash('sha256').update(texto).digest('hex');
}

function verificarHash(mensagem, hashEsperado) {
  const hashCalculado = calcularHash(mensagem);
  return hashCalculado === hashEsperado;
}

function verificarAssinatura(mensagem, assinaturaBase64, certificadoJson) {
  try {
    const certificado = JSON.parse(certificadoJson);

    if (!certificado.nome || !certificado.chavePublica) {
      return { valido: false, erro: 'Certificado inválido' };
    }

    const chaveDer = Buffer.from(certificado.chavePublica, 'base64'); // CORRETO AGORA
    const chavePublica = crypto.createPublicKey({
      key: chaveDer,
      format: 'der',
      type: 'spki'
    });

    const assinatura = Buffer.from(assinaturaBase64, 'base64');

    const verificado = crypto.verify(
      'sha256',
      Buffer.from(mensagem),
      chavePublica,
      assinatura
    );

    return verificado
      ? { valido: true }
      : { valido: false, erro: 'Assinatura inválida' };

  } catch (e) {
    return { valido: false, erro: 'Certificado inválido' };
  }
}

module.exports = {
  calcularHash,
  verificarHash,
  verificarAssinatura,
};
