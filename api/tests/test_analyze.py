import unittest
import re
import os
from collections import Counter

#Load Test Data 

def load_test_file(filename="test_text.txt"):
    """Reads the content of a text file from the test_data directory."""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(current_dir, 'test_data', filename)
    
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Test file not found at expected path: {file_path}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        return f.read()

#Core Logic from analyze.py
def analyze_text(text: str) -> dict:
    """Mocked core logic from analyze.py."""
    tokens = re.findall(r"[A-Za-z']+", text.lower())
    counter = Counter(tokens)
    total = len(tokens)
    top_words = [{"w": word, "n": count} for word, count in counter.most_common(5)]
    sentence_count = sum(1 for s in re.split(r'[.!?]+', text) if s.strip())
    avg_sentence_length = round(total / sentence_count, 1) if sentence_count > 0 else 0
    minutes = total / 200
    reading_time = {"value": int(minutes * 60), "unit": "seconds"} if minutes < 1 else {"value": round(minutes, 1), "unit": "minutes"}

    return {
        "word_count": total,
        "top": top_words,
        "sentence_count": sentence_count,
        "avg_sentence_length": avg_sentence_length,
        "reading_time": reading_time
    }

#Unit Tests

class TestAnalyze(unittest.TestCase):
    
    def setUp(self):
        self.text = load_test_file()

    def test_analysis_output_structure(self):
        """Tests that the analysis function returns a dictionary with all required keys."""
        result = analyze_text(self.text)
        
        # 1. Check if the output is a dictionary (for JSON serialization)
        self.assertIsInstance(result, dict)
        
        # 2. Check for the presence of all expected top-level keys
        expected_keys = [
            "word_count", 
            "top", 
            "sentence_count", 
            "avg_sentence_length", 
            "reading_time"
        ]
        
        for key in expected_keys:
            self.assertIn(key, result, f"Missing required key: '{key}' in analyze.py output.")
            
        # 3. Check internal structure of complex keys
        self.assertIsInstance(result['top'], list)
        self.assertIsInstance(result['reading_time'], dict)

if __name__ == '__main__':
    unittest.main()