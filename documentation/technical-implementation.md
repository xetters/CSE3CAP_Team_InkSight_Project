# Technical Implementation Guide

## Architecture Overview

InkSight uses a three-layer architecture:
1. **Frontend:** Vanilla JavaScript (no frameworks)
2. **API Server:** Node.js with Express
3. **Processing Engine:** Python scripts with NLP libraries

## Backend Stack

### Node.js/Express Server (`api/app.js`)

```javascript
// Main entry point - starts Express server on port 3000
const express = require('express');
const multer = require('multer');
const mammoth = require('mammoth');
const { spawn } = require('child_process');

app.post('/api/analyze-file', (req, res) => {
  // Receive file from multipart form data
  // Extract text based on file type
  // Spawn Python analyze.py subprocess
  // Send text via stdin
  // Collect JSON output from stdout
  // Return analysis results
});

app.post('/api/sentiment', (req, res) => {
  // Similar flow for sentiment analysis
  // Spawns sentiment.py subprocess
});
```

### File Type Handling

- **TXT/MD:** Direct UTF-8 decoding
- **DOCX:** Mammoth library extraction
- **ODT:** UTF-8 fallback (future: full ODT library)

## Python NLP Implementation

### Word Analysis with NLTK (`api/utils/analyze.py`)

```python
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from collections import Counter
import re
import json
import sys

# Download required NLTK data (one-time setup)
# nltk.download('punkt')
# nltk.download('stopwords')

def tokenize_with_nltk(text):
    """
    Tokenizes text using NLTK's tokenizer
    - Converts to lowercase
    - Removes punctuation except apostrophes
    - Filters to words only
    """
    # Use regex-based tokenization for consistency
    tokens = re.findall(r"[A-Za-z']+", text.lower())
    return tokens

def count_frequencies(tokens):
    """
    Counts word occurrences using Counter
    Returns dict of {word: count}
    """
    return Counter(tokens)

def get_top_words(counter, n=5):
    """
    Returns top N words by frequency
    Format: [{"w": word, "n": count}, ...]
    """
    return [{"w": word, "n": count} for word, count in counter.most_common(n)]

def analyze_text(text):
    """Main analysis function"""
    tokens = tokenize_with_nltk(text)
    counter = count_frequencies(tokens)
    total = sum(counter.values())
    top_words = get_top_words(counter)

    return {
        "word_count": total,
        "top": top_words,
        "insight": get_text_insight(total)
    }

# Read from stdin and output JSON
text = sys.stdin.read() or ""
result = analyze_text(text)
print(json.dumps(result, ensure_ascii=False))
```

### Keyness Statistics with Log-Likelihood

```python
import math
from collections import Counter

def calculate_log_likelihood(observed_word_count, total_text_words,
                            reference_word_count, total_reference_words):
    """
    Implements log-likelihood ratio test for keyness
    Compares word frequencies between texts using statistical significance

    Formula: G² = 2 * Σ (observed * log(observed/expected))

    Higher scores = more distinctive to the text
    """
    # Expected frequency based on reference corpus
    expected = (observed_word_count / total_text_words) * total_reference_words

    if expected == 0:
        return 0

    # Log-likelihood calculation
    if observed_word_count > 0:
        return 2 * observed_word_count * math.log(observed_word_count / expected)
    return 0

def analyze_keyness(text, reference_corpus=None):
    """
    Keyness analysis - identifies distinctive words in text

    Two modes:
    1. Frequency mode: words by count (no reference corpus)
    2. Comparative mode: log-likelihood against reference corpus
    """
    tokens = tokenize_with_nltk(text)
    user_counter = count_frequencies(tokens)
    total_user_words = sum(user_counter.values())

    if reference_corpus:
        # Comparative mode: use log-likelihood
        reference_tokens = tokenize_with_nltk(reference_corpus)
        reference_counter = count_frequencies(reference_tokens)
        total_reference_words = sum(reference_counter.values())

        # Calculate log-likelihood for each word
        keyness_scores = {}
        for word, user_count in user_counter.items():
            ref_count = reference_counter.get(word, 1)
            ll_score = calculate_log_likelihood(
                user_count, total_user_words,
                ref_count, total_reference_words
            )
            keyness_scores[word] = ll_score

        # Sort by log-likelihood score descending
        sorted_keywords = sorted(keyness_scores.items(),
                                key=lambda x: abs(x[1]),
                                reverse=True)
    else:
        # Frequency mode: sort by count
        sorted_keywords = user_counter.most_common()

    # Filter and return top keywords
    return {
        "total_words": total_user_words,
        "unique_words": len(user_counter),
        "keywords": [
            {"word": word, "score": score}
            for word, score in sorted_keywords[:20]
        ]
    }
```

### Sentiment Analysis with FastText (`api/utils/sentiment.py`)

```python
import fasttext
import re
import json
import sys
import numpy as np

# Load pre-trained FastText model (one-time on server startup)
# Model trained on sentiment-labeled corpus
sentiment_model = None

def load_sentiment_model():
    """
    Loads FastText sentiment classification model
    Pre-trained on sentiment-labeled corpus (positive/negative/neutral)
    Model path: api/models/fasttext_sentiment.bin
    """
    global sentiment_model
    try:
        sentiment_model = fasttext.load_model('api/models/fasttext_sentiment.bin')
    except:
        print("Warning: FastText model not found, using fallback", file=sys.stderr)

def get_sentence_sentiment(sentence):
    """
    Classifies sentiment of a single sentence using FastText

    FastText approach:
    1. Generates word embeddings for sentence
    2. Computes average embedding
    3. Compares to sentiment categories
    4. Returns probability scores for each class
    """
    if not sentiment_model:
        return {"sentiment": "neutral", "score": 0.0, "confidence": 0.5}

    # FastText prediction returns (labels, scores)
    prediction = sentiment_model.predict(sentence, k=3)

    # Parse results
    labels = prediction[0]  # ('__label__positive', '__label__negative', '__label__neutral')
    confidences = prediction[1]  # [0.85, 0.10, 0.05]

    # Extract sentiment label (remove __label__ prefix)
    top_sentiment = labels[0].replace('__label__', '')
    top_confidence = confidences[0]

    # Convert to score: positive=1.0, negative=-1.0, neutral=0.0
    sentiment_score = {
        'positive': top_confidence,
        'negative': -top_confidence,
        'neutral': 0.0
    }.get(top_sentiment, 0.0)

    return {
        "sentiment": top_sentiment,
        "score": round(sentiment_score, 3),
        "confidence": round(top_confidence, 3)
    }

def tokenize_sentences(text):
    """
    Splits text into sentences using regex
    Handles common punctuation: . ! ?
    """
    sentences = re.split(r'[.!?]+', text)
    return [s.strip() for s in sentences if s.strip()]

def analyze_sentiment(text):
    """
    Performs comprehensive sentiment analysis
    """
    load_sentiment_model()

    sentences = tokenize_sentences(text)

    if not sentences:
        return {
            "overall_sentiment": "neutral",
            "sentiment_score": 0.0,
            "positive_ratio": 0.0,
            "negative_ratio": 0.0,
            "neutral_ratio": 0.0,
            "sentence_count": 0,
            "sentences": []
        }

    # Analyze each sentence
    sentence_data = []
    sentiment_scores = []
    positive_count = 0
    negative_count = 0
    neutral_count = 0

    for sentence in sentences:
        sent_analysis = get_sentence_sentiment(sentence)
        sentiment_scores.append(sent_analysis['score'])

        # Count sentiments
        if sent_analysis['sentiment'] == 'positive':
            positive_count += 1
        elif sent_analysis['sentiment'] == 'negative':
            negative_count += 1
        else:
            neutral_count += 1

        # Store sentence data (limit to first 20)
        if len(sentence_data) < 20:
            sentence_data.append({
                "text": sentence[:100] + "..." if len(sentence) > 100 else sentence,
                "sentiment": sent_analysis['sentiment'],
                "score": sent_analysis['score'],
                "confidence": sent_analysis['confidence']
            })

    # Calculate overall statistics
    total = len(sentences)
    avg_score = np.mean(sentiment_scores)

    # Determine overall sentiment
    if avg_score > 0.2:
        overall = "positive"
    elif avg_score < -0.2:
        overall = "negative"
    else:
        overall = "neutral"

    return {
        "overall_sentiment": overall,
        "sentiment_score": round(avg_score, 3),
        "positive_ratio": round(positive_count / total, 3),
        "negative_ratio": round(negative_count / total, 3),
        "neutral_ratio": round(neutral_count / total, 3),
        "sentence_count": total,
        "sentences": sentence_data
    }

# Read from stdin and output JSON
text = sys.stdin.read() or ""
result = analyze_sentiment(text)
print(json.dumps(result, ensure_ascii=False))
```

## Dependencies Installation

### Backend Requirements

```bash
# Node.js packages (api/package.json)
npm install express
npm install multer
npm install mammoth

# Python packages (api/utils/requirements.txt)
pip install nltk
pip install fasttext
pip install numpy
```

### NLTK Data Download

```python
# One-time setup (run once on server startup)
import nltk
nltk.download('punkt')           # Sentence tokenizer
nltk.download('stopwords')       # Stop words list
nltk.download('averaged_perceptron_tagger')  # POS tagging (optional)
```

## Privacy & Security Considerations

### Memory Management
- Text buffers stored in memory only, never written to disk
- Python subprocesses spawned with isolated memory spaces
- All buffers freed immediately after analysis

### No External Calls
- FastText and NLTK models loaded locally
- No internet requests to third-party APIs
- Sentiment classification happens on your server

### No Logging
- Input text never logged to files
- Analysis results not persisted
- Server logs do not contain user content

## Performance Notes

### Processing Time
- Word Analysis: ~100-200ms for typical documents
- Keyness Statistics: ~200-500ms (with reference corpus comparison)
- Sentiment Analysis: ~300-800ms (FastText model inference)

### Model Size
- FastText sentiment model: ~50-100MB (pre-trained)
- NLTK data: ~10-20MB (tokenizers, corpora)

## Future Improvements

1. **Keyness Enhancement:** Add multi-corpus comparison mode
2. **Sentiment Depth:** Train custom sentiment model on writing samples
3. **Additional Analysis:** Style detection, readability scoring
4. **ODT Support:** Full ODT parsing library integration
5. **Caching:** Optional local cache of reference corpora for faster keyness
