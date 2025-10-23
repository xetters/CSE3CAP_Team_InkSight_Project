# Keyness Implementation Details

## Tokenization Rules

**Filter criteria:**
- Minimum word length: 3 characters
- Only alphabetic characters (no numbers/punctuation)
- Convert to lowercase
- Apply to both user text and corpus

## Statistical Formulas

### Log-Likelihood (G²)
**What it does:** Tests if a word appears significantly more/less than expected by chance.

```
E1 = c × (a + b) / (c + d)
E2 = d × (a + b) / (c + d)
LL = 2 × ((a × ln(a/E1)) + (b × ln(b/E2)))

Where:
a = word count in user text
b = word count in corpus
c = total words in user text
d = total words in corpus
```

**Handle zeros:** If a, b, E1, or E2 equals 0, return LL = 0.0

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

### Corpus Frequency Normalization
**What it does:** Scales corpus frequencies to match your text size for fair comparison.

```
normalized_freq = (corpus_count / corpus_total) × user_total
```

## Significance Mapping
**What it does:** Shows how confident we are that the difference isn't random luck.

| LL Score | p-value | Marker |
|----------|---------|--------|
| ≥ 10.83 | < 0.001 | *** |
| ≥ 6.63 | < 0.01 | ** |
| ≥ 3.84 | < 0.05 | * |
| < 3.84 | Not sig | exclude |

## Result Processing

**What makes the cut:**
- Only words that are statistically significant (LL ≥ 3.84)
- Corpus words are set to minimum 1 if not found (prevents math errors)

**How results are ordered:**
- Most distinctive words appear first
- Direction doesn't matter (over-represented and under-represented both count as distinctive)

## NLTK Requirements

**One-time download:** Run `nltk.download('punkt')` and similar for each corpus ('brown', 'gutenberg', 'reuters', 'inaugural').

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