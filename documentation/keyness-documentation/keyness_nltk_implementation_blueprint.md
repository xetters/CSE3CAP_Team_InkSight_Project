# Keyness Statistics - Data Requirements

## Frontend Call #1: Get Available Corpora (Optional - if dynamic)

### API Endpoint: `GET /api/corpora`

**Frontend sends:**
- Nothing (simple GET request)

**Backend must return:**
Dictionary containing available corpora with their metadata:
- Array of corpus objects, each containing:
  - name: corpus identifier string
  - display_name: human-readable name
  - description: what the corpus contains

**Frontend processing:**
- Populates corpus dropdown selector with available options
- Uses display_name for dropdown text
- Sends selected corpus name with analysis request

---

## Frontend Call #2: Analyze Keyness

### API Endpoint: `POST /api/keyness-stats`

**Frontend sends:**
- file: User's text file (TXT, DOCX, MD, ODT)
- corpus: Selected corpus name string

**Backend must return:**
Dictionary containing:
- total_words: integer, total word count in user's text
- unique_words: integer, count of distinct words
- significant_keywords: integer, count of keywords meeting p < 0.05
- corpus: object containing
  - name: corpus identifier string
  - display_name: human-readable name string
  - description: what the corpus contains string
  - total_words: integer, size of reference corpus
- keywords: array of objects, each containing
  - word: the keyword string (lowercase)
  - effect_size: float (can be positive or negative)
  - ll_score: float (log-likelihood statistic)
  - significance: string ("***", "**", or "*")
  - user_freq: integer (raw count in user's text)
  - corpus_freq: float (expected frequency, normalized to user text scale)

**Frontend processing:**
1. Updates stats display with total_words, unique_words, significant_keywords
2. Shows corpus context using corpus display_name and description
3. Renders chart with keywords array (sorted: negative effect_size first, then positive)
4. Displays top 3 positive and top 3 negative effect_size words
5. Counts and displays significance level breakdown (count of ***, **, *)
6. Uses corpus name to look up comparison text from CORPUS_INFO configuration for insight generation

---

## Required Python Functions

### analyze_keyness()
Takes user text string and corpus name string. Returns complete response dictionary.

### calculate_log_likelihood()
Takes 4 integers:
- word count in user text
- word count in reference corpus
- total words in user text
- total words in reference corpus

Returns log-likelihood G² score as float.

### calculate_effect_size()
Takes 4 integers:
- user word count
- user total words
- corpus word count
- corpus total words

Returns standardized effect size (Cohen's h) as float.

### get_significance_marker()
Takes log-likelihood score as float. Returns significance string ("***", "**", "*", or empty).

### normalize_corpus_frequency()
Takes 3 integers:
- corpus word count
- corpus total words
- user total words

Returns normalized frequency as float.

---

## Backend Configuration

### Corpus Metadata
Backend maintains mapping of corpus names to metadata containing:
- display_name string
- description string
- function to retrieve corpus words from NLTK

### Significance Thresholds
- LL ≥ 10.83 → "***" (p < 0.001)
- LL ≥ 6.63 → "**" (p < 0.01)
- LL ≥ 3.84 → "*" (p < 0.05)
- LL < 3.84 → not significant (exclude from results)
