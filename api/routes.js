const express = require('express');
const multer = require('multer');
const path = require('path');
const mammoth = require('mammoth');
const keynessController = require('./controllers/keynessController');
const { runPythonScript } = require('./utils/pythonRunner');

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
    const result = await runPythonScript('analyze.py', text);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Sentiment analysis via Python subprocess
async function handleSentiment(req, res) {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  try {
    const text = await extractText(req.file);
    const result = await runPythonScript('sentiment.py', text);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
