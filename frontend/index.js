// frontend/index.js
let lastResult = null;

const $ = (id) => document.getElementById(id);
const fileInput = $('file');
const analyzeBtn = $('analyzeBtn');
const showBtn = $('showBtn');
const resultsDiv = $('results');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB, can config
const removeFileBtn = document.getElementById('removeFileBtn');

//file size error handling, box is under analyze button. need change later
fileInput.addEventListener('change', () => {
  const f = fileInput.files[0];
  if (f && f.size > MAX_FILE_SIZE) {
    fileInput.value = '';
    resultsDiv.innerHTML = `<div style="color:red; border:1px solid red; padding:8px; margin-bottom:8px;">
      Error: File size exceeds 5MB limit.
    </div>`;
  }
});

// to hide the "file-type message" text when a file is uploaded:
document.getElementById('file').addEventListener('change', function() {
  document.querySelector('.file-types').style.display = 'none';
});

fileInput.addEventListener('change', function() {
  removeFileBtn.style.display = fileInput.files.length ? 'inline-block' : 'none';
});

removeFileBtn.addEventListener('click', function() {
  fileInput.value = '';
  removeFileBtn.style.display = 'none';
});

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
