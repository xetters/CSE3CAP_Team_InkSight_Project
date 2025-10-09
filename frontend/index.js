// frontend/index.js
let lastResult = null;
let sentimentData = null;

const $ = (id) => document.getElementById(id);
const fileInput = $('file');
const textArea = $('text');
const analyzeBtn = $('analyzeBtn');
const resultsDiv = $('results');

function checkInput() {
  const hasFile = !!fileInput.files[0];
  const hasText = !!textArea.value.trim();
  
  analyzeBtn.disabled = !hasFile && !hasText;
  textArea.disabled = hasFile;
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

  $('sentimentBtn').addEventListener('click', async () => {
    const container = $('sentimentResults');
    if (container.innerHTML) {
      container.innerHTML = '';
    } else {
      if (!sentimentData) {
        container.innerHTML = '<p>Loading sentiment analysis...</p>';
        await fetchSentiment();
      }
      renderSentiment(container, sentimentData);
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

function renderSentiment(container, data) {
  if (!data) {
    container.innerHTML = '<p>No sentiment data available</p>';
    return;
  }

  const sentimentColor = {
    'positive': '#10b981',
    'negative': '#ef4444',
    'neutral': '#6b7280'
  };

  const color = sentimentColor[data.overall_sentiment] || '#6b7280';

  // Create chart
  const chartHTML = `
    <div style="margin: 20px 0;">
      <div style="display: flex; justify-content: space-around; align-items: flex-end; height: 200px; background: #f9fafb; border-radius: 8px; padding: 20px;">
        <div style="text-align: center; flex: 1;">
          <div style="background: #10b981; height: ${data.positive_ratio * 180}px; border-radius: 8px 8px 0 0; margin: 0 10px; min-height: 5px;"></div>
          <p style="margin-top: 8px; font-weight: 600; color: #10b981;">Positive</p>
          <p style="font-size: 0.875rem; color: #64748b;">${(data.positive_ratio * 100).toFixed(1)}%</p>
        </div>
        <div style="text-align: center; flex: 1;">
          <div style="background: #6b7280; height: ${data.neutral_ratio * 180}px; border-radius: 8px 8px 0 0; margin: 0 10px; min-height: 5px;"></div>
          <p style="margin-top: 8px; font-weight: 600; color: #6b7280;">Neutral</p>
          <p style="font-size: 0.875rem; color: #64748b;">${(data.neutral_ratio * 100).toFixed(1)}%</p>
        </div>
        <div style="text-align: center; flex: 1;">
          <div style="background: #ef4444; height: ${data.negative_ratio * 180}px; border-radius: 8px 8px 0 0; margin: 0 10px; min-height: 5px;"></div>
          <p style="margin-top: 8px; font-weight: 600; color: #ef4444;">Negative</p>
          <p style="font-size: 0.875rem; color: #64748b;">${(data.negative_ratio * 100).toFixed(1)}%</p>
        </div>
      </div>
    </div>
  `;

  const sentenceRows = data.sentences.slice(0, 10).map(s => {
    const sColor = sentimentColor[s.sentiment];
    return `
      <tr>
        <td style="text-align: left;">${s.text}</td>
        <td><span style="color: ${sColor}; font-weight: 600;">${s.sentiment}</span></td>
        <td>${s.score}</td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div style="text-align: center; margin: 16px 0;">
      <div style="display: inline-block; padding: 16px 24px; background: ${color}15; border: 2px solid ${color}; border-radius: 12px;">
        <p style="font-size: 0.875rem; color: #64748b; margin-bottom: 4px;">Overall Sentiment</p>
        <p style="font-size: 1.5rem; font-weight: 700; color: ${color}; text-transform: uppercase;">${data.overall_sentiment}</p>
        <p style="font-size: 1rem; color: #64748b; margin-top: 4px;">Score: ${data.sentiment_score}</p>
      </div>
    </div>

    ${chartHTML}

    <p style="margin: 16px 0;"><b>Total Sentences Analyzed:</b> ${data.sentence_count}</p>

    ${sentenceRows ? `
      <p style="margin: 16px 0; font-weight: 600;">Sample Sentences:</p>
      <table border="1" cellpadding="8" cellspacing="0">
        <thead>
          <tr>
            <th>Sentence</th>
            <th>Sentiment</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>${sentenceRows}</tbody>
      </table>
    ` : ''}
  `;
}

async function fetchSentiment() {
  const f = fileInput.files[0];
  const text = textArea.value.trim();
  
  if (!f && !text) return;

  const fd = new FormData();
  
  if (f) {
    fd.append('file', f);
  } else {
    const blob = new Blob([text], { type: 'text/plain' });
    fd.append('file', blob, 'input.txt');
  }

  try {
    const res = await fetch('/api/sentiment', { method: 'POST', body: fd });
    const data = await res.json();
    sentimentData = data;
  } catch (e) {
    console.error('Error fetching sentiment:', e);
    sentimentData = null;
  }
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
    const blob = new Blob([text], { type: 'text/plain' });
    fd.append('file', blob, 'input.txt');
  }

  try {
    const res = await fetch('/api/analyze-file', { method: 'POST', body: fd });
    const data = await res.json();
    lastResult = data;
    sentimentData = null; // Reset sentiment data
    renderContainers();
  } catch (e) {
    alert('Error analyzing file');
  }
});