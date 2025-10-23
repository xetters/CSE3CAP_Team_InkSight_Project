# Data Flow

#### Upon file upload

1. Frontend validates file size and extension
2. File stored in browser memory
3. Analyze button enabled

#### Upon analysis selection

1. Browser packages selected file into multipart form data
2. HTTP POST request sent to Express server
3. Multer middleware stores file buffer in memory
4. Node.js extracts plain text from file buffer based on file type
5. Node.js spawns Python subprocess for analysis
6. Text content sent to Python process via stdin pipe
7. Python reads text and performs word frequency analysis
8. Python outputs JSON results to stdout pipe
9. Node.js collects output and parses JSON
10. Express sends JSON response back to browser
11. Frontend JavaScript renders results in the UI

#### Upon clearing

1. Frontend removes results from the anaylsis container
2. Frontend resets stored analysis data
3. Upload area returns to initial state
4. Analysis button disabled until new file uploaded
