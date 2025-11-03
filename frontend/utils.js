function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function toggleCardContent(event) {
  const card = event.currentTarget.closest('.result-card');
  const content = card.querySelector('.result-card-content');
  const toggle = card.querySelector('.result-card-toggle');
  content.classList.toggle('collapsed');
  toggle.classList.toggle('collapsed');
}

function toggleFormulas(event) {
  const toggle = event.currentTarget;
  const formulasSection = toggle.nextElementSibling;
  const icon = toggle.querySelector('.formulas-toggle-icon');
  formulasSection.classList.toggle('collapsed');
  icon.classList.toggle('rotated');
}

window.escapeHtml = escapeHtml;
window.toggleCardContent = toggleCardContent;
window.toggleFormulas = toggleFormulas;
