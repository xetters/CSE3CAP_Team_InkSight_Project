const express = require('express');
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const mammoth = require('mammoth');
const keynessController = require('./controllers/keynessController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Routes
// POST /api/analyze-file - Word frequency analysis
router.post('/analyze-file', upload.single('file'), handleAnalyzeFile);

// POST /api/sentiment - Sentiment analysis via FastText
router.post('/sentiment', upload.single('file'), handleSentiment);

// GET /api/corpora - Available reference corpora for keyness analysis
router.get('/corpora', keynessController.getAvailableCorpora);

// POST /api/keyness-stats - Keyness statistics (requires corpus param in body)
router.post('/keyness-stats', upload.single('file'), handleKeynessStats);

// Handlers
// Extract text from uploaded file buffer (TXT, DOCX, MD, ODT)
async function extractText(file) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.txt' || ext === '.md') return file.buffer.toString('utf-8');
  if (ext === '.docx') return (await mammoth.extractRawText({ buffer: file.buffer })).value;
  if (ext === '.odt') return file.buffer.toString('utf-8'); // ODT needs additional library
  throw new Error('Unsupported file type');
}

// Word frequency analysis via Python subprocess
async function handleAnalyzeFile(req, res) {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  try {
    const text = await extractText(req.file);
    const py = spawn('python', [path.join(__dirname, 'utils', 'analyze.py')]);
    let out = '';
    py.stdout.on('data', (d) => (out += d));
    py.on('close', () => {
      try { res.json(JSON.parse(out)); }
      catch { res.status(400).json({ error: 'Bad JSON' }); }
    });
    py.stdin.write(text);
    py.stdin.end();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Sentiment analysis via Python subprocess
async function handleSentiment(req, res) {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  try {
    const text = await extractText(req.file);
    const py = spawn('python', [path.join(__dirname, 'utils', 'sentiment.py')]);

    let out = '', err = '';
    py.stdout.on('data', (d) => (out += d));
    py.stderr.on('data', (d) => (err += d));

    py.on('close', (code) => {
      if (code !== 0) {
        console.error('Python error:', err);
        return res.status(500).json({ error: 'Sentiment analysis failed' });
      }
      try { 
        const result = JSON.parse(out);
        return res.json({
        overall_sentiment: "semantic_clusters",
        semantic_summary: {
          total_words: result.total_words, 
          total_clusters: result.total_clusters, //number of clusters
          top_clusters: result.top_clusters, //top 4 clusters     
          clusters: result.clusters // all clusters (which can be avaliable for the download function)
        }
        });
    
      } catch { res.status(400).json({ error: 'Bad JSON from sentiment analysis' }); }
    });
    py.stdin.write(text);
    py.stdin.end();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Keyness statistics via controller
async function handleKeynessStats(req, res) {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  try {
    const text = await extractText(req.file);
    const result = await keynessController.analyzeKeyness(text, req.body.corpus || 'brown');
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports = router;
