#!/usr/bin/env python3
import json
import sys
from nltk import word_tokenize, FreqDist
from statsmodels.stats.proportion import proportion_effectsize as cohen_h
from scipy.stats import chi2_contingency
from corpora import CORPORA

def tokenize(text):
    """Takes text as argument. Splits into normalized words.

    Returns list of lowercase words (3+ letters only).
    """
    return [w.lower() for w in word_tokenize(text) if w.isalpha() and len(w) >= 3]

def test_frequency(user_count, corpus_count, user_total, corpus_total):
    """Takes word counts and totals. Calculates statistical difference.

    Uses chi-squared test. Returns chi-squared score.
    """
    if user_count <= 0 or corpus_count <= 0:
        return 0.0
    contingency_table = [
        [user_count, corpus_count],
        [user_total - user_count, corpus_total - corpus_count]
    ]
    return chi2_contingency(contingency_table)[0]

def freq_strength(user_count, corpus_count, user_total, corpus_total):
    """Takes word counts and totals. Calculates magnitude of difference.

    Uses Cohen's h. Returns effect size score.
    """
    user_prop = user_count / user_total if user_total > 0 else 0
    corpus_prop = corpus_count / corpus_total if corpus_total > 0 else 0
    return cohen_h(user_prop, corpus_prop)

def give_star_value(score):
    """Takes statistical score. Converts to star markers based on thresholds.

    Returns stars (*, **, ***).
    """
    if score >= 10.83:
        return '***'
    elif score >= 6.63:
        return '**'
    elif score >= 3.84:
        return '*'
    else:
        return ''

def analyze_keyness(text, corpus_name):
    """Takes text and corpus name. Identifies distinctive words.

    Compares frequencies. Returns dict with keywords and stats.
    """
    if corpus_name not in CORPORA:
        raise ValueError(f"Unknown corpus: {corpus_name}")

    # Tokenize user text
    user_tokens = tokenize(text)
    user_freq = FreqDist(user_tokens)
    user_total = len(user_tokens)

    # Load and tokenize corpus
    corpus_data = CORPORA[corpus_name]
    corpus_words = corpus_data['loader']()
    corpus_tokens = [
        w.lower() for w in corpus_words if w.isalpha() and len(w) >= 3
    ]
    corpus_freq = FreqDist(corpus_tokens)
    corpus_total = len(corpus_tokens)

    # Combine user words with top 500 corpus words
    common_words = set(word for word, _ in corpus_freq.most_common(500))
    all_words = set(user_freq.keys()) | common_words

    # Calculate keyness for each word
    keywords = []
    for word in all_words:
        user_count = user_freq.get(word, 0)
        corpus_count = corpus_freq.get(word, 0)

        # Apply smoothing to avoid zero-count errors
        score = test_frequency(
            user_count + 0.5, corpus_count + 0.5, user_total, corpus_total
        )

        # Only keep statistically significant keywords
        if score >= 3.84:
            effect = freq_strength(
                user_count + 0.5, corpus_count + 0.5, user_total, corpus_total
            )

            keywords.append({
                'word': word,
                'effect_size': round(effect, 4),
                'significance': give_star_value(score)
            })

    # Sort by strength (under-represented first, then over-represented)
    keywords.sort(key=lambda x: x['effect_size'])

    return {
        'total_words': user_total,
        'unique_words': len(user_freq),
        'significant_keywords': len(keywords),
        'corpus': {
            'name': corpus_name,
            'display_name': corpus_data['display_name'],
            'description': corpus_data['full_description'],
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
