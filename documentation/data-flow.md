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
**Endpoint:** `POST /api/analyze-file` (with comparative mode)

1. Same upload process as Word Analysis
2. Python compares user text against reference corpus
3. **Log-likelihood calculation** identifies distinctive words:
   - Measures statistical significance of word usage
   - Filters by minimum thresholds and significance scores
   - Ranks results by distinctiveness
4. Returns ranked keywords showing writing uniqueness
5. Frontend displays top distinctive words with significance indicators

### Sentiment Analysis
**Endpoint:** `POST /api/sentiment`

1. Browser sends file to dedicated sentiment endpoint
2. Node.js extracts text and spawns Python subprocess
3. **FastText sentiment processing**:
   - Splits text into sentences
   - Generates word embeddings for semantic understanding
   - Applies pre-trained sentiment classification model
   - Assigns positive, negative, or neutral labels with confidence scores
4. Aggregates statistics across all sentences
5. Returns detailed breakdown with overall sentiment metrics
6. Frontend renders visualizations with bar charts and sentence analysis

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
