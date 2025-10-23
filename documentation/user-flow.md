# User Flow

## Overview

InkSight is a privacy-focused text analysis tool that provides comprehensive writing insights through word frequency analysis, keyness statistics, and sentiment analysis. All processing occurs locally with zero external data transmission.

## User Journey

### 1. File Upload
- User accesses the application through their web browser
- Selects a document (TXT, DOCX, MD, or ODT format) or pastes text directly
- System validates file size (maximum 5MB) and format compatibility

### 2. Analysis Selection
User chooses from three powerful analysis types:

- **Word Analysis** - Identifies most frequently used words with occurrence counts
- **Keyness Statistics** - Highlights distinctive words compared to reference corpus using log-likelihood calculations
- **Sentiment Analysis** - Classifies emotional tone with positive, negative, and neutral breakdowns

### 3. Processing
- User clicks "Analyze My Writing" to initiate analysis
- Loading indicator displays while processing occurs
- Multiple analyses run in parallel when selected

### 4. Results Viewing
- Results appear in clean, expandable cards
- Interactive visualizations display insights
- Detailed breakdowns available for each analysis type
- Sentiment includes sentence-by-sentence analysis

### 5. Export Options
- Download complete results as standalone HTML file
- Print or save to PDF directly from browser
- Individual section downloads available

### 6. Session Management
- Clear results anytime to start fresh analysis
- All data automatically purged on page refresh or browser close
- No persistent storage ensures complete privacy

## Technology Foundation

**Frontend:** Vanilla JavaScript - no external dependencies
**Backend:** Node.js with Express framework
**NLP Processing:** NLTK for tokenization, FastText for sentiment analysis
**File Handling:** In-memory processing with Multer and Mammoth libraries

## Privacy Commitment

- **Zero Storage** - No databases, no file systems, no logs
- **In-Memory Only** - All processing uses temporary buffers
- **Local Processing** - No external API calls or third-party services
- **Open Source** - NLTK and FastText are free, transparent tools
- **Automatic Cleanup** - Data purged immediately after analysis completion
