async function loadModals() {
  const container = document.getElementById('modals-container');
  const modals = ['how-it-works', 'privacy', 'clear'];
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
    const pages = m.querySelectorAll('.modal-page');
    if (pages.length) {
      pages.forEach((p, i) => p.classList.toggle('active', i === 0));
      this.updatePagination(id, 1, pages.length);
    }
  }

  static close(id) {
    document.getElementById(id).style.display = 'none';
    document.body.style.overflow = 'auto';
  }

  static nextPage(id) {
    const m = document.getElementById(id);
    const pages = m.querySelectorAll('.modal-page');
    const curr = Array.from(pages).findIndex(p => p.classList.contains('active'));
    if (curr < pages.length - 1) {
      pages[curr].classList.remove('active');
      pages[curr + 1].classList.add('active');
      this.updatePagination(id, curr + 2, pages.length);
    }
  }

  static previousPage(id) {
    const m = document.getElementById(id);
    const pages = m.querySelectorAll('.modal-page');
    const curr = Array.from(pages).findIndex(p => p.classList.contains('active'));
    if (curr > 0) {
      pages[curr].classList.remove('active');
      pages[curr - 1].classList.add('active');
      this.updatePagination(id, curr, pages.length);
    }
  }

  static updatePagination(id, curr, total) {
    const m = document.getElementById(id);
    m.querySelector('.current-page').textContent = curr;
    m.querySelector('.prev-btn').disabled = curr === 1;
    m.querySelector('.next-btn').disabled = curr === total;
  }
}

window.openModal = (id) => Modal.open(id);
window.closeModal = (id) => Modal.close(id);
window.nextPage = (id) => Modal.nextPage(id);
window.previousPage = (id) => Modal.previousPage(id);

window.onclick = (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

window.loadModals = loadModals;
