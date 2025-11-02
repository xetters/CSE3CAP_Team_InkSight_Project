// Keyness Statistics Module

// Load available corpora from API and populate dropdown
async function loadCorpora() {
  const corpusSelect = $('corpusSelect');
  try {
    const res = await fetch('/api/corpora');
    const corpora = await res.json();
    corpusSelect.innerHTML = '<option value="">Select a corpus...</option>' +
      corpora.map(c =>
        `<option value="${c.name}">${c.display_name} - ${c.description}</option>`
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

// Render keyness statistics with chart
function renderKeynessStats(data) {
  if (!data || !data.keywords) {
    return '<p>No keyness data available</p>';
  }

  const chartId = 'keynessChart-' + Date.now();

  // Calculate insights
  const overRep = data.keywords.filter(k => k.effect_size > 0).sort((a, b) => b.effect_size - a.effect_size);
  const underRep = data.keywords.filter(k => k.effect_size < 0).sort((a, b) => a.effect_size - b.effect_size);
  const top3Over = overRep.slice(0, 3);
  const top3Under = underRep.slice(0, 3);

  const veryHigh = data.keywords.filter(k => k.significance === "***").length;
  const high = data.keywords.filter(k => k.significance === "**").length;
  const moderate = data.keywords.filter(k => k.significance === "*").length;

  const html = `
    <div class="analysis-content">
      <p>Compares how often words appear in your text versus the reference corpus to identify which words make your writing distinctive.</p>

      <div class="info-box" style="background: #fafbfc; border: 1px solid #e8eaed;">
        <p><strong>Reference Corpus:</strong> ${data.corpus.display_name} - ${data.corpus.description}</p>
      </div>

      <div class="keyness-stats-grid">
        <div class="keyness-stat-item">
          <div class="keyness-stat-label">Total Words</div>
          <div class="keyness-stat-value">${data.total_words}</div>
        </div>
        <div class="keyness-stat-item">
          <div class="keyness-stat-label">Unique Words</div>
          <div class="keyness-stat-value">${data.unique_words}</div>
        </div>
        <div class="keyness-stat-item">
          <div class="keyness-stat-label">Significant Keywords</div>
          <div class="keyness-stat-value">${data.significant_keywords}</div>
        </div>
      </div>

      <div class="info-box" style="background: #fafbfc; border: 1px solid #e8eaed;">
        <p><strong>Most Distinctive Words:</strong><br>
        <strong>Over-represented in your text:</strong> ${top3Over.map(k => `"${k.word}"`).join(", ") || "None"}<br>
        <strong>Under-represented in your text:</strong> ${top3Under.map(k => `"${k.word}"`).join(", ") || "None"}</p>
      </div>

      <h4>Keyness Comparison</h4>

      <div class="info-box" style="background: #fef3c7; border-left-color: #f59e0b;">
        <p style="color: #92400e;">Showing top 15 most distinctive words from each category. Full keyword list includes ${data.significant_keywords} significant words.</p>
      </div>

      <div class="legend">
        <div class="legend-item">
          <div class="legend-color color-user"></div>
          <span>Your Keywords (Over-represented)</span>
        </div>
        <div class="legend-item">
          <div class="legend-color color-reference"></div>
          <span>Reference Keywords (Under-represented)</span>
        </div>
      </div>

      <div class="chart-container">
        <canvas id="${chartId}"></canvas>
      </div>

      <div class="info-box">
        <p><strong>Effect Size:</strong> Shows how much more or less frequently you used each word compared to the reference.</p>
      </div>

      <div class="info-box">
        <p><strong>Confidence Breakdown:</strong><br>
        ${veryHigh} words with *** (p&lt;0.001)<br>
        ${high} words with ** (p&lt;0.01)<br>
        ${moderate} words with * (p&lt;0.05)</p>
      </div>
    </div>
  `;

  // Store data for chart initialization
  setTimeout(() => {
    initKeynessChart(chartId, data);
  }, 0);

  return html;
}

// Initialize keyness chart
function initKeynessChart(chartId, data) {
  const negativeKeywords = data.keywords.filter(k => k.effect_size < 0);
  const positiveKeywords = data.keywords.filter(k => k.effect_size > 0).reverse();

  // Limit to top 15 from each side to prevent chart overflow
  const topNegative = negativeKeywords.slice(0, 15);
  const topPositive = positiveKeywords.slice(0, 15);
  const allKeywords = [...topNegative, ...topPositive];

  const labels = allKeywords.map(k => `${k.word} ${k.significance}`);
  const chartData = allKeywords.map(k => k.effect_size);

  const backgroundColors = allKeywords.map(k => {
    if (k.effect_size > 0) {
      const intensity = Math.min(k.effect_size / 5, 1);
      return `rgba(59, 130, 246, ${0.4 + intensity * 0.4})`;
    } else {
      const intensity = Math.min(Math.abs(k.effect_size) / 5, 1);
      return `rgba(34, 197, 94, ${0.4 + intensity * 0.4})`;
    }
  });

  const borderColors = allKeywords.map(k =>
    k.effect_size > 0 ? 'rgba(37, 99, 235, 1)' : 'rgba(22, 163, 74, 1)'
  );

  const canvas = document.getElementById(chartId);
  if (!canvas) {
    console.error('Canvas not found:', chartId);
    return;
  }

  // Set dynamic height based on number of keywords (30px per bar, max 30 keywords = 900px)
  const minHeightPerBar = 30;
  const dynamicHeight = Math.max(600, allKeywords.length * minHeightPerBar);
  canvas.parentElement.style.height = `${dynamicHeight}px`;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('Could not get canvas context');
    return;
  }

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Effect Size',
        data: chartData,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 10,
          right: 10
        }
      },
      plugins: {
        legend: { display: false },
        title: {
          display: false
        },
        tooltip: {
          enabled: false
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Effect Size', font: { size: 12 } },
          grid: { color: '#e5e7eb' }
        },
        y: {
          ticks: {
            font: { size: 11 }
          },
          grid: { display: false }
        }
      }
    }
  });
}

// Export for use in index.js
window.initKeynessStats = initKeynessStats;
window.analyzeKeyness = analyzeKeyness;
window.renderKeynessStats = renderKeynessStats;
window.initKeynessChart = initKeynessChart;
