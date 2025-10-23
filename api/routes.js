// api/routes.js
const express = require('express');
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const mammoth = require('mammoth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

async function extractText(file) {
  const ext = path.extname(file.originalname).toLowerCase();

  if (ext === '.txt' || ext === '.md') {
    return file.buffer.toString('utf-8');
  }

  if (ext === '.docx') {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value;
  }

  if (ext === '.odt') {
    // ODT support requires additional library - fallback to UTF-8 for now
    return file.buffer.toString('utf-8');
  }

  throw new Error('Unsupported file type');
}

router.post('/analyze-file', upload.single('file'), async (req, res) => {
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
});

// New sentiment analysis endpoint
router.post('/sentiment', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });

  try {
    const text = await extractText(req.file);

    const py = spawn('python', [path.join(__dirname, 'utils', 'sentiment.py')]);
    let out = '';
    let err = '';

    py.stdout.on('data', (d) => (out += d));
    py.stderr.on('data', (d) => (err += d));

    py.on('close', (code) => {
      if (code !== 0) {
        console.error('Python error:', err);
        return res.status(500).json({ error: 'Sentiment analysis failed' });
      }
      try {
        res.json(JSON.parse(out));
      }
      catch {
        res.status(400).json({ error: 'Bad JSON from sentiment analysis' });
      }
    });

    py.stdin.write(text);
    py.stdin.end();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add GET /api/corpora route → call keynessController.getAvailableCorpora()
// Add POST /api/keyness-stats route → call keynessController.analyzeKeyness()
// Import keynessController

module.exports = router;