# api/utils/sentiment.py
import sys
import json
import re
import random

def tokenize(text: str) -> list[str]:
    """Convert text to sentences."""
    # Simple sentence splitting
    sentences = re.split(r'[.!?]+', text)
    return [s.strip() for s in sentences if s.strip()]

def analyze_sentiment(text: str) -> dict:
    """
    Dummy sentiment analysis that assigns random sentiment scores.
    In production, this would use FastText or another NLP model.
    """
    sentences = tokenize(text)
    
    if not sentences:
        return {
            "overall_sentiment": "neutral",
            "sentiment_score": 0.0,
            "positive_ratio": 0.0,
            "negative_ratio": 0.0,
            "neutral_ratio": 0.0,
            "sentence_count": 0,
            "sentences": []
        }
    
    # Dummy sentiment assignment (replace with FastText later)
    sentiments = ['positive', 'negative', 'neutral']
    sentence_data = []
    
    for sentence in sentences:
        # Random sentiment for now
        sentiment = random.choice(sentiments)
        
        # Assign score based on sentiment
        if sentiment == 'positive':
            score = random.uniform(0.5, 1.0)
        elif sentiment == 'negative':
            score = random.uniform(-1.0, -0.5)
        else:
            score = random.uniform(-0.3, 0.3)
        
        sentence_data.append({
            "text": sentence[:100] + "..." if len(sentence) > 100 else sentence,
            "sentiment": sentiment,
            "score": round(score, 3)
        })
    
    # Calculate overall statistics
    positive_count = sum(1 for s in sentence_data if s['sentiment'] == 'positive')
    negative_count = sum(1 for s in sentence_data if s['sentiment'] == 'negative')
    neutral_count = sum(1 for s in sentence_data if s['sentiment'] == 'neutral')
    
    total = len(sentence_data)
    avg_score = sum(s['score'] for s in sentence_data) / total
    
    # Determine overall sentiment
    if avg_score > 0.2:
        overall = "positive"
    elif avg_score < -0.2:
        overall = "negative"
    else:
        overall = "neutral"
    
    return {
        "overall_sentiment": overall,
        "sentiment_score": round(avg_score, 3),
        "positive_ratio": round(positive_count / total, 3),
        "negative_ratio": round(negative_count / total, 3),
        "neutral_ratio": round(neutral_count / total, 3),
        "sentence_count": total,
        "sentences": sentence_data[:20]  # Limit to first 20 sentences
    }

# Read from stdin when called from Node
text = sys.stdin.read() or ""
result = analyze_sentiment(text)
print(json.dumps(result, ensure_ascii=False))