const { spawn } = require('child_process');
const path = require('path');

// Corpus metadata for keyness analysis (returned to frontend for corpus selector)
// Uses simple_description for dropdown display
const CORPORA = [
  { name: 'brown', display_name: 'Brown Corpus', description: 'Balanced American English' },
  { name: 'gutenberg', display_name: 'Project Gutenberg', description: 'Classic literature' },
  { name: 'reuters', display_name: 'Reuters Corpus', description: 'News articles' },
  { name: 'inaugural', display_name: 'Inaugural Addresses Corpus', description: 'Presidential speeches' }
];

// Return available corpora
exports.getAvailableCorpora = (req, res) => res.json(CORPORA);

// Analyze keyness via Python subprocess (sends {text, corpus} to stdin, receives JSON from stdout)
exports.analyzeKeyness = (text, corpus) => {
  return new Promise((resolve, reject) => {
    const py = spawn('python', [path.join(__dirname, '..', 'utils', 'keyness.py')]);
    let out = '';
    let err = '';
    py.stdout.on('data', d => out += d);
    py.stderr.on('data', d => err += d);
    py.on('close', () => {
      if (err) {
        console.error('Python stderr:', err);
        reject(new Error(`Python error: ${err}`));
        return;
      }
      try { resolve(JSON.parse(out)); }
      catch (e) { reject(new Error(`Bad JSON: ${out}`)); }
    });
    py.stdin.write(JSON.stringify({ text, corpus }));
    py.stdin.end();
  });
};
