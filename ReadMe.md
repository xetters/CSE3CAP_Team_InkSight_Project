# Three Muskateers - InkSight NLP Project

A text analysis and NLP web application that uses Node.js/Express for the backend and Python + FastText?* for text processing.

---

## Prerequisites

Ensure the following software dependencies are installed on your system:

- **Node.js**: v18 or higher
- **npm**: v9 or higher  
- **Python**: exactly v3.11.9 - this is to support FastTest model

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

## FastText pre-train model Installation 
   You can run these command or manually download at the link: https://fasttext.cc/docs/en/crawl-vectors.html

   **Download the model**
   First download the python package
   ```
   git clone https://github.com/facebookresearch/fastText.git
   cd fastText
   pip install .
   # or :
   python setup.py install
   ```
   and then
   ```
   python download_model.py en
   ```
   Move the model into the "models" folder

   This is from the FastText documentation website, you can find other models or check for yourself at the mentioned link
   Model used is cc.en.300.bin (English language)

   **Semantic cluster analysis and NLP processing libraries**
   ```
   pip install fasttext-wheel scikit-learn numpy gensim statsmodels nltk scipy
   ```
   **Adapt the model dimension**
   ```
   cd fastText
   python reduce_model.py [Path to the model] cc.en.300.bin [desired dimension]
   ```
   Example, to get vectors of dimension 100: 
   ```
   python reduce_model.py [Path to the model] cc.en.300.bin 100
   ```
   If you change the model dimension you also need to update the model new information in api/utils/semantic.py  

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

---

## Quick Setup (One Command)

If you have Node.js and Python installed, install all dependencies with a single command:

```bash
npm run full-setup
```

This command will:
- Install root dependencies
- Install API dependencies
- Install frontend dependencies
- Install Python dependencies
