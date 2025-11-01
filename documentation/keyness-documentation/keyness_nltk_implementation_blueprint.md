# Keyness Statistics - Data Requirements

## Frontend Call #1: Get Available Corpora

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
  - significance: string ("***", "**", or "*")

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

### test_frequency()
Takes 5 parameters:
- word string
- user word frequency
- corpus word frequency
- total words in user text
- total words in reference corpus

Returns p-value from chi-squared test using scipy's chi2_contingency.

### freq_strength()
Takes 4 integers:
- user word count
- user total words
- corpus word count
- corpus total words

Returns standardized effect size (Cohen's h) as float.

### give_star_value()
Takes p-value as float. Returns significance string ("***", "**", "*", or empty).

---

## Backend Configuration

### Corpus Metadata
Backend maintains mapping of corpus names to metadata containing:
- display_name string
- description string
- function to retrieve corpus words from NLTK

### Significance Thresholds (p-values)
- p < 0.001 → "***"
- p < 0.01 → "**"
- p < 0.05 → "*"
- p ≥ 0.05 → not significant (exclude from results)
