// frontend/index.js
let lastResult = null;

const $ = (id) => document.getElementById(id);
const fileInput = $('file');
const textArea = $('text');
const analyzeBtn = $('analyzeBtn');
const resultsDiv = $('results');

// Enable analyze button when file is uploaded or text is entered
function checkInput() {
  const hasFile = !!fileInput.files[0];
  const hasText = !!textArea.value.trim();
  
  analyzeBtn.disabled = !hasFile && !hasText;
  
  // Disable textarea if file is uploaded
  textArea.disabled = hasFile;
  
  // Disable file input if text is entered
  fileInput.disabled = hasText;
}

fileInput.addEventListener('change', checkInput);
textArea.addEventListener('input', checkInput);

function renderContainers() {
  resultsDiv.innerHTML = `
    <div class="analysis-container">
      <button id="sentimentBtn">Sentiment Analysis</button>
      <div id="sentimentResults"></div>
    </div>

    <div class="analysis-container">
      <button id="keynessBtn">Keyness Statistics</button>
      <div id="keynessResults"></div>
    </div>

    <div class="analysis-container">
      <button id="wordCountBtn">Word Count</button>
      <div id="wordCountResults"></div>
    </div>
  `;

  // Add click handlers for each button
  $('sentimentBtn').addEventListener('click', () => {
    const container = $('sentimentResults');
    if (container.innerHTML) {
      container.innerHTML = '';
    } else {
      renderTable(container, lastResult);
    }
  });

  $('keynessBtn').addEventListener('click', () => {
    const container = $('keynessResults');
    if (container.innerHTML) {
      container.innerHTML = '';
    } else {
      renderTable(container, lastResult);
    }
  });

  $('wordCountBtn').addEventListener('click', () => {
    const container = $('wordCountResults');
    if (container.innerHTML) {
      container.innerHTML = '';
    } else {
      renderTable(container, lastResult);
    }
  });
}

function renderTable(container, data) {
  if (!data) { container.textContent = ''; return; }

  const rows = (data.top || []).map(item =>
    `<tr><td>${item.w}</td><td>${item.n}</td></tr>`
  ).join('');

  container.innerHTML = `
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
  const text = textArea.value.trim();
  
  if (!f && !text) { 
    alert('Choose a .txt file or enter text first'); 
    return; 
  }

  const fd = new FormData();
  
  if (f) {
    fd.append('file', f);
  } else {
    // Create a blob from textarea text and send as file
    const blob = new Blob([text], { type: 'text/plain' });
    fd.append('file', blob, 'input.txt');
  }

  try {
    const res = await fetch('/api/analyze-file', { method: 'POST', body: fd });
    const data = await res.json();
    lastResult = data;
    renderContainers();
  } catch (e) {
    alert('Error analyzing file');
  }
});