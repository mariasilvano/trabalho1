document.addEventListener('DOMContentLoaded', async () => {
  const user = document.getElementById('user-logado').value;
  const destinatario = user === 'Alice' ? 'Bob' : 'Alice';

  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256"
    },
    true,
    ["sign", "verify"]
  );

  window.chavePrivadaSimulada = keyPair.privateKey;

  async function exportarChavePublicaBase64() {
    const chaveSPKI = await crypto.subtle.exportKey("spki", keyPair.publicKey);
    return btoa(String.fromCharCode(...new Uint8Array(chaveSPKI)));
  }

  async function gerarChaveAES() {
    return crypto.getRandomValues(new Uint8Array(32));
  }

  async function gerarIV() {
    return crypto.getRandomValues(new Uint8Array(16));
  }

  async function hashMensagem(msg) {
    const encoder = new TextEncoder();
    const data = encoder.encode(msg);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(hash)));
  }

  async function assinar(msg) {
    const encoder = new TextEncoder();
    const data = encoder.encode(msg);
    const assinatura = await crypto.subtle.sign(
      { name: "RSASSA-PKCS1-v1_5" },
      window.chavePrivadaSimulada,
      data
    );
    return btoa(String.fromCharCode(...new Uint8Array(assinatura)));
  }

  async function verificarAssinatura(publicKeyBase64, assinaturaBase64, texto) {
    const assinatura = Uint8Array.from(atob(assinaturaBase64), c => c.charCodeAt(0));
    const textoBuffer = new TextEncoder().encode(texto);

    const binaryKey = Uint8Array.from(atob(publicKeyBase64), c => c.charCodeAt(0)).buffer;
    const publicKey = await crypto.subtle.importKey(
      'spki',
      binaryKey,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      true,
      ['verify']
    );

    return await crypto.subtle.verify(
      { name: "RSASSA-PKCS1-v1_5" },
      publicKey,
      assinatura,
      textoBuffer
    );
  }

  async function descriptografarMensagem(cipherTextB64, chaveAESb64, ivB64) {
    const chaveBytes = Uint8Array.from(atob(chaveAESb64), c => c.charCodeAt(0));
    const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));
    const cipherBytes = Uint8Array.from(atob(cipherTextB64), c => c.charCodeAt(0));

    const chave = await crypto.subtle.importKey(
      "raw",
      chaveBytes,
      { name: "AES-CBC" },
      false,
      ["decrypt"]
    );

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-CBC", iv },
      chave,
      cipherBytes
    );

    return new TextDecoder().decode(decryptedBuffer);
  }

  async function enviarMensagem() {
    const texto = document.getElementById('input-message').value;
    if (!texto) return alert("Digite algo.");

    const chaveAES = await gerarChaveAES();
    const iv = await gerarIV();

    const encoder = new TextEncoder();
    const cipherBuffer = await crypto.subtle.encrypt(
      { name: "AES-CBC", iv },
      await crypto.subtle.importKey("raw", chaveAES, "AES-CBC", false, ["encrypt"]),
      encoder.encode(texto)
    );

    const hash = await hashMensagem(texto);
    const assinatura = await assinar(texto);
    const publicKeyBase64 = await exportarChavePublicaBase64();

    const payload = {
      remetente: user,
      destinatario,
      texto: btoa(String.fromCharCode(...new Uint8Array(cipherBuffer))),
      chaveAES: btoa(String.fromCharCode(...chaveAES)),
      iv: btoa(String.fromCharCode(...iv)),
      hash,
      assinatura,
      certificate: {
        nome: user,
        chavePublica: publicKeyBase64
      }
    };

    const resp = await fetch('/salvarMensagem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await resp.json();
    if (!resp.ok) alert(data.erro || "Erro ao enviar");
    else document.getElementById('input-message').value = '';
  }

  async function buscarMensagens() {
    const r = await fetch('/listarMensagens');
    const dados = await r.json();

    const div = document.getElementById('chat');
    div.innerHTML = '';

    for (const msg of dados.mensagens) {
      let item = document.createElement('p');

      if (msg.erro && msg.remetente) {
        item.textContent = `⚠️ ${msg.erro}`;
        div.appendChild(item);
        continue;
      }

      try {
        const textoClaro = await descriptografarMensagem(msg.texto, msg.chaveAES, msg.iv);

        const hashLocal = await hashMensagem(textoClaro);
        if (hashLocal !== msg.hash) {
          item.textContent = `⚠️ Hash inválido de ${msg.remetente}`;
          div.appendChild(item);
          continue;
        }

        const ok = await verificarAssinatura(msg.certificate.chavePublica, msg.assinatura, textoClaro);

        if (!ok) {
          item.textContent = `⚠️ Assinatura inválida de ${msg.remetente}`;
        } else {
          item.textContent = `${msg.remetente} disse: ${textoClaro}`;
        }
      } catch (e) {
        item.textContent = `⚠️ ERRO ao decifrar mensagem de ${msg.remetente}`;
      }

      div.appendChild(item);
    }
  }

  document.getElementById('send-btn').addEventListener('click', enviarMensagem);
  document.getElementById('fetch-btn').addEventListener('click', buscarMensagens);
});
