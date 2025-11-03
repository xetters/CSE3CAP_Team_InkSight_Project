# InkSight

**"Tell me something I don't know"**
A Privacy-Focused NLP Tool for Creative Writers

InkSight is a text analysis tool that helps you understand your writing through word frequency analysis, keyness statistics, and semantic clustering. All processing happens locally on your computer - no cloud uploads, no external servers, no data storage.

---

## Description

InkSight provides data-based feedback on themes, word choice, and writing habits using local NLP processing with NLTK and FastText libraries. Upload a document (.txt, .docx, or .md up to 5 MB) and get instant insights about your distinctive vocabulary and hidden patterns.

**Key Features:**
- **Word Frequency Analysis** - Identify overused words and vocabulary patterns
- **Keyness Statistics** - Compare your writing to reference corpora (news, literature, speeches)
- **Semantic Clustering** - Discover related words and themes using pretrained AI models
- **Privacy-First** - All processing local, in-memory only, zero logging
- **Offline Capable** - NLTK and FastText models run locally

---

## Installation

**Prerequisites:**
- Node.js v18+
- npm v9+
- Python v3.11.9
- 2 GB free disk space

**Quick Setup (Recommended):**
```bash
npm run full-setup-with-fasttext
```

**Manual Setup:**
```bash
# Install Node.js dependencies
npm install
cd api && npm install && cd ..

# Install Python dependencies
pip install -r api/utils/requirements.txt

# Download NLTK data
python api/utils/setup_nltk.py

# Download FastText model (for Semantic Clustering)
git clone https://github.com/facebookresearch/fastText.git
cd fastText
pip install .
python download_model.py en
# Move cc.en.300.bin to models/ directory in project root
```

**Alternative FastText Download:**
Manually download from https://dl.fbaipublicfiles.com/fasttext/vectors-crawl/cc.en.300.bin.gz and extract to `models/` directory.

---

## Backend testing
First go to the directory
```
cd api/tests
```
The sample is located in the test_data folder, keep the test_text.txt name intact and change the content to your liking

**To Run Backend Function Test**
Dependencies:
```
numpy
scikit-learn
scipy
statsmodels
nltk
```
To run the test, use the command of the system you want to test
```
python test_analyze.py
python test_semantic.py
python test_keyness.py 
```


## How to Use

**1. Start the server:**
```bash
npm run start-api
```

**2. Open your browser:**
```
http://localhost:3000
```

**3. Upload a file:**
Click the upload area or drag and drop a file (.txt, .docx, or .md, max 5 MB)

**4. Select analysis types:**
- **Word Analysis** - Displays word frequency and basic statistics
- **Keyness Statistics** - Identifies distinctive words (select a reference corpus)
- **Semantic Analysis** - Groups related words by meaning

**5. Click "Analyze Text"**

**6. Download results:**
Click "Download All" to export a complete HTML report, or download individual sections

**7. Clear data:**
Click "Clear" or refresh the page to remove results

---

## Credits

**Team Three Musketeers**
La Trobe CSE3CAP Project

- Micah Crossett (18122181)
- Montaka Khan (21472447)
- Quan Ngoc Minh Vuong (22495054)

**Built with:**
- Node.js/Express backend
- Python NLP processing (NLTK, FastText)
- Vanilla JavaScript frontend