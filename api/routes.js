// api/routes.js
const express = require('express');
const multer = require('multer');
// spawn is for python
const { spawn } = require('child_process');
const path = require('path');

const router = express.Router();
// multer for file processing
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

module.exports = router;

// things not included:
// - file type and size check