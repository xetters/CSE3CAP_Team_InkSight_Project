# Smoketest

Quick end-to-end test to verify the InkSight API is working.

## What It Does

1. Checks if the server is running
2. Creates a temporary test file with sample text
3. Sends the file to `/api/analyze-file`
4. Validates the JSON response
5. Cleans up the test file

## How to Use

```bash
# Start the server first
node api/app.js

# Run the smoketest (in another terminal)
python smoketest.py
```

## Expected Output

```
==================================================
InkSight Smoketest
==================================================

📡 Checking server...
✅ Server is running

📝 Creating test file...
✅ Created test_sample.txt

🧪 Testing InkSight API...
✅ Success! API response:
   Word count: 23
   Insight: short
   Top words: ['the(3)', 'text(2)', 'for(1)']

🧹 Cleaning up...
✅ Test file removed

==================================================
✅ All tests passed!
==================================================
```