const crypto = require('crypto');
const forge = require('node-forge');

// --- Hash SHA-256 ---
function gerarHash(mensagem) {
  return crypto.createHash('sha256').update(mensagem).digest('hex');
}

// --- Criptografia Simétrica AES ---
function gerarChaveSimetrica() {
  return crypto.randomBytes(32); // 256 bits
}

function criptografarAES(mensagem, chave) {
  const iv = crypto.randomBytes(16); // IV aleatório
  const cipher = crypto.createCipheriv('aes-256-cbc', chave, iv);
  let encrypted = cipher.update(mensagem, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { iv: iv.toString('hex'), encryptedData: encrypted };
}

function descriptografarAES(encryptedObj, chave) {
  const iv = Buffer.from(encryptedObj.iv, 'hex');
  const encryptedText = encryptedObj.encryptedData;
  const decipher = crypto.createDecipheriv('aes-256-cbc', chave, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// --- Criptografia Assimétrica RSA (gerar par de chaves) ---
function gerarChavesRSA() {
  const keypair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
  const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);
  const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);
  return { publicKeyPem, privateKeyPem };
}

// --- Criptografar chave simétrica com chave pública RSA ---
function criptografarChaveSimetrica(chaveSimetrica, publicKeyPem) {
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  const encrypted = publicKey.encrypt(chaveSimetrica.toString('binary'));
  return forge.util.encode64(encrypted);
}

// --- Descriptografar chave simétrica com chave privada RSA ---
function descriptografarChaveSimetrica(chaveCriptografadaBase64, privateKeyPem) {
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  const encrypted = forge.util.decode64(chaveCriptografadaBase64);
  const decrypted = privateKey.decrypt(encrypted);
  return Buffer.from(decrypted, 'binary');
}

// --- Assinatura digital ---
function assinarMensagem(mensagem, privateKeyPem) {
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  const md = forge.md.sha256.create();
  md.update(mensagem, 'utf8');
  const signature = privateKey.sign(md);
  return forge.util.encode64(signature);
}

// --- Verificar assinatura ---
function verificarAssinatura(mensagem, assinaturaBase64, publicKeyPem) {
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  const md = forge.md.sha256.create();
  md.update(mensagem, 'utf8');
  const signature = forge.util.decode64(assinaturaBase64);
  return publicKey.verify(md.digest().bytes(), signature);
}

// --- Simular certificado digital simples (associar usuário com chave pública) ---
const certificadosSimulados = {};

function registrarCertificado(usuario, publicKeyPem) {
  certificadosSimulados[usuario] = publicKeyPem;
}

function obterCertificado(usuario) {
  return certificadosSimulados[usuario];
}

module.exports = {
  gerarHash,
  gerarChaveSimetrica,
  criptografarAES,
  descriptografarAES,
  gerarChavesRSA,
  criptografarChaveSimetrica,
  descriptografarChaveSimetrica,
  assinarMensagem,
  verificarAssinatura,
  registrarCertificado,
  obterCertificado,
};
