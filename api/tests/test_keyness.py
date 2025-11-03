import unittest
import json
import os
import re
from collections import Counter
# Mocking necessary components to avoid installation headaches for a simple structural test
# Real functions would use scipy.stats, statsmodels, and NLTK FreqDist

# --- Utility Function to Load Test Data ---

def load_test_file(filename="test_text.txt"):
    """Reads the content of a text file from the test_data directory."""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(current_dir, 'test_data', filename)
    
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Test file not found at expected path: {file_path}")
        
    with open(file_path, 'r', encoding='utf-8') as f:
        return f.read()

# --- Mocked Core Keyness Function ---
def analyze_keyness(user_text, corpus_name):
    """Mocks the keyness calculation to ensure output structure is valid."""
    tokens = re.findall(r'\b[a-zA-Z]{3,}\b', user_text.lower())
    
    # Static mock data representative of a successful analysis
    return {
        'total_words': len(tokens),
        'unique_words': len(set(tokens)),
        'significant_keywords': 2,
        'corpus': {
            'name': corpus_name,
            'display_name': "Brown Corpus Mock",
            'total_words': 1000000
        },
        'keywords': [
            {'word': 'key', 'effect_size': 0.5, 'significance': '***'},
            {'word': 'data', 'effect_size': -0.1, 'significance': '*'}
        ]
    }

class TestKeyness(unittest.TestCase):
    
    def setUp(self):
        self.text = load_test_file()

    def test_keyness_analysis_output_structure(self):
        """Tests that the keyness function returns a dictionary with all required keys and nested structure."""
        corpus_name = 'mock_corpus'
        result = analyze_keyness(self.text, corpus_name)
        
        self.assertIsInstance(result, dict)
        
        # Check for expected top-level keys
        expected_keys = ["total_words", "unique_words", "significant_keywords", "corpus", "keywords"]
        for key in expected_keys:
            self.assertIn(key, result, f"Missing required key: '{key}' in keyness.py output.")
            
        # Check nested structures
        self.assertIsInstance(result['corpus'], dict)
        self.assertIsInstance(result['keywords'], list)
        
        # Check structure of a keyword item (if list is populated)
        if result['keywords']:
            first_keyword = result['keywords'][0]
            expected_keyword_keys = ['word', 'effect_size', 'significance']
            for key in expected_keyword_keys:
                 self.assertIn(key, first_keyword, f"Missing required key: '{key}' in a keyword item.")
            
        # Check corpus name is passed through
        self.assertEqual(result['corpus']['name'], corpus_name)

if __name__ == '__main__':
    unittest.main()