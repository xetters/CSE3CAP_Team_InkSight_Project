# Keyness Statistics - User Flow

## Step-by-Step Process

1. User uploads their text file or pastes text into the editor
2. User checks the "Keyness Statistics" checkbox in analysis options
3. User selects a reference corpus from the dropdown (Brown, Gutenberg, Reuters, or Inaugural)
4. User clicks "Analyze My Writing" button
5. Frontend sends file and selected corpus name to `/api/keyness-stats` endpoint
6. Backend extracts text from the uploaded file
7. Backend tokenizes user text (lowercase, alphabetic only, min 3 characters)
8. Backend loads selected NLTK corpus and tokenizes it the same way
9. Backend counts word frequencies in both user text and corpus
10. Backend calculates log-likelihood and effect size for each word in user text
11. Backend filters to only significant keywords (LL ≥ 3.84)
12. Backend sorts keywords by absolute effect size (most distinctive first)
13. Backend returns JSON with stats, corpus metadata, and keyword array
14. Frontend displays corpus context and statistics in info boxes
15. Frontend generates top 3 over-represented and top 3 under-represented words
16. Frontend counts significance levels (count of ***, **, *)
17. Frontend renders horizontal bar chart with Chart.js showing all keywords
18. User can view, download, or clear the results
