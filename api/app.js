const express = require('express');
const app = express();
const PORT = 3000;

// Test Route
app.get('/', (req, res) => {
  res.send('Server is working!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
