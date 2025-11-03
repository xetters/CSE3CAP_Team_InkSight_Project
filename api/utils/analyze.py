"""Analyze text to count words, find popular words, and estimate reading time."""

import sys
import json
import re
from collections import Counter

# Read the text from input
text = sys.stdin.read() or ""

# Break text into individual words (lowercase letters and apostrophes only)
tokens = re.findall(r"[A-Za-z']+", text.lower())

# Count how many times each word appears
counter = Counter(tokens)
total = counter.total()

# Get the 5 most common words
top_words = [{"w": word, "n": count} for word, count in counter.most_common(5)]

# Count sentences by splitting on periods, exclamation marks, and question marks
sentence_count = sum(1 for s in re.split(r'[.!?]+', text) if s.strip())

# Calculate average words per sentence
avg_sentence_length = round(total / sentence_count, 1) if sentence_count > 0 else 0

# Estimate reading time (assumes 200 words per minute)
minutes = total / 200
if minutes < 1:
    reading_time = {"value": int(minutes * 60), "unit": "seconds"}
else:
    reading_time = {"value": round(minutes, 1), "unit": "minutes"}

# Package everything into a result dictionary (good for json conversion)
result = {
    "word_count": total,
    "top": top_words,
    "sentence_count": sentence_count,
    "avg_sentence_length": avg_sentence_length,
    "reading_time": reading_time
}

# Output the result dictionary as JSON
print(json.dumps(result, ensure_ascii=False))
