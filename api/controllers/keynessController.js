const { runPythonScript } = require('../utils/pythonRunner');

// Corpus metadata for keyness analysis (returned to frontend for corpus selector)
// Uses simple_description for dropdown display
const CORPORA = [
  { name: 'brown', display_name: 'Brown Corpus', description: 'Balanced American English' },
  { name: 'gutenberg', display_name: 'Project Gutenberg', description: 'Classic literature' },
  { name: 'reuters', display_name: 'Reuters Corpus', description: 'News articles' },
  { name: 'inaugural', display_name: 'Inaugural Addresses Corpus', description: 'Presidential speeches' },
];

// Return available corpora
exports.getAvailableCorpora = (req, res) => res.json(CORPORA);

// Analyze keyness via Python subprocess (sends {text, corpus} to stdin, receives JSON from stdout)
exports.analyzeKeyness = (text, corpus) => runPythonScript('keyness.py', JSON.stringify({ text, corpus }));
