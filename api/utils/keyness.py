#!/usr/bin/env python3
import json
import sys
import math
from nltk import word_tokenize, FreqDist
from nltk.corpus import brown, gutenberg, reuters, inaugural

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
    """Calculate log-likelihood G² score"""
    if a == 0 or b == 0:
        return 0.0
    E1 = c * (a + b) / (c + d)
    E2 = d * (a + b) / (c + d)
    if E1 == 0 or E2 == 0:
        return 0.0
    return 2 * ((a * math.log(a / E1)) + (b * math.log(b / E2)))

def effect_size(a, b, c, d):
    """Calculate Cohen's h effect size"""
    user_prop = a / c if c > 0 else 0
    corpus_prop = b / d if d > 0 else 0
    pooled_prop = (a + b) / (c + d)
    pooled_sd = math.sqrt(pooled_prop * (1 - pooled_prop))
    return (user_prop - corpus_prop) / pooled_sd if pooled_sd > 0 else 0.0

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

    # Calculate keyness for each word
    keywords = []
    for word, user_count in user_freq.items():
        corpus_count = max(corpus_freq.get(word, 0), 1)
        ll = log_likelihood(user_count, corpus_count, user_total, corpus_total)

        if ll >= 3.84:  # Only significant keywords (p < 0.05)
            es = effect_size(user_count, corpus_count, user_total, corpus_total)
            norm_freq = (corpus_count / corpus_total) * user_total

            keywords.append({
                'word': word,
                'effect_size': round(es, 4),
                'll_score': round(ll, 4),
                'significance': significance(ll),
                'user_freq': user_count,
                'corpus_freq': round(norm_freq, 2)
            })

    keywords.sort(key=lambda x: abs(x['effect_size']), reverse=True)

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
