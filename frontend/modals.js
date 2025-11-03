async function loadModals() {
  const container = document.getElementById('modals-container');
  const modals = ['how-it-works', 'team', 'clear'];
  for (const modal of modals) {
    const res = await fetch(`modals/${modal}.html`);
    container.innerHTML += await res.text();
  }
}

class Modal {
  static open(id) {
    const m = document.getElementById(id);
    m.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }

  static close(id) {
    document.getElementById(id).style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

window.openModal = (id) => Modal.open(id);
window.closeModal = (id) => Modal.close(id);

window.onclick = (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

window.loadModals = loadModals;
