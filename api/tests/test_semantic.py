import unittest
import numpy as np
import re
import os
from sklearn.cluster import KMeans

# --- Utility Function to Load Test Data ---

def load_test_file(filename="test_text.txt"):
    """Reads the content of a text file from the test_data directory."""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(current_dir, 'test_data', filename)
    
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Test file not found at expected path: {file_path}")
        
    with open(file_path, 'r', encoding='utf-8') as f:
        return f.read()

# --- Mocked Core Functions (Simulated execution) ---

def tokenize(text: str) -> list[str]:
    return re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())

def get_word_vector(model_name: str, tokens: list[str]) -> tuple[np.ndarray, list[str]]:
    # Mock vector for simple clustering
    unique_tokens = list(set(tokens))
    token_to_vector = {t: np.array([i * 0.1, i * 0.2]) for i, t in enumerate(unique_tokens)}
    vectors = np.array([token_to_vector.get(t, np.zeros(2)) for t in tokens])
    return vectors, tokens

def analyze_semantic(text: str, model_name="mock_model") -> dict:
    """Performs semantic analysis and clustering (using mocks)."""
    tokens = tokenize(text)
    if not tokens:
        return {"overall_sentiment": "no_data", "semantic_summary": {"total_words": 0, "total_clusters": 0, "top_clusters": []}}

    vectors, valid_tokens = get_word_vector(model_name, tokens)
    
    n_unique_tokens = len(set(valid_tokens))
    n_clusters = max(2, min(4, n_unique_tokens)) 

    # Mock KMeans clustering
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=5)
    labels = kmeans.fit_predict(vectors)
    
    clusters = []
    for i in range(n_clusters):
        cluster_indices = np.where(labels == i)[0]
        unique_words = list(dict.fromkeys([valid_tokens[j] for j in cluster_indices]))
        
        clusters.append({
            "label": f"Cluster {i+1}",
            "word_count": len(unique_words),
            "words": unique_words
        })
    clusters.sort(key=lambda c: c["word_count"], reverse=True)

    return {
      "overall_sentiment": "semantic_clusters",
      "semantic_summary": {
        "total_words": len(valid_tokens),
        "total_clusters": n_clusters, 
        "top_clusters": clusters[:3], 
        "clusters": clusters
      }
    }


class TestSemantic(unittest.TestCase):

    def setUp(self):
        self.text = load_test_file()

    def test_semantic_analysis_output_structure(self):
        """Tests that the semantic analysis function returns a dictionary with all required nested keys."""
        # Use a mock model name since the function requires it, but the value is irrelevant for this test.
        result = analyze_semantic(self.text)
        
        self.assertIsInstance(result, dict)
        self.assertIn("overall_sentiment", result)
        self.assertIn("semantic_summary", result)
        
        summary = result['semantic_summary']
        self.assertIsInstance(summary, dict)
        
        # Check for required nested keys
        expected_summary_keys = ["total_words", "total_clusters", "top_clusters", "clusters"]
        for key in expected_summary_keys:
            self.assertIn(key, summary, f"Missing required key: '{key}' in semantic_summary.")
            
        # Check if clusters list is populated
        if summary['total_clusters'] > 0:
            self.assertIsInstance(summary['clusters'], list)
            self.assertGreater(len(summary['clusters']), 0)

if __name__ == '__main__':
    unittest.main()