const { spawn } = require('child_process');
const path = require('path');

// Corpus metadata for keyness analysis (returned to frontend for corpus selector)
const CORPORA = [
  { name: 'brown', display_name: 'Brown Corpus', description: 'Balanced corpus of American English across multiple genres' },
  { name: 'gutenberg', display_name: 'Project Gutenberg', description: 'Classic literature from 19th and early 20th century' },
  { name: 'reuters', display_name: 'Reuters Corpus', description: 'Newswire articles from Reuters' },
  { name: 'inaugural', display_name: 'Inaugural Addresses Corpus', description: 'U.S. Presidential inaugural addresses' }
];

// Return available corpora
exports.getAvailableCorpora = (req, res) => res.json(CORPORA);

// Analyze keyness via Python subprocess (sends {text, corpus} to stdin, receives JSON from stdout)
exports.analyzeKeyness = (text, corpus) => {
  return new Promise((resolve, reject) => {
    const py = spawn('python', [path.join(__dirname, '..', 'utils', 'keyness.py')]);
    let out = '';
    py.stdout.on('data', d => out += d);
    py.on('close', () => {
      try { resolve(JSON.parse(out)); }
      catch (e) { reject(new Error('Bad JSON')); }
    });
    py.stdin.write(JSON.stringify({ text, corpus }));
    py.stdin.end();
  });
};
