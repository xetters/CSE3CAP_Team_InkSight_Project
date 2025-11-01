# Technical Implementation Guide

## Architecture Overview

InkSight implements a three-layer architecture ensuring separation of concerns and optimal performance:

1. **Frontend Layer** - Vanilla JavaScript with zero framework dependencies
2. **API Server Layer** - Node.js/Express handling routing and subprocess management
3. **Processing Engine** - Python scripts leveraging NLTK and FastText NLP libraries

## API Endpoints

### Word Analysis Endpoint
```
POST /api/analyze-file
```
Accepts multipart form data with text file, extracts content, spawns Python subprocess for word frequency analysis, returns JSON with top words and counts.

### Keyness Statistics Endpoint
```
POST /api/keyness-stats
```
Accepts multipart form data with text file and corpus parameter, spawns Python subprocess for chi-squared statistical analysis comparing text against reference corpus, returns JSON with distinctive keywords and effect sizes.

### Semantic Analysis Endpoint
```
POST /api/sentiment
```
Accepts multipart form data with text file, extracts content, spawns Python subprocess for FastText-powered semantic clustering, returns JSON with word clusters grouped by semantic similarity.

### Corpus Metadata Endpoint
```
GET /api/corpora
```
Returns available reference corpus options for keyness analysis with descriptions.

## Backend Implementation

### File Processing Pipeline

**Supported Formats:**
- **TXT/MD** - Direct UTF-8 buffer decoding
- **DOCX** - Mammoth library text extraction
- **ODT** - UTF-8 fallback with future full parsing support

**Process Flow:**
1. Multer receives file buffer in memory (no disk writes)
2. Format-specific text extraction based on file extension
3. Validation and sanitization before processing
4. Text piped to Python subprocess via stdin
5. JSON results collected from stdout
6. Memory buffers immediately freed

## Python NLP Processing

### Word Analysis Module

**Key Functions:**

```python
tokenize_with_nltk(text)
# Tokenizes text using regex pattern [A-Za-z']+ with lowercase normalization

count_frequencies(tokens)
# Builds frequency distribution using Counter object

get_top_words(counter, n=5)
# Returns top N words formatted as JSON objects
```

**Output Structure:** Word count, top word frequencies, text insights

### Keyness Statistics Module

**Key Functions:**

```python
test_frequency(word, user_freq, corpus_freq, user_total, corpus_total)
# Implements chi-squared statistical test using scipy's chi2_contingency
# Returns p-value for statistical significance

freq_strength(user_freq, corpus_freq, user_total, corpus_total)
# Calculates Cohen's h effect size
# Measures practical significance of word distinctiveness

give_star_value(p_value)
# Converts p-value to significance markers (*, **, ***)

analyze_keyness(text, corpus_name)
# Comparative analysis identifying distinctive words vs reference corpus
# Returns ranked keywords with effect sizes and significance markers
```

**Algorithm:** Chi-squared statistical test measuring word distinctiveness with Cohen's h effect size. Filters by statistical significance thresholds.

### Semantic Clustering Module

**Key Functions:**

```python
load_fasttext_model()
# Loads pre-trained FastText binary model from api/utils/models/

get_word_vector(word, model)
# Generates word embedding for given word using FastText model

cluster_words(text)
# Tokenizes text, generates embeddings, applies PCA and KMeans clustering
# Returns word clusters grouped by semantic similarity
```

**FastText + KMeans Approach:**
1. Word tokenization and unique word extraction
2. Word embedding generation using pre-trained FastText model (cc.en.100.bin)
3. PCA dimensionality reduction for computational efficiency
4. KMeans clustering (4 clusters) to group semantically related words
5. Returns clusters with grouped words showing semantic relationships

## Dependencies

### Node.js Packages
- `express` - Web framework
- `multer` - Multipart form handling
- `mammoth` - DOCX text extraction

### Python Packages (requirements.txt)
- `nltk` - Tokenization and text processing
- `statsmodels` - Statistical modeling for chi-squared tests
- `scipy` - Scientific computing for statistical functions

### Python Packages (optional - for semantic clustering)
- `fasttext-wheel` - Word embeddings and semantic analysis
- `scikit-learn` - KMeans clustering and PCA
- `numpy` - Numerical computing
- `gensim` - Topic modeling utilities


