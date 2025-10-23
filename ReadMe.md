# Three Muskateers - InkSight NLP Project

A text analysis and NLP web application that uses Node.js/Express for the backend and Python + FastText?* for text processing.

---

## Prerequisites

Ensure the following software dependencies are installed on your system:

- **Node.js**: v18 or higher
- **npm**: v9 or higher  
- **Python**: v3.9 or higher

You can verify your installations by running:
```bash
node --version
npm --version
python --version
```

---

## Installation

1. **Clone or download** this repository to your local machine

2. **Install Node.js dependencies** in the root directory:
   ```bash
   npm install
   ```

3. **Install dependencies** in the `api` subfolder:
   ```bash
   cd api
   npm install
   cd ..
   ```

4. **Install dependencies** in the `frontend` subfolder (if applicable):
   ```bash
   cd frontend
   npm install
   cd ..
   ```

---

## Running the Application

1. **Start the server** from the root directory:
   ```bash
   node api/app.js
   ```

2. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

3. **Upload a file** (`.txt`, `.docx`, `.md`, or `.odt`) to analyze:
   - Word frequency and insights
   - Sentiment analysis (dummy implementation - replace with FastText later)
   - DOCX files are fully supported with text extraction
   - ODT support is partial (requires additional library)

---

## Notes

- The application runs on **port 3000** by default
- Python analysis is performed via a spawned subprocess, so Python must be accessible in your system PATH
- File uploads are handled in-memory using `multer`
- Text extraction from DOCX files is handled by the `mammoth` library
- **Sentiment analysis**: Currently uses random data for testing. To integrate FastText/NLP, replace the `analyze_sentiment()` function in `api/utils/sentiment.py`