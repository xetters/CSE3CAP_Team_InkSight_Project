# Keyness Implementation Details

## Tokenization Rules

**Filter criteria:**
- Minimum word length: 3 characters
- Only alphabetic characters (no numbers/punctuation)
- Convert to lowercase
- Apply to both user text and corpus

## Statistical Formulas

### Chi-Squared Test
**What it does:** Tests if a word appears significantly more/less than expected by chance.

Uses scipy's `chi2_contingency` function with a 2x2 contingency table:
```
[[user_word_freq, corpus_word_freq],
 [user_total - user_word_freq, corpus_total - corpus_word_freq]]
```

Returns p-value indicating statistical significance.

### Effect Size (Cohen's h)
**What it does:** Measures how different your word usage is - bigger numbers = more distinctive.

```
user_prop = a / c
corpus_prop = b / d
pooled_prop = (a + b) / (c + d)
pooled_sd = sqrt(pooled_prop × (1 - pooled_prop))
effect_size = (user_prop - corpus_prop) / pooled_sd
```

**Handle zeros:** If pooled_sd equals 0, return effect_size = 0.0

## Significance Mapping
**What it does:** Shows how confident we are that the difference isn't random luck.

| p-value | Marker |
|---------|--------|
| < 0.001 | *** |
| < 0.01 | ** |
| < 0.05 | * |
| ≥ 0.05 | exclude |

## Result Processing

**What makes the cut:**
- Only words that are statistically significant (p < 0.05)
- Corpus words are set to minimum 1 if not found (prevents math errors)

**How results are ordered:**
- Most distinctive words appear first
- Direction doesn't matter (over-represented and under-represented both count as distinctive)

## NLTK Requirements

**One-time download:** Run `nltk.download('punkt_tab')` and similar for each corpus ('brown', 'gutenberg', 'reuters', 'inaugural').

## Available Corpora

| name | display_name | description |
|------|-------------|-------------|
| brown | Brown Corpus | Balanced corpus of American English across multiple genres |
| gutenberg | Project Gutenberg | Classic literature from 19th and early 20th century |
| reuters | Reuters Corpus | Newswire articles from Reuters |
| inaugural | Inaugural Addresses Corpus | U.S. Presidential inaugural addresses |

## Pass Corpus to API

```javascript
formData.append('corpus', document.getElementById('corpusSelect').value);
```
