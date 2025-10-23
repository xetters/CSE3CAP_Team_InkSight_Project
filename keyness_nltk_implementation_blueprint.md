# Keyness Implementation with NLTK

## UI Integration

When user selects "Keyness Statistics" analysis, display a dropdown menu to select reference corpus:

| Corpus Name | Description | Use Case |
|-------------|-------------|----------|
| `gutenberg` | Classic literature (e.g., Moby-Dick, Emma) | Word frequency, literary analysis |
| `brown` | Balanced corpus of American English | Genre comparison |
| `reuters` | Newswire articles | Text classification |
| `inaugural` | U.S. presidential inaugural speeches | Diachronic (historical) language change |
| `stopwords` | Lists of common words in multiple languages | Preprocessing |
| `wordnet` | Lexical database of English | Synonyms, word meanings, semantic relations |

The selected corpus name should be passed to the backend API along with the user's text.

## Processing Steps

1. **Receive input from stdin** - Read JSON containing user's uploaded text and selected corpus name.

2. **Load reference corpus** - Use NLTK to load the selected corpus (e.g., `nltk.corpus.brown.words()`). If corpus loading fails, fall back to frequency-only mode.

3. **Tokenize** - Create function to split both user text and reference corpus into individual words, lowercase everything, keep only alphabetic characters.

4. **Count frequencies** - Create function to count how many times each word appears in both the user text and reference corpus.

5. **Decide mode** - Check if reference corpus loaded successfully - if no, do frequency analysis; if yes, do log-likelihood keyness analysis.

6. **Calculate scores** - Frequency mode: divide word count by total. Comparative mode: create function that runs log-likelihood formula comparing frequencies in user text vs. reference corpus.

7. **Filter** - Remove words below minimum length, words appearing too rarely, and scores below significance threshold.

8. **Sort results** - Frequency mode: sort by count descending. Comparative mode: sort by absolute log-likelihood score descending (showing over-represented words in user's text).

9. **Format as JSON** - Build dictionary with total_words, unique_words, selected_corpus, and list of top keywords with their scores.

## NLTK Usage

- NLTK tokenizes the text using `word_tokenize()` to split it into words properly.
- NLTK provides stopwords using `stopwords.words('english')` to optionally filter common words.
- NLTK can count frequencies with `FreqDist()` though Python's `Counter()` works too.
- NLTK provides built-in corpora via `nltk.corpus` module (e.g., `nltk.corpus.brown`, `nltk.corpus.gutenberg`).

## Log-Likelihood Formula

For keyness analysis, use the log-likelihood (LL) statistic to identify words that are over-represented in the user's text compared to the reference corpus:

```
LL = 2 * ((a * log(a/E1)) + (b * log(b/E2)))

Where:
- a = frequency of word in user's text
- b = frequency of word in reference corpus
- E1 = expected frequency in user's text = (a + b) * (c / N)
- E2 = expected frequency in reference corpus = (a + b) * (d / N)
- c = total words in user's text
- d = total words in reference corpus
- N = c + d (total words in both corpora)
```

**Significance threshold**: LL > 3.84 (p < 0.05) or LL > 6.63 (p < 0.01)

Positive LL scores indicate over-representation in user's text (distinctive keywords).

## Alignment with PDF Requirements

This implementation addresses the ***must-have*** requirement from the project proposal:

> "Keyness statistics, which indicate the words that most distinctive in a text or set of texts"

By comparing user's creative writing against NLTK reference corpora, the tool identifies distinctive keywords that reveal the writer's unique style, themes, and language patterns - fulfilling the goal of "*Tell me something I don't know*".
