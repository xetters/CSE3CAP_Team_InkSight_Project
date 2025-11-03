const express = require('express');
const path = require('path');

const app = express();
const routes = require('./routes');

const PORT = 3000;

// Serve static files from the 'frontend' folder
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Serve static files from the 'media' folder
app.use('/media', express.static(path.join(__dirname, '..', 'media')));

// Mount API routes
app.use('/api', routes);

// Start server (address hardcoded)
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
