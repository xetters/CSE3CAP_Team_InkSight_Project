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

### Sentiment Analysis Endpoint
```
POST /api/sentiment
```
Accepts multipart form data with text file, extracts content, spawns Python subprocess for FastText-powered sentiment classification, returns JSON with emotional tone breakdown.

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
calculate_log_likelihood(observed_count, total_words, ref_count, ref_total)
# Implements G² log-likelihood ratio test for statistical significance
# Formula: 2 × Σ(observed × log(observed/expected))

analyze_keyness(text, reference_corpus)
# Comparative analysis identifying distinctive words vs reference corpus
# Returns ranked keywords with log-likelihood scores
```

**Algorithm:** Statistical comparison measuring word overuse/underuse relative to reference corpus. Higher scores indicate greater distinctiveness.

### Sentiment Analysis Module

**Key Functions:**

```python
load_sentiment_model()
# Loads pre-trained FastText binary model from api/models/

get_sentence_sentiment(sentence)
# Generates word embeddings and classifies sentiment
# Returns label (positive/negative/neutral) with confidence score

analyze_sentiment(text)
# Processes all sentences and aggregates sentiment statistics
# Returns overall sentiment, ratios, and per-sentence breakdown
```

**FastText Approach:**
1. Word embedding generation for semantic understanding
2. Average embedding computation per sentence
3. Multi-class classification with confidence scoring
4. Aggregation of sentence-level results into document-level metrics

## Dependencies

### Node.js Packages
- `express` - Web framework
- `multer` - Multipart form handling
- `mammoth` - DOCX text extraction

### Python Packages
- `nltk` - Tokenization and text processing
- `fasttext` - Word embeddings and sentiment classification
- `numpy` - Numerical operations for scoring

### NLTK Data Requirements
- `punkt` - Sentence tokenizer
- `stopwords` - Stop word corpus (optional filtering)

## Privacy & Security Architecture

**In-Memory Processing:**
- Zero disk writes throughout entire pipeline
- Isolated subprocess memory spaces
- Immediate buffer cleanup post-analysis

**Local Processing:**
- All NLP models loaded locally on server
- Zero external API dependencies
- Complete offline operation capability

**Zero Persistence:**
- No database storage
- No file system logging
- No content in server logs

## Performance Characteristics

**Processing Times (typical documents):**
- Word Analysis: 100-200ms
- Keyness Statistics: 200-500ms
- Sentiment Analysis: 300-800ms

**Model Footprint:**
- FastText sentiment model: 50-100MB
- NLTK data packages: 10-20MB
- Combined memory usage: <150MB

## Scalability Considerations

**Parallel Processing:** Multiple analyses execute concurrently when both checkboxes selected

**Subprocess Isolation:** Each request spawns independent Python processes preventing interference

**Memory Management:** Automatic garbage collection ensures stable memory usage under load

## Extension Points

**Planned Enhancements:**
- Multi-corpus keyness comparison
- Custom sentiment model training on literary texts
- Style detection and readability scoring
- Full ODT parsing library integration
- Reference corpus caching for improved keyness performance
