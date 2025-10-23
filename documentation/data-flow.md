# Data Flow

## Upon File Upload

1. User selects file via file picker or paste text in textarea
2. Frontend validates file size (max 5MB) and extension (TXT, DOCX, MD, ODT)
3. File buffer stored temporarily in browser memory only
4. Analyze button becomes enabled
5. No data is transmitted to server until user clicks Analyze

## Upon Analysis Selection (Word Analysis)

1. User selects "Word Analysis" checkbox
2. Browser packages selected file/text into multipart form data
3. HTTP POST request sent to `/api/analyze-file` Express endpoint
4. Multer middleware receives file buffer and stores in memory (not on disk)
5. Node.js extracts plain text from file buffer based on file type:
   - TXT/MD files: Direct UTF-8 decoding
   - DOCX files: Mammoth library extracts text
   - ODT files: Fallback to UTF-8 decoding (future: full ODT library support)
6. Node.js spawns Python subprocess running `analyze.py`
7. Extracted text sent to Python process via stdin pipe
8. Python receives text and performs NLTK-based tokenization:
   - Tokenizes text into lowercase word tokens using regex pattern `[A-Za-z']+`
   - Filters to alphabetic characters and apostrophes only
9. Counts word frequencies using Python Counter object
10. Returns top N words (default: top 5) with occurrence counts as JSON
11. Python outputs JSON results to stdout pipe
12. Node.js collects output and parses JSON
13. Express sends JSON response back to browser
14. Frontend JavaScript renders word frequency table with styled cards
15. Text is immediately cleared from memory after response

## Upon Analysis Selection (Keyness Statistics)

1. User selects "Word Analysis" checkbox with comparative mode enabled
2. Backend process identical to Word Analysis, but with reference corpus comparison
3. Python script (analyze.py) implements log-likelihood calculation:
   - Tokenizes user text using NLTK tokenization
   - Compares word frequencies against reference corpus using log-likelihood formula
   - Formula: 2 * sum(log(observed/expected)) for each word
   - Filters words by minimum length threshold and significance score
   - Sorts results by absolute log-likelihood score descending
4. Returns ranked keywords with significance scores
5. Frontend displays top distinctive keywords that differentiate user's writing

## Upon Analysis Selection (Sentiment Analysis)

1. User selects "Sentiment Analysis" checkbox
2. HTTP POST request sent to `/api/sentiment` Express endpoint
3. Multer middleware receives file buffer and stores in memory
4. Node.js extracts plain text using same method as word analysis
5. Node.js spawns Python subprocess running `sentiment.py`
6. Extracted text sent to Python process via stdin pipe
7. Python receives text and performs FastText-based sentiment analysis:
   - Tokenizes text into sentences using regex split on `[.!?]+`
   - For each sentence, loads FastText pre-trained model
   - Generates word embeddings using FastText to understand semantic meaning
   - Applies sentiment classification model (trained on annotated sentiment corpus)
   - Assigns sentiment labels: positive, negative, or neutral
   - Calculates confidence scores for each classification
8. Calculates overall statistics:
   - Positive/negative/neutral ratios
   - Average sentiment score across all sentences
   - Determines overall text sentiment based on aggregated scores
9. Returns detailed sentiment breakdown with per-sentence analysis as JSON
10. Python outputs JSON to stdout pipe
11. Node.js collects output and parses JSON
12. Express sends JSON response back to browser
13. Frontend JavaScript renders sentiment visualization with bar charts and sentence breakdown
14. Text is immediately cleared from memory after response

## Upon Clearing Results

1. User clicks "Clear Results" button or manually refreshes page
2. Frontend removes all result cards from analysis container
3. Frontend resets stored analysis data (lastResult, sentimentData)
4. Upload area returns to initial state
5. Analyze button disabled until new file/text provided
6. All data in browser memory is garbage collected

## Privacy Implementation

- **No Database Storage:** Text never reaches any persistent storage
- **In-Memory Only:** All processing uses memory buffers that are immediately freed
- **No External Calls:** All NLP processing happens locally on your server
- **No Logging:** Uploaded text is not logged or tracked
- **Automatic Deletion:** Data is cleared from memory immediately after analysis and JSON response
- **Browser Cleanup:** Page refresh or close triggers automatic garbage collection
- **Open Source Tools:** NLTK and FastText are free/open source with no licensing restrictions
- **No Third-Party Trackers:** No Google Analytics, Mixpanel, or similar services tracking user behavior

## Error Handling

- File validation errors returned immediately without processing
- Python subprocess errors captured and returned with descriptive messages
- Invalid JSON from Python subprocess caught and error message displayed
- Network errors handled gracefully with user-friendly error messages
- All error scenarios maintain privacy (no error logs stored server-side)
