document.addEventListener('DOMContentLoaded', async () => {
  if (!localStorage.getItem('chavePrivada') || !localStorage.getItem('chavePublica')) {
    const { chavePrivadaPEM, chavePublicaPEM } = await gerarParDeChaves();
    localStorage.setItem('chavePrivada', chavePrivadaPEM);
    localStorage.setItem('chavePublica', chavePublicaPEM);
  }

  const user = document.getElementById('user-logado').value.trim();
  let destinatario = '';

  async function carregarDestinatarios() {
    const select = document.getElementById('destinatario-select');
    const resp = await fetch('/destinatarios');
    const lista = await resp.json();

    lista.forEach(nome => {
      const option = document.createElement('option');
      option.value = nome;
      option.textContent = nome;
      select.appendChild(option);
    });

    if (lista.length > 0) {
      destinatario = lista[0];
    }

    select.addEventListener('change', () => {
      destinatario = select.value;
    });
  }

  async function enviarMensagem() {
    const input = document.getElementById('input-message');
    const texto = input.value.trim();
    if (!texto || !destinatario) return;

    const encoder = new TextEncoder();
    const dados = encoder.encode(texto);

    const chaveAES = await window.crypto.subtle.generateKey(
      { name: 'AES-CBC', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    const iv = window.crypto.getRandomValues(new Uint8Array(16));

    const mensagemCriptografada = await window.crypto.subtle.encrypt(
      { name: 'AES-CBC', iv },
      chaveAES,
      dados
    );

    const chaveAESExportada = await window.crypto.subtle.exportKey('raw', chaveAES);
    const chaveAESBase64 = btoa(String.fromCharCode(...new Uint8Array(chaveAESExportada)));

    const hashBuffer = await window.crypto.subtle.digest('SHA-256', dados);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashBase64 = btoa(String.fromCharCode(...hashArray));

    const chavePrivadaPEM = localStorage.getItem('chavePrivada');
    const chavePrivada = await importarChavePrivada(chavePrivadaPEM);
    const assinaturaBuffer = await window.crypto.subtle.sign(
  { name: 'RSASSA-PKCS1-v1_5' },
  chavePrivada,
  dados 
);

    const assinaturaBase64 = btoa(String.fromCharCode(...new Uint8Array(assinaturaBuffer)));

    const certificado = {
      nome: user,
      chavePublica: localStorage.getItem('chavePublica') // PEM completo
    };

    await fetch('/salvarMensagem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destinatario,
        texto: btoa(String.fromCharCode(...new Uint8Array(mensagemCriptografada))),
        chaveAES: chaveAESBase64,
        iv: btoa(String.fromCharCode(...iv)),
        hash: hashBase64,
        assinatura: assinaturaBase64,
        certificate: certificado
      })
    });

    input.value = '';
  }

  async function buscarMensagens() {
    const resp = await fetch('/listarMensagens');
    const { mensagens } = await resp.json();

    const container = document.getElementById('chat-container');
    container.innerHTML = '';

    mensagens.forEach(m => {
      const div = document.createElement('div');
      div.textContent = m.erro ? `⚠️ ${m.erro}` : `${m.remetente}: ${m.texto}`;
      container.appendChild(div);
    });
  }

  document.getElementById('send-btn').addEventListener('click', enviarMensagem);
  document.getElementById('fetch-btn').addEventListener('click', buscarMensagens);

  await carregarDestinatarios();
});

async function importarChavePrivada(pem) {
  const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s/g, '');
  const der = Uint8Array.from(atob(b64), c => c.charCodeAt(0));

  return window.crypto.subtle.importKey(
    'pkcs8',
    der.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

async function gerarParDeChaves() {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256'
    },
    true,
    ['sign', 'verify']
  );

  const chavePrivadaExportada = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
  const chavePublicaExportada = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);

  const chavePrivadaPEM = `-----BEGIN PRIVATE KEY-----\n${btoa(String.fromCharCode(...new Uint8Array(chavePrivadaExportada))).match(/.{1,64}/g).join('\n')}\n-----END PRIVATE KEY-----`;
  const chavePublicaPEM = `-----BEGIN PUBLIC KEY-----\n${btoa(String.fromCharCode(...new Uint8Array(chavePublicaExportada))).match(/.{1,64}/g).join('\n')}\n-----END PUBLIC KEY-----`;

  return { chavePrivadaPEM, chavePublicaPEM };
}
