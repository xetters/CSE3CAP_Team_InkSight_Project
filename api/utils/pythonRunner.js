const { spawn } = require('child_process');
const path = require('path');

function runPythonScript(scriptName, inputData) {
  return new Promise((resolve, reject) => {
    const py = spawn('python', [path.join(__dirname, scriptName)]);
    let out = '', err = '';
    py.stdout.on('data', d => out += d);
    py.stderr.on('data', d => err += d);
    py.on('close', code => {
      if (code !== 0) return reject(new Error(err || 'Python script failed'));
      try { resolve(JSON.parse(out)); }
      catch (e) { reject(new Error('Invalid JSON')); }
    });
    py.stdin.write(inputData);
    py.stdin.end();
  });
}

module.exports = { runPythonScript };
