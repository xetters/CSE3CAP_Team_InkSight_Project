// Keyness Statistics Module

// Load available corpora from API and populate dropdown
async function loadCorpora() {
  const corpusSelect = $('corpusSelect');
  try {
    const res = await fetch('/api/corpora');
    const corpora = await res.json();
    corpusSelect.innerHTML = '<option value="">Select a corpus...</option>' +
      corpora.map(c =>
        `<option value="${c.name}" title="${c.description}">${c.display_name}</option>`
      ).join('');
  } catch (err) {
    corpusSelect.innerHTML = '<option value="">Error loading corpora</option>';
  }
}

// Setup keyness statistics checkbox and corpus selector
function initKeynessStats() {
  const keynessStatsCheck = $('keynessStatsCheck');
  const corpusSelector = $('corpusSelector');
  const corpusSelect = $('corpusSelect');

  // Show/hide corpus selector based on checkbox
  keynessStatsCheck.addEventListener('change', () => {
    corpusSelector.style.display = keynessStatsCheck.checked ? 'block' : 'none';
    // Trigger input validation when keyness checkbox changes
    if (window.checkInput) window.checkInput();
  });

  // Trigger validation when corpus selection changes
  corpusSelect.addEventListener('change', () => {
    if (window.checkInput) window.checkInput();
  });

  loadCorpora();
}

// Call keyness API with file and corpus
async function analyzeKeyness(formData, corpus) {
  if (!corpus || corpus.trim() === '') {
    throw new Error('Please select a reference corpus for keyness analysis');
  }
  formData.append('corpus', corpus);
  const res = await fetch('/api/keyness-stats', {
    method: 'POST',
    body: formData
  });
  if (res.ok) {
    return await res.json();
  }
  throw new Error('Keyness analysis failed');
}

// Basic render function (boring format for testing)
function renderKeynessStats(data) {
  if (!data || !data.keywords) {
    return '<p>No keyness data available</p>';
  }

  const keywordsList = data.keywords
    .slice(0, 20)
    .map(k => `<li><strong>${k.word}</strong> - Your Freq: ${k.user_freq}, Corpus Freq: ${k.corpus_freq}, Effect: ${k.effect_size}, LL: ${k.ll_score}, Sig: ${k.significance}</li>`)
    .join('');

  return `
    <div class="analysis-content">
      <p><strong>Corpus:</strong> ${data.corpus.display_name}</p>
      <p><strong>Total Words:</strong> ${data.total_words}</p>
      <p><strong>Unique Words:</strong> ${data.unique_words}</p>
      <p><strong>Significant Keywords:</strong> ${data.significant_keywords}</p>
      <h4>Keywords:</h4>
      <ul>${keywordsList}</ul>
    </div>
  `;
}

// Export for use in index.js
window.initKeynessStats = initKeynessStats;
window.analyzeKeyness = analyzeKeyness;
window.renderKeynessStats = renderKeynessStats;
