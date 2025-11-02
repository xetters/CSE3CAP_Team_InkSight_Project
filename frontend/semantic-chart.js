// Semantic Cluster Scatter Plot Visualization

// Simple hash function to generate position from word string
function hashWord(word) {
  let hash = 0;
  for (let i = 0; i < word.length; i++) {
    hash = ((hash << 5) - hash) + word.charCodeAt(i);
    hash = hash & hash;
  }
  return hash;
}

function initSemanticChart(chartId, data) {
  const canvas = document.getElementById(chartId);
  if (!canvas) return;

  const summary = data.semantic_summary;
  const clusters = summary.clusters || [];

  // Calculate positions based on word strings
  const datasets = clusters.map((cluster, clusterIndex) => {
    const points = cluster.words.map((word) => {
      const hash = hashWord(word);
      const x = (hash % 200) - 100;
      const y = ((hash >> 8) % 200) - 100;

      return { x, y, word };
    });

    const hue = (clusterIndex * 360) / clusters.length;
    const color = `hsl(${hue}, 70%, 60%)`;

    return {
      label: `Cluster ${clusterIndex + 1}`,
      data: points,
      backgroundColor: color,
      pointRadius: 0
    };
  });

  const ctx = canvas.getContext('2d');

  const chart = new Chart(ctx, {
    type: 'scatter',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      },
      scales: {
        x: { display: false },
        y: { display: false }
      }
    },
    plugins: [{
      afterDatasetsDraw: function(chart) {
        const ctx = chart.ctx;
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        chart.data.datasets.forEach((dataset, i) => {
          const meta = chart.getDatasetMeta(i);
          meta.data.forEach((point, index) => {
            const word = dataset.data[index].word;
            ctx.fillStyle = dataset.backgroundColor;
            ctx.fillText(word, point.x, point.y);
          });
        });
      }
    }]
  });
}

window.initSemanticChart = initSemanticChart;
