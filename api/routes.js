// api/routes.js
const express = require('express');
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/analyze-file', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });

  const py = spawn('python', [path.join(__dirname, 'utils', 'analyze.py')]);
  let out = '';
  py.stdout.on('data', (d) => (out += d));
  py.on('close', () => {
    try { res.json(JSON.parse(out)); }
    catch { res.status(400).json({ error: 'Bad JSON' }); }
  });

  py.stdin.write(req.file.buffer.toString());
  py.stdin.end();
});

// New sentiment analysis endpoint
router.post('/sentiment', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });

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

  py.stdin.write(req.file.buffer.toString());
  py.stdin.end();
});

module.exports = router;