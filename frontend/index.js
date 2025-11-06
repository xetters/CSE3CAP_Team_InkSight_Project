const $ = (id) => document.getElementById(id);

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const EMPTY_STATE_HTML = `
  <div class="empty-state">
    <div class="empty-state-icon">🔍</div>
    <h3>No Analysis Yet</h3>
    <p>Upload your writing to discover insights about your creative style</p>
  </div>
`;

async function init() {
  await window.loadModals();

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
  const navModals = { howItWorksLink: 'howItWorksModal', teamLink: 'teamModal' };
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
    const { files } = e.dataTransfer;
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

  function updateInputAvailability(hasFile, hasText) {
    textArea.disabled = hasFile;
    uploadArea.style.pointerEvents = hasText ? 'none' : 'auto';
    uploadArea.style.opacity = hasText ? '0.5' : '1';
  }

  function hasAnalysisSelected() {
    return $('keynessCheck').checked || $('sentimentCheck').checked || $('keynessStatsCheck').checked;
  }

  function updateAnalysisWarning(hasInput, hasAnalysis) {
    $('analysisWarning').style.display = hasInput && !hasAnalysis ? 'block' : 'none';
  }

  function isKeynessCorpusValid() {
    return !$('keynessStatsCheck').checked || $('corpusSelect').value.trim() !== '';
  }

  function checkInput() {
    const hasFile = !!fileInput.files[0];
    const hasText = textArea.value.trim().length > 0;
    const hasInput = hasFile || hasText;
    const hasAnalysis = hasAnalysisSelected();

    updateInputAvailability(hasFile, hasText);
    updateAnalysisWarning(hasInput, hasAnalysis);
    analyzeBtn.disabled = !hasInput || !hasAnalysis || !isKeynessCorpusValid();
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
      keynessStats: keynessStatsCheck.checked,
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
          body: createFormData(),
        });

        if (!res.ok) throw new Error('Word analysis failed');
        wordData = await res.json();
        setLastResult(wordData);
      }

      if (options.sentiment) {
        const sentRes = await fetch('/api/sentiment', {
          method: 'POST',
          body: createFormData(),
        });

        if (!sentRes.ok) throw new Error('Semantic analysis failed');

        sentData = await sentRes.json();
        setSentimentData(sentData);
      }

      if (options.keynessStats) {
        keynessData = await analyzeKeyness(createFormData(), $('corpusSelect').value);
        setKeynessData(keynessData);
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
  function createResultCard(title, section, content) {
    return `<div class="result-card">
      <div class="result-card-header" onclick="toggleCardContent(event)">
        <h3>${title}</h3>
        <div class="card-actions">
          <button class="section-download btn-light" onclick="event.stopPropagation(); downloadSection('${section}')">Download</button>
          <div class="result-card-toggle">▼</div>
        </div>
      </div>
      <div class="result-card-content">${content}</div>
    </div>`;
  }

  function displayResults(wordData, sentData, keynessData, options) {
    downloadBtn.style.display = 'inline-block';
    clearBtn.style.display = 'inline-block';

    const cards = [
      options.keyness && wordData && createResultCard('Word Analysis - general insights', 'word-analysis', renderWordAnalysis(wordData)),
      options.keynessStats && keynessData && createResultCard('Keyness Statistics', 'keyness-stats', renderKeynessStats(keynessData)),
      options.sentiment && sentData && createResultCard('Semantic Analysis', 'sentiment', renderSentiment(sentData)),
    ].filter(Boolean);

    resultsDiv.innerHTML = cards.length ? cards.join('') : '<div class="empty-state"><p>No results to display. Please select at least one analysis option.</p></div>';
  }

  function renderWordAnalysis(data) {
    const rows = (data.top || [])
      .map((w) => `<tr><td>${escapeHtml(w.w)}</td><td>${w.n}</td></tr>`)
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
    if (!data || !data.semantic_summary) {
      return '<p>No semantic data available.</p>';
    }

    const summary = data.semantic_summary;
    const topClusters = summary.top_clusters || [];
    const chartId = `semanticChart-${Date.now()}`;

    function formatClusterName(cluster) {
      if (cluster.theme) return cluster.theme;
      if (cluster.words && cluster.words.length > 0) return cluster.words[0];
      return cluster.label || 'Unnamed Cluster';
    }

    let html = `
      <div class="analysis-content">
        <h3>Semantic Cluster Analysis</h3>

        <p><strong>Total Words:</strong> ${summary.total_words}</p>
        <p><strong>Total Word Clusters Detected:</strong> ${summary.total_clusters}</p>

        <h4>Cluster Visualization</h4>
        <div class="chart-container chart-height">
          <canvas id="${chartId}"></canvas>
        </div>

        <h4 class="semantic-heading">The writing has a strong affinity for...</h4>
        <ul class="semantic-list">
    `;

    topClusters.forEach((cluster) => {
      html += `
        <li>
          <strong>${formatClusterName(cluster)}</strong> — ${cluster.word_count ?? cluster.words.length} related words
        </li>
      `;
    });

    html += `
        </ul>

        <div class="semantic-note">
          You can see more details in by downloading the full report.
        </div>
      </div>
    `;

    // Initialize chart after DOM update
    setTimeout(() => {
      if (window.initSemanticChart) {
        initSemanticChart(chartId, data);
      }
    }, 0);

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

init();
