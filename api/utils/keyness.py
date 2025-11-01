#!/usr/bin/env python3
import json
import sys
from nltk import word_tokenize, FreqDist
from nltk.corpus import brown, gutenberg, reuters, inaugural
from statsmodels.stats.proportion import proportion_effectsize as cohen_h
from scipy.stats import chi2_contingency

# Corpus metadata: (display_name, description, loader_function)
CORPORA = {
    'brown': ('Brown Corpus', 'Balanced corpus of American English across multiple genres', brown.words),
    'gutenberg': ('Project Gutenberg', 'Classic literature from 19th and early 20th century', gutenberg.words),
    'reuters': ('Reuters Corpus', 'Newswire articles from Reuters', reuters.words),
    'inaugural': ('Inaugural Addresses Corpus', 'U.S. Presidential inaugural addresses', inaugural.words)
}

def tokenize(text):
    """Tokenize: lowercase, alphabetic only, min 3 chars"""
    return [w.lower() for w in word_tokenize(text) if w.isalpha() and len(w) >= 3]

def log_likelihood(a, b, c, d):
    """Calculate chi-squared score using scipy chi2_contingency"""
    if a <= 0 or b <= 0:
        return 0.0
    return chi2_contingency([[a, b], [c - a, d - b]])[0]

def effect_size(a, b, c, d):
    """Calculate Cohen's h effect size using statsmodels"""
    user_prop = a / c if c > 0 else 0
    corpus_prop = b / d if d > 0 else 0
    return cohen_h(user_prop, corpus_prop)

def significance(ll):
    """Map LL score to significance marker"""
    return '***' if ll >= 10.83 else '**' if ll >= 6.63 else '*' if ll >= 3.84 else ''

def analyze_keyness(text, corpus_name):
    """Perform keyness analysis comparing user text to NLTK corpus"""
    if corpus_name not in CORPORA:
        raise ValueError(f"Unknown corpus: {corpus_name}")

    # Tokenize user text
    user_tokens = tokenize(text)
    user_freq = FreqDist(user_tokens)
    user_total = len(user_tokens)

    # Load and tokenize corpus
    display_name, description, loader = CORPORA[corpus_name]
    corpus_tokens = [w.lower() for w in loader() if w.isalpha() and len(w) >= 3]
    corpus_freq = FreqDist(corpus_tokens)
    corpus_total = len(corpus_tokens)

    # Create set of words to analyze:
    # - All words from user text (for over-represented keywords)
    # - Top 500 most frequent corpus words (for under-represented keywords)
    top_corpus_words = set(word for word, _ in corpus_freq.most_common(500))
    all_words = set(user_freq.keys()) | top_corpus_words

    # Calculate keyness for each word
    keywords = []
    for word in all_words:
        user_count = user_freq.get(word, 0)
        corpus_count = corpus_freq.get(word, 0)

        # Skip if word doesn't appear in either (shouldn't happen but just in case)
        if user_count == 0 and corpus_count == 0:
            continue

        # Calculate log-likelihood with smoothing for zero counts
        a = user_count + 0.5
        b = corpus_count + 0.5
        ll = log_likelihood(a, b, user_total, corpus_total)

        if ll >= 3.84:  # Only significant keywords (p < 0.05)
            es = effect_size(a, b, user_total, corpus_total)
            norm_freq = (corpus_count / corpus_total) * user_total

            keywords.append({
                'word': word,
                'effect_size': round(es, 4),
                'll_score': round(ll, 4),
                'significance': significance(ll),
                'user_freq': user_count,
                'corpus_freq': round(norm_freq, 2)
            })

    # Sort by effect size (negative first for under-represented, then positive for over-represented)
    keywords.sort(key=lambda x: x['effect_size'])

    return {
        'total_words': user_total,
        'unique_words': len(user_freq),
        'significant_keywords': len(keywords),
        'corpus': {
            'name': corpus_name,
            'display_name': display_name,
            'description': description,
            'total_words': corpus_total
        },
        'keywords': keywords
    }

if __name__ == '__main__':
    try:
        data = json.loads(sys.stdin.read())
        result = analyze_keyness(data.get('text', ''), data.get('corpus', 'brown'))
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)