# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

InkSight is a text analysis web application that provides word frequency analysis and sentiment analysis for writers. The application uses a Node.js/Express backend with Python scripts for text processing, and a vanilla JavaScript frontend.

## Architecture

### Three-Layer Structure

1. **Frontend** (`frontend/` directory)
   - Static HTML/CSS/JS served by Express
   - `index.html` - Main UI with upload area, analysis options, and results display
   - `index.js` - Client-side logic for file uploads, API calls, and results rendering
   - `styles.css` - Complete styling for the application
   - `modals/` - HTML fragments for About, How It Works, Privacy, and Clear confirmation modals

2. **API Backend** (`api/` directory)
   - `app.js` - Express server entry point (port 3000)
   - `routes.js` - API route handlers for `/api/analyze-file` and `/api/sentiment`
   - Routes spawn Python subprocesses and pipe data via stdin/stdout

3. **Python Processing** (`api/utils/` directory)
   - `analyze.py` - Word frequency and text insight analysis
   - `sentiment.py` - Sentiment analysis (currently dummy implementation with random data)
   - Both scripts read from stdin and output JSON to stdout

### Data Flow

1. User uploads file (`.txt`, `.docx`, `.md`, or `.odt`) in frontend
2. Frontend sends multipart form data to `/api/analyze-file` or `/api/sentiment`
3. Express routes extract text from file buffer based on file type
4. Express routes spawn Python subprocess and pipe extracted text via stdin
5. Python script processes text and outputs JSON to stdout
6. Node.js parses JSON and returns to frontend
7. Frontend renders results in cards with visualizations

## Common Commands

### Installation

```bash
# Install root dependencies
npm install

# Install API dependencies
cd api
npm install
cd ..

# Install frontend dependencies (if needed)
cd frontend
npm install
cd ..
```

### Running the Application

```bash
# Start server (from root directory)
node api/app.js

# Or use package script
npm run start-api

# Open browser automatically
npm run open-browser

# Access at http://localhost:3000
```

### Testing

```bash
# Run smoketest (requires server to be running)
python smoketest.py

# The smoketest verifies:
# - Server is running
# - /api/analyze-file endpoint works
# - JSON response is valid
```

### Python Development

```bash
# Test Python scripts directly
echo "Sample text for analysis" | python api/utils/analyze.py
echo "This is positive. This is negative." | python api/utils/sentiment.py

# Install Python dependencies (when added to requirements.txt)
pip install -r api/utils/requirements.txt
```

## Key Implementation Details

### File Upload and Text Extraction

- Maximum file size: 5MB (enforced in `frontend/index.js:15`)
- Accepted file types: `.txt`, `.docx`, `.md`, `.odt`
- Files are processed in-memory using multer with `memoryStorage()`
- Text extraction happens in Node.js before sending to Python:
  - `.txt` and `.md` files: direct UTF-8 decoding
  - `.docx` files: extracted using `mammoth` library
  - `.odt` files: fallback to UTF-8 (full support requires additional library)
- Validation occurs on both frontend and backend

### Python Subprocess Communication

- Python scripts are spawned with `child_process.spawn()`
- Extracted text is written to stdin: `py.stdin.write(text)`
- JSON output is collected from stdout and parsed
- Error handling captures stderr for debugging

### Analysis Options

Users can enable/disable analysis types:
- **Word Analysis** (`keynessCheck`) - calls `/api/analyze-file`
- **Sentiment Analysis** (`sentimentCheck`) - calls `/api/sentiment`

Both analyses can run in parallel when both checkboxes are selected.

### Frontend State Management

- `lastResult` - stores word analysis data for download
- `sentimentData` - stores sentiment analysis data for download
- Results are cleared on page refresh or manual clear action

## Future Development Notes

### Sentiment Analysis Integration

The current sentiment implementation in `api/utils/sentiment.py` uses random data for testing. To integrate real NLP:

1. Replace the dummy implementation in `analyze_sentiment()` function (lines 31-51)
2. Add FastText or other NLP library to `api/utils/requirements.txt`
3. Load pre-trained model or train custom model
4. Update sentence scoring logic to use actual model predictions

### File Type Support

Currently `.txt`, `.md`, and `.docx` files are fully supported. To add full ODT support:

1. Install a Node.js ODT parsing library
2. Update the `extractText()` function in `api/routes.js` to handle ODT files
3. The function already has a placeholder for ODT support

## Project Structure Summary

```
api/
  app.js              # Express server entry point
  routes.js           # API endpoints with text extraction and Python subprocess spawning
  utils/
    analyze.py        # Word frequency and insight analysis
    sentiment.py      # Sentiment analysis (placeholder)
    requirements.txt  # Python dependencies

documentation/
  user-flow.md        # User interaction flow
  data-flow.md        # Technical data processing flow

frontend/
  index.html          # Main UI structure
  index.js            # Client-side application logic
  styles.css          # Complete styling
  modals/             # Modal dialog HTML fragments

fake-text-samples/    # Sample text files for testing
smoketest.py          # End-to-end API test
package.json          # Root npm scripts
