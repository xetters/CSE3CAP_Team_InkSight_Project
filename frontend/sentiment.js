// semantic functions

// Call semantic API
async function analyzeSemantic(formData) {
  const res = await fetch('/api/sentiment', {
    method: 'POST',
    body: formData
  });

  if (!res.ok) throw new Error('Semantic analysis failed');

  return await res.json();
}

// Render semantic cluster results
function renderSemantic(data) {
  if (!data.semantic_summary) {
    return `<p>No semantic data returned</p>`;
  }

  const summary = data.semantic_summary;

  let html = `
  <div class="analysis-content">

    <div class="info-box">
      <h3>Semantic Clusters</h3>
      <p><strong>Total Words:</strong> ${summary.total_words}</p>
      <p><strong>Total Clusters:</strong> ${summary.total_clusters}</p>
    </div>

    <h4>Top Clusters</h4>
    <ul class="cluster-list">
      ${summary.top_clusters.map(cluster => `
        <li class="cluster-item">
          <strong>${cluster.label}</strong><br>
          ${cluster.words.join(", ")}
        </li>
      `).join("")}
    </ul>
  </div>`;

  return html;
}

// Export for main index.js
window.analyzeSemantic = analyzeSemantic;
window.renderSemantic = renderSemantic;