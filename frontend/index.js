// frontend/index.js
let lastResult = null;

const $ = (id) => document.getElementById(id);
const fileInput = $('file');
const analyzeBtn = $('analyzeBtn');
const showBtn = $('showBtn');
const resultsDiv = $('results');

function render(data) {
  if (!data) { resultsDiv.textContent = ''; return; }

  const rows = (data.top || []).map(item =>
    `<tr><td>${item.w}</td><td>${item.n}</td></tr>`
  ).join('');

  resultsDiv.innerHTML = `
    <p><b>Word count:</b> ${data.word_count ?? 0}</p>
    <p><b>Insight:</b> ${data.insight ?? ''}</p>
    <table border="1" cellpadding="4" cellspacing="0">
      <thead><tr><th>Word</th><th>Count</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

analyzeBtn.addEventListener('click', async () => {
  const f = fileInput.files[0];
  if (!f) { alert('Choose a .txt file first'); return; }

  const fd = new FormData();
  fd.append('file', f);

  try {
    const res = await fetch('/api/analyze-file', { method: 'POST', body: fd });
    const data = await res.json();
    lastResult = data;
    render(lastResult);                // show immediately after analyze
  } catch (e) {
    alert('Error analyzing file');
  }
});

showBtn.addEventListener('click', () => render(lastResult));
