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
const EMPTY_STATE_HTML = `
  <div class="empty-state">
    <div class="empty-state-icon">🔍</div>
    <h3>No Analysis Yet</h3>
    <p>Upload your writing to discover insights about your creative style</p>
  </div>
`;

// Modal functions
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';

  // Initialize pagination buttons
  const pages = modal.querySelectorAll('.modal-page');
  if (pages.length > 0) {
    // Reset to first page
    pages.forEach((page, index) => {
      page.classList.toggle('active', index === 0);
    });
    updatePaginationInfo(modalId, 1, pages.length);
  }
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
  document.body.style.overflow = 'auto';
}

window.openModal = openModal;
window.closeModal = closeModal;

// Modal pagination functions
function nextPage(modalId) {
  const modal = document.getElementById(modalId);
  const pages = modal.querySelectorAll('.modal-page');
  const currentPage = Array.from(pages).findIndex(p => p.classList.contains('active'));

  if (currentPage < pages.length - 1) {
    pages[currentPage].classList.remove('active');
    pages[currentPage + 1].classList.add('active');
    updatePaginationInfo(modalId, currentPage + 2, pages.length);
  }
}

function previousPage(modalId) {
  const modal = document.getElementById(modalId);
  const pages = modal.querySelectorAll('.modal-page');
  const currentPage = Array.from(pages).findIndex(p => p.classList.contains('active'));

  if (currentPage > 0) {
    pages[currentPage].classList.remove('active');
    pages[currentPage - 1].classList.add('active');
    updatePaginationInfo(modalId, currentPage, pages.length);
  }
}

function updatePaginationInfo(modalId, currentPage, totalPages) {
  const modal = document.getElementById(modalId);
  const paginationInfo = modal.querySelector('.pagination-info');
  const currentPageSpan = paginationInfo.querySelector('.current-page');
  const prevBtn = modal.querySelector('.prev-btn');
  const nextBtn = modal.querySelector('.next-btn');

  currentPageSpan.textContent = currentPage;

  // Disable buttons at start/end
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}

window.nextPage = nextPage;
window.previousPage = previousPage;

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
  const uploadCollapseBtn = $('uploadCollapseBtn');
  const uploadContent = $('uploadContent');
  const uploadSection = document.querySelector('.upload-section');
  const contentGrid = document.querySelector('.content-grid');

  // Navigation
  const navModals = { howItWorksLink: 'howItWorksModal', implementationLink: 'implementationModal', teamLink: 'teamModal' };
  Object.entries(navModals).forEach(([link, modal]) => {
    $(link).addEventListener('click', (e) => {
      e.preventDefault();
      openModal(modal);
    });
  });

  // Options toggle
  const optionsToggle = $('optionsToggle');
  const optionsContent = $('optionsContent');
  const chevron = optionsToggle.querySelector('.chevron');

  optionsToggle.addEventListener('click', () => {
    optionsContent.classList.toggle('expanded');
    chevron.classList.toggle('rotated');
  });

  // Initialize keyness statistics UI
  initKeynessStats();

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

    // Disable textarea if file is selected, disable file upload if text is entered
    textArea.disabled = hasFile;
    uploadArea.style.pointerEvents = hasText ? 'none' : 'auto';
    uploadArea.style.opacity = hasText ? '0.5' : '1';

    // Check if any analysis option is selected
    const keywordAnalysisSelected = $('keynessCheck').checked;
    const sentimentSelected = $('sentimentCheck').checked;
    const keynessStatsSelected = $('keynessStatsCheck').checked;
    const hasAnalysisOption = keywordAnalysisSelected || sentimentSelected || keynessStatsSelected;

    // If keyness stats is selected, corpus must be selected
    const keynessCorpusValid = !keynessStatsSelected || $('corpusSelect').value.trim() !== '';

    analyzeBtn.disabled = !(hasFile || hasText) || !hasAnalysisOption || !keynessCorpusValid;
  }

  textArea.addEventListener('input', checkInput);

  // Upload section collapse functionality
  uploadCollapseBtn.addEventListener('click', () => {
    const isCollapsed = uploadContent.classList.contains('collapsed');
    uploadContent.classList.toggle('collapsed');
    uploadSection.classList.toggle('collapsed');
    contentGrid.classList.toggle('stacked');
    uploadCollapseBtn.textContent = isCollapsed ? 'Collapse' : 'Expand';
  });

  // Helper to create FormData
  function createFormData() {
    const formData = new FormData();
    const file = fileInput.files[0];
    if (file) {
      formData.append('file', file);
    } else {
      const blob = new Blob([textArea.value.trim()], { type: 'text/plain' });
      formData.append('file', blob, 'pasted-text.txt');
    }
    return formData;
  }

  // Analysis
  analyzeBtn.addEventListener('click', async () => {
    const file = fileInput.files[0];
    const text = textArea.value.trim();

    if (!file && !text) return;

    const options = {
      keyness: $('keynessCheck').checked,
      sentiment: $('sentimentCheck').checked,
      keynessStats: keynessStatsCheck.checked
    };

    analyzeBtn.disabled = true;
    analyzeBtn.classList.add('loading');
    analyzeBtn.textContent = 'Analyzing';
    resultsDiv.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Processing your text...</p></div>';

    try {
      let wordData = null;
      let sentData = null;
      let keynessData = null;

      if (options.keyness) {
        const res = await fetch('/api/analyze-file', {
          method: 'POST',
          body: createFormData()
        });

        if (!res.ok) throw new Error('Word analysis failed');
        wordData = await res.json();
        setLastResult(wordData);
      }

      if (options.sentiment) {
        const sentRes = await fetch('/api/sentiment', {
          method: 'POST',
          body: createFormData()
        });

        if (sentRes.ok) {
          sentData = await sentRes.json();
          setSentimentData(sentData);
        }
      }

      if (options.keynessStats) {
        try {
          keynessData = await analyzeKeyness(createFormData(), $('corpusSelect').value);
          setKeynessData(keynessData);
        } catch (err) {
          console.error('Keyness analysis error:', err);
        }
      }

      displayResults(wordData, sentData, keynessData, options);

      // Show collapse button after successful analysis
      uploadCollapseBtn.style.display = 'inline-block';

    } catch (err) {
      resultsDiv.innerHTML = `<div class="error-message">Error: ${err.message}</div>`;
    } finally {
      analyzeBtn.disabled = false;
      analyzeBtn.classList.remove('loading');
      analyzeBtn.textContent = 'Analyze My Writing';
    }
  });

  // Display results
  function displayResults(wordData, sentData, keynessData, options) {
    downloadBtn.style.display = 'inline-block';
    clearBtn.style.display = 'inline-block';

    let html = '';

    if (options.keyness && wordData) {
      html += `
        <div class="result-card">
          <div class="result-card-header" onclick="toggleCardContent(event)">
            <h3>Word Analysis - Your Distinctive Words</h3>
            <div class="card-actions">
              <button class="section-download" onclick="event.stopPropagation(); downloadSection('word-analysis')">Download</button>
              <div class="result-card-toggle">▼</div>
            </div>
          </div>
          <div class="result-card-content">
            ${renderWordAnalysis(wordData)}
          </div>
        </div>
      `;
    }

    if (options.sentiment && sentData) {
      html += `
        <div class="result-card">
          <div class="result-card-header" onclick="toggleCardContent(event)">
            <h3>Sentiment Analysis</h3>
            <div class="card-actions">
              <button class="section-download" onclick="event.stopPropagation(); downloadSection('sentiment')">Download</button>
              <div class="result-card-toggle">▼</div>
            </div>
          </div>
          <div class="result-card-content">
            ${renderSentiment(sentData)}
          </div>
        </div>
      `;
    }

    if (options.keynessStats && keynessData) {
      html += `
        <div class="result-card">
          <div class="result-card-header" onclick="toggleCardContent(event)">
            <h3>Keyness Statistics</h3>
            <div class="card-actions">
              <button class="section-download" onclick="event.stopPropagation(); downloadSection('keyness-stats')">Download</button>
              <div class="result-card-toggle">▼</div>
            </div>
          </div>
          <div class="result-card-content">
            ${renderKeynessStats(keynessData)}
          </div>
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

    const readingTimeValue = data.reading_time?.value ?? 0;
    const readingTimeUnit = data.reading_time?.unit ?? 'minutes';

    return `
      <div class="analysis-content">
        <p><strong>Word count:</strong> ${data.word_count ?? 0}</p>

        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-label">Sentence Count</div>
            <div class="stat-value">${data.sentence_count ?? 0}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Avg Sentence Length</div>
            <div class="stat-value">${data.avg_sentence_length ?? 0}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Estimated Reading Time</div>
            <div class="stat-value">${readingTimeValue} ${readingTimeUnit}</div>
          </div>
        </div>

        <div class="formulas-section-toggle" onclick="toggleFormulas(event)">
          <div class="formulas-toggle-header">
            <h4>How These Metrics Work?</h4>
            <span class="formulas-toggle-icon">▶</span>
          </div>
        </div>

        <div class="formulas-section collapsed">
          <div class="formula-item">
            <strong>Sentence Count:</strong> Total number of sentences (split by . ! ?)
          </div>
          <div class="formula-item">
            <strong>Average Sentence Length:</strong> Total Words ÷ Sentence Count
          </div>
          <div class="formula-item">
            <strong>Estimated Reading Time:</strong> Total Words ÷ 200 (average reading speed: 200 words/minute)
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

  // Initialize download functionality
  initDownloads(downloadBtn);

  function closeClearModal() {
    closeModal('clearModal');
  }

  function confirmClear() {
    resultsDiv.innerHTML = EMPTY_STATE_HTML;
    downloadBtn.style.display = 'none';
    clearBtn.style.display = 'none';

    fileInput.value = '';
    textArea.value = '';
    fileName.style.display = 'none';
    removeFileBtn.style.display = 'none';
    document.querySelector('.file-types').style.display = 'block';
    analyzeBtn.disabled = true;

    setLastResult(null);
    setSentimentData(null);

    // Re-enable both input methods
    textArea.disabled = false;
    uploadArea.style.pointerEvents = 'auto';
    uploadArea.style.opacity = '1';

    // Restore upload section: hide collapse button and expand content
    uploadCollapseBtn.style.display = 'none';
    uploadContent.classList.remove('collapsed');
    uploadSection.classList.remove('collapsed');
    contentGrid.classList.remove('stacked');
    uploadCollapseBtn.textContent = 'Collapse';

    closeModal('clearModal');
  }

  window.closeClearModal = closeClearModal;
  window.confirmClear = confirmClear;

  // Clear results
  clearBtn.addEventListener('click', () => {
    openModal('clearModal');
  });

  // Add event listeners to analysis checkboxes for validation
  $('keynessCheck').addEventListener('change', checkInput);
  $('sentimentCheck').addEventListener('change', checkInput);

  // Export checkInput for use in keyness.js
  window.checkInput = checkInput;
}

// Utility functions
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function toggleCardContent(event) {
  // Find the closest result-card
  const card = event.currentTarget.closest('.result-card');
  const content = card.querySelector('.result-card-content');
  const toggle = card.querySelector('.result-card-toggle');

  // Toggle collapsed state
  content.classList.toggle('collapsed');
  toggle.classList.toggle('collapsed');
}

function toggleFormulas(event) {
  const toggle = event.currentTarget;
  const formulasSection = toggle.nextElementSibling;
  const icon = toggle.querySelector('.formulas-toggle-icon');

  // Toggle collapsed state
  formulasSection.classList.toggle('collapsed');
  icon.classList.toggle('rotated');
}

window.toggleCardContent = toggleCardContent;
window.toggleFormulas = toggleFormulas;

init();
