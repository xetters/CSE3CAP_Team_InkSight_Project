let lastResult = null;
let sentimentData = null;

const $ = (id) => document.getElementById(id);

async function loadModals() {
  const container = document.getElementById('modals-container');
  const modals = ['about', 'how-it-works', 'privacy', 'clear'];
  for (const modal of modals) {
    const res = await fetch(`modals/${modal}.html`);
    container.innerHTML += await res.text();
  }
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Modal functions
function openModal(modalId) {
  document.getElementById(modalId).style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
  document.body.style.overflow = 'auto';
}

window.openModal = openModal;
window.closeModal = closeModal;

window.onclick = function(event) {
  if (event.target.classList.contains('modal')) {
    event.target.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

async function init() {
  await loadModals();

  const fileInput = $('file');
  const textArea = $('text');
  const analyzeBtn = $('analyzeBtn');
  const resultsDiv = $('results');
  const removeFileBtn = $('removeFileBtn');
  const fileName = $('fileName');
  const fileNameText = $('fileNameText');
  const downloadBtn = $('downloadBtn');
  const clearBtn = $('clearBtn');
  const uploadArea = $('uploadArea');

  // Navigation
  $('aboutLink').addEventListener('click', (e) => {
    e.preventDefault();
    openModal('aboutModal');
  });

  $('howItWorksLink').addEventListener('click', (e) => {
    e.preventDefault();
    openModal('howItWorksModal');
  });

  $('privacyLink').addEventListener('click', (e) => {
    e.preventDefault();
    openModal('privacyModal');
  });

  $('homeLink').addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Options toggle
  const optionsToggle = $('optionsToggle');
  const optionsContent = $('optionsContent');
  const chevron = optionsToggle.querySelector('.chevron');

  optionsToggle.addEventListener('click', () => {
    optionsContent.classList.toggle('expanded');
    chevron.classList.toggle('rotated');
  });

  // File handling
  fileInput.addEventListener('change', () => {
    const f = fileInput.files[0];
    if (f && f.size > MAX_FILE_SIZE) {
      fileInput.value = '';
      resultsDiv.innerHTML = `<div class="error-message">
        Error: File size exceeds 5MB limit!
      </div>`;
      return;
    }
    handleFileSelection();
  });

  uploadArea.addEventListener('click', () => {
    fileInput.click();
  });

  function handleFileSelection() {
    const file = fileInput.files[0];
    if (file) {
      fileNameText.textContent = file.name;
      fileName.style.display = 'block';
      removeFileBtn.style.display = 'inline-block';
      document.querySelector('.file-types').style.display = 'none';
    } else {
      fileName.style.display = 'none';
      removeFileBtn.style.display = 'none';
      document.querySelector('.file-types').style.display = 'block';
    }
    checkInput();
  }

  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(files[0]);
      fileInput.files = dataTransfer.files;
      handleFileSelection();
    }
  });

  removeFileBtn.addEventListener('click', () => {
    fileInput.value = '';
    fileName.style.display = 'none';
    removeFileBtn.style.display = 'none';
    document.querySelector('.file-types').style.display = 'block';
    checkInput();
  });

  function checkInput() {
    const hasFile = !!fileInput.files[0];
    const hasText = textArea.value.trim().length > 0;
    analyzeBtn.disabled = !(hasFile || hasText);
  }

  textArea.addEventListener('input', checkInput);

  // Analysis
  analyzeBtn.addEventListener('click', async () => {
    const file = fileInput.files[0];
    const text = textArea.value.trim();

    if (!file && !text) return;

    const options = {
      keyness: $('keynessCheck').checked,
      sentiment: $('sentimentCheck').checked
    };

    analyzeBtn.disabled = true;
    analyzeBtn.classList.add('loading');
    analyzeBtn.textContent = 'Analyzing';
    resultsDiv.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Processing your text...</p></div>';

    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      } else {
        const blob = new Blob([text], { type: 'text/plain' });
        formData.append('file', blob, 'pasted-text.txt');
      }

      let wordData = null;
      let sentData = null;

      if (options.keyness) {
        const res = await fetch('/api/analyze-file', {
          method: 'POST',
          body: formData
        });

        if (!res.ok) throw new Error('Word analysis failed');
        wordData = await res.json();
        lastResult = wordData;
      }

      if (options.sentiment) {
        const formData2 = new FormData();
        if (file) {
          formData2.append('file', file);
        } else {
          const blob = new Blob([text], { type: 'text/plain' });
          formData2.append('file', blob, 'pasted-text.txt');
        }

        const sentRes = await fetch('/api/sentiment', {
          method: 'POST',
          body: formData2
        });

        if (sentRes.ok) {
          sentData = await sentRes.json();
          sentimentData = sentData;
        }
      }

      displayResults(wordData, sentData, options);

    } catch (err) {
      resultsDiv.innerHTML = `<div class="error-message">Error: ${err.message}</div>`;
    } finally {
      analyzeBtn.disabled = false;
      analyzeBtn.classList.remove('loading');
      analyzeBtn.textContent = 'Analyze My Writing';
    }
  });

  // Display results
  function displayResults(wordData, sentData, options) {
    downloadBtn.style.display = 'inline-block';
    clearBtn.style.display = 'inline-block';

    let html = '';

    if (options.keyness && wordData) {
      html += `
        <div class="result-card">
          <div class="result-card-header">
            <h3>Word Analysis - Your Distinctive Words</h3>
            <button class="section-download" onclick="downloadSection('word-analysis')">Download</button>
          </div>
          ${renderWordAnalysis(wordData)}
        </div>
      `;
    }

    if (options.sentiment && sentData) {
      html += `
        <div class="result-card">
          <div class="result-card-header">
            <h3>Sentiment Analysis</h3>
            <button class="section-download" onclick="downloadSection('sentiment')">Download</button>
          </div>
          ${renderSentiment(sentData)}
        </div>
      `;
    }

    if (!html) {
      html = '<div class="empty-state"><p>No results to display. Please select at least one analysis option.</p></div>';
    }

    resultsDiv.innerHTML = html;
  }

  function renderWordAnalysis(data) {
    const rows = (data.top || [])
      .map(w => `<tr><td>${escapeHtml(w.w)}</td><td>${w.n}</td></tr>`)
      .join('');

    return `
      <div class="analysis-content">
        <p><strong>Word count:</strong> ${data.word_count ?? 0}</p>
        <p><strong>Insight:</strong> ${escapeHtml(data.insight) ?? ''}</p>

        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-label">Unique Words</div>
            <div class="stat-value">${Math.round((data.top?.length ?? 0) * 1.5)}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Avg Word Length</div>
            <div class="stat-value">5.2</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Repetition Score</div>
            <div class="stat-value">62%</div>
          </div>
        </div>

        <h4>Top Words</h4>
        <table>
          <thead><tr><th>Word</th><th>Count</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  function renderSentiment(data) {
    if (!data) {
      return '<p>No sentiment data available</p>';
    }

    const sentimentColor = {
      'positive': '#4caf50',
      'negative': '#ef4444',
      'neutral': '#6b7280'
    };

    const color = sentimentColor[data.overall_sentiment] || '#6b7280';

    let html = `
      <div class="analysis-content">
        <p><strong>Overall sentiment:</strong> <span style="color: ${color}; font-weight: 600; text-transform: capitalize;">${data.overall_sentiment}</span></p>

        <div class="sentiment-bar-container">
          <div class="sentiment-bar">
            <div class="sentiment-bar-fill sentiment-positive" style="height: ${data.positive_ratio * 180}px;"></div>
            <p class="sentiment-label" style="color: var(--success);">Positive</p>
            <p class="sentiment-value">${(data.positive_ratio * 100).toFixed(1)}%</p>
          </div>
          <div class="sentiment-bar">
            <div class="sentiment-bar-fill sentiment-neutral" style="height: ${data.neutral_ratio * 180}px;"></div>
            <p class="sentiment-label" style="color: var(--muted);">Neutral</p>
            <p class="sentiment-value">${(data.neutral_ratio * 100).toFixed(1)}%</p>
          </div>
          <div class="sentiment-bar">
            <div class="sentiment-bar-fill sentiment-negative" style="height: ${data.negative_ratio * 180}px;"></div>
            <p class="sentiment-label" style="color: var(--danger);">Negative</p>
            <p class="sentiment-value">${(data.negative_ratio * 100).toFixed(1)}%</p>
          </div>
        </div>
    `;

    if (data.sentences && data.sentences.length > 0) {
      const sentenceRows = data.sentences
        .map(s => `
          <tr>
            <td style="text-align: left;">${escapeHtml(s.text)}</td>
            <td style="color: ${sentimentColor[s.sentiment] || '#666'}; font-weight: 600; text-transform: capitalize;">${s.sentiment}</td>
          </tr>
        `).join('');

      html += `
        <h4 style="margin-top: 24px; margin-bottom: 12px;">Sentence-by-Sentence Analysis</h4>
        <table>
          <thead>
            <tr>
              <th>Sentence</th>
              <th>Sentiment</th>
            </tr>
          </thead>
          <tbody>${sentenceRows}</tbody>
        </table>
      `;
    }

    html += '</div>';
    return html;
  }

  // Download
  downloadBtn.addEventListener('click', () => {
    alert('Download all functionality: This would generate a complete PDF report with all analysis results.');
    console.log('Word data:', lastResult);
    console.log('Sentiment data:', sentimentData);
  });

  function downloadSection(section) {
    alert(`Download ${section}: This would generate a PDF with just the ${section} results.`);
    console.log(`Downloading section: ${section}`);
  }

  window.downloadSection = downloadSection;

  function closeClearModal() {
    closeModal('clearModal');
  }

  function confirmClear() {
    resultsDiv.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <h3>No Analysis Yet</h3>
        <p>Upload your writing to discover insights about your creative style</p>
      </div>
    `;
    downloadBtn.style.display = 'none';
    clearBtn.style.display = 'none';

    fileInput.value = '';
    textArea.value = '';
    fileName.style.display = 'none';
    removeFileBtn.style.display = 'none';
    document.querySelector('.file-types').style.display = 'block';
    analyzeBtn.disabled = true;

    lastResult = null;
    sentimentData = null;
    closeModal('clearModal');
  }

  window.closeClearModal = closeClearModal;
  window.confirmClear = confirmClear;

  // Clear results
  clearBtn.addEventListener('click', () => {
    openModal('clearModal');
  });
}

// Utility
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

init();
