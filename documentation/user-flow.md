# User Flow

## Overview

InkSight is a privacy-focused NLP tool that analyzes user-uploaded text for word frequency patterns and emotional tone. All processing happens locally with no data transmission to external servers.

## File Upload and Analysis

1. User opens the application in their web browser
2. User selects a file (TXT, DOCX, MD, ODT) using the file picker or pastes text directly
3. Frontend validates file size (max 5MB) and extension
4. User selects which analysis types to run:
   - Word Analysis (identifies top words and their frequencies)
   - Keyness Statistics (compares against reference corpus using log-likelihood)
   - Sentiment Analysis (classifies emotional tone as positive, negative, or neutral)
5. User clicks the "Analyze My Writing" button
6. Frontend sends file/text to backend API endpoints
7. User sees loading state while analysis runs
8. Results appear as expandable cards with detailed insights
9. User can download results as HTML file (also printable/savable to PDF)
10. User can clear results and start over
11. All data is automatically cleared on page refresh, browser close, or manual clear

## Technology Stack

- **Frontend:** Vanilla JavaScript with no external dependencies
- **Backend:** Node.js with Express.js framework
- **File Processing:** Multer for in-memory file handling
- **Text Extraction:** Mammoth for DOCX, native UTF-8 for TXT/MD, with ODT fallback support
- **Python Scripts:** Natural Language processing using open-source libraries
  - NLTK (Natural Language Toolkit) for tokenization and text processing
  - FastText for advanced word embeddings and sentiment analysis

## Privacy Assurance

- All processing happens in-memory only on your browser and our servers
- Text is never stored in any database or external service
- No third-party data sharing agreements
- NLP libraries (NLTK, FastText) are free and open source with no commercial restrictions
- Data is automatically deleted after analysis and cleared when you refresh or close the page
