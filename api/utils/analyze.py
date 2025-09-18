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

def get_insight(total_words: int) -> str:
    """Return a short description based on the total word count."""
    if total_words == 0:
        return "empty"
    elif total_words < 50:
        return "short"
    elif total_words < 200:
        return "medium"
    else:
        return "long"

def analyze_text(text: str) -> dict:
    """Analyze the text and return a summary with word count, top words, and insight."""
    tokens = tokenize(text)
    counter = count_words(tokens)
    total = sum(counter.values())
    top_words = get_top_words(counter)
    insight = get_insight(total)

    return {
        "word_count": total,
        "top": top_words,
        "insight": insight
    }

# --- directly read from stdin when called from Node ---
text = sys.stdin.read() or ""
result = analyze_text(text)
print(json.dumps(result, ensure_ascii=False))
# ------------------------------------------------------