# api/utils/analyze.py
import sys
import json
import re
from collections import Counter

def tokenize(text: str) -> list[str]:
    """Convert text to a list of lowercase word tokens."""
    return re.findall(r"[A-Za-z']+", text.lower())

def count_words(tokens: list[str]) -> Counter:
    """Count occurrences of each word in the token list."""
    return Counter(tokens)

def get_top_words(counter: Counter, n: int = 5) -> list[dict]:
    """Return the top n words with their counts as a list of dictionaries."""
    return [{"w": word, "n": count} for word, count in counter.most_common(n)]

def count_sentences(text: str) -> int:
    """Count the number of sentences in the text."""
    # Split on common sentence endings
    sentences = re.split(r'[.!?]+', text)
    # Filter out empty sentences
    return sum(1 for s in sentences if s.strip())

def calculate_reading_time(total_words: int) -> dict:
    """Calculate estimated reading time based on average reading speed of 200 words/minute."""
    avg_speed = 200  # words per minute
    minutes = total_words / avg_speed

    if minutes < 1:
        seconds = int(minutes * 60)
        return {"value": seconds, "unit": "seconds"}
    else:
        return {"value": round(minutes, 1), "unit": "minutes"}

def analyze_text(text: str) -> dict:
    """Analyze the text and return a summary with word count, top words, sentences, and reading time."""
    tokens = tokenize(text)
    counter = count_words(tokens)
    total = sum(counter.values())
    top_words = get_top_words(counter)

    sentence_count = count_sentences(text)
    avg_sentence_length = round(total / sentence_count, 1) if sentence_count > 0 else 0
    reading_time = calculate_reading_time(total)

    return {
        "word_count": total,
        "top": top_words,
        "sentence_count": sentence_count,
        "avg_sentence_length": avg_sentence_length,
        "reading_time": reading_time
    }

# --- directly read from stdin when called from Node ---
text = sys.stdin.read() or ""
result = analyze_text(text)
print(json.dumps(result, ensure_ascii=False))
# ------------------------------------------------------