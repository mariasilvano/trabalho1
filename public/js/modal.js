// Evento para fechar a modal após o usuário utilizar o QRCode
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('modal-2fa');
  const btnFechar = document.getElementById('fechar-modal');

  if (modal && btnFechar) {
    modal.style.display = 'flex';
    btnFechar.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }
});
