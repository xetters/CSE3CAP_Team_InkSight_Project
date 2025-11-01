# Data Flow

## File Upload Process

1. User selects file via picker or pastes text directly
2. Frontend validates file size (max 5MB) and format (TXT, DOCX, MD, ODT)
3. File buffer held in browser memory only - no server transmission until analysis
4. Analyze button activates once validation passes

## Analysis Pipeline

### Word Analysis
**Endpoint:** `POST /api/analyze-file`

1. Browser packages file as multipart form data
2. Express receives file buffer in-memory (no disk writes)
3. Node.js extracts plain text based on format
4. Python subprocess spawned with text piped via stdin
5. NLTK tokenizes text and counts word frequencies
6. Top words returned as JSON via stdout
7. Frontend renders frequency table in styled cards
8. All data cleared from memory immediately

### Keyness Statistics
**Endpoint:** `POST /api/keyness-stats`

1. Browser sends file with selected corpus parameter (brown/gutenberg/reuters/inaugural)
2. Express extracts text and spawns Python subprocess with corpus argument
3. Python compares user text against reference corpus
4. **Chi-squared statistical test** identifies distinctive words:
   - Measures statistical significance of word usage using scipy's chi2_contingency
   - Calculates effect size using Cohen's h
   - Filters by minimum thresholds and significance scores
   - Ranks results by distinctiveness
5. Returns ranked keywords showing writing uniqueness with effect size and significance markers
6. Frontend (keyness.js) displays top distinctive words with Chart.js horizontal bar visualization

### Semantic Analysis
**Endpoint:** `POST /api/sentiment`

1. Browser sends file to semantic analysis endpoint
2. Node.js extracts text and spawns Python subprocess
3. **FastText semantic clustering**:
   - Tokenizes text and extracts unique words
   - Generates word embeddings using pre-trained FastText model (cc.en.100.bin)
   - Applies PCA dimensionality reduction for efficiency
   - Uses KMeans clustering (4 clusters) to group semantically related words
4. Aggregates words into clusters based on semantic similarity
5. Returns cluster data with total words, total clusters, and grouped words
6. Frontend renders word clusters showing semantic relationships

### Corpus Metadata
**Endpoint:** `GET /api/corpora`

1. Frontend requests available corpus options on page load
2. Backend returns corpus metadata from corpora.py:
   - Corpus identifier (brown, gutenberg, reuters, inaugural)
   - Human-readable label
   - Brief description of corpus content
3. Frontend populates corpus selection dropdown
4. No file processing - simple metadata endpoint

## Privacy Safeguards

- **No Persistent Storage** - Text never touches disk or database
- **In-Memory Processing** - Buffers freed immediately after response
- **Local NLP** - All processing occurs on application server
- **Zero Logging** - No text content logged or tracked
- **Automatic Cleanup** - Memory cleared post-analysis
- **No External APIs** - NLTK and FastText run entirely locally

## Error Management

- Input validation errors returned before processing
- Python subprocess errors captured with descriptive messages
- Network failures handled gracefully
- All error paths maintain privacy guarantees (no server-side logs)

## Results Management

**Clear Action:**
1. User clicks Clear or refreshes page
2. Frontend removes all result cards
3. Analysis data reset to initial state
4. Browser memory garbage collected automatically
