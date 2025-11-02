# api/utils/semantic.py
import os
import sys
import json
import re
import fasttext
import numpy as np
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA

#change model here
script_dir = os.path.dirname(os.path.abspath(__file__)) + '/../../models/cc.en.300.bin'
pj_root = os.path.abspath(os.path.join(script_dir, '..', '..'))
model_path = os.path.join(pj_root, 'models', 'cc.en.300.bin')
fallback_path = os.path.join(script_dir,'fallback.txt')

def tokenize(text: str) -> list[str]:
    """Convert text to lowercase words."""
    tokens = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
    return tokens

def load_model(model_path=model_path):
    """Load FastText model. Train fallback model if not found."""
    if os.path.exists(model_path):
        print(f"Loading FastText model from {model_path}", file=sys.stderr)
        return fasttext.load_model(model_path)
    else:
        with open(fallback_path, "w", encoding="utf-8") as f: 
            f.write("Natural Language Processing Text analysis and data mining Semantic understanding and relationship extraction Sentiment analysis and opinion mining Word embedding for vector representation")
            
        return fasttext.train_unsupervised(
            fallback_path, 
            model='skipgram', 
            dim=50, # changed dimension parameter
            epoch=5, # changed epoch parameter
            minCount=1
        )

def get_word_vector(model, tokens):
    """Get average word vector for given tokens."""
    vectors = []
    valid_tokens = []
    for token in tokens:
        try:
            vec = model.get_word_vector(token)
            vectors.append(vec)
            valid_tokens.append(token)
        except Exception:
            continue
    return np.array(vectors), valid_tokens

def cluster_words(vectors, tokens, max_clusters=15):
    """Cluster embeddings into semantic groups with dynamic cluster size"""
    n_clusters = max(2, min(max_clusters, len(tokens) // 200))  # 1 cluster per 200 words
    n_clusters = min(n_clusters, len(tokens))  # never more clusters than tokens
    
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=5)
    labels = kmeans.fit_predict(vectors)

    clusters = []
    for i in range(n_clusters):
        cluster_indices = np.where(labels == i)[0]
        cluster_tokens = [tokens[j] for j in cluster_indices]

        # Remove duplicates word entries
        unique_words = list(dict.fromkeys(cluster_tokens))

        # Take top 10 nearest to centroid 
        centroid = kmeans.cluster_centers_[i]
        distances = np.linalg.norm(vectors[cluster_indices] - centroid, axis=1)
        sorted_idx = np.argsort(distances)

        top_unique = []
        for idx in sorted_idx:
            w = tokens[cluster_indices[idx]]
            if w not in top_unique:
                top_unique.append(w)
            if len(top_unique) == 10:
                break

        clusters.append({
            "label": f"Cluster {i}",
            "word_count": len(unique_words),
            "words": top_unique
        })

    # Sort clusters by size biggest to smallest
    clusters = sorted(clusters, key=lambda c: c["word_count"], reverse=True)
    return clusters

def analyze_semantic(text: str) -> dict:
    """Analyze semantic clusters in the text."""
    tokens = tokenize(text)

    if not tokens:
        return {"total_words": 0, "total_clusters": 0, "clusters": [], "top_clusters": []}

    model = load_model()
    vectors, valid_tokens = get_word_vector(model, tokens)

    if not valid_tokens:
        return {"total_words": len(tokens), "total_clusters": 0, "clusters": [], "top_clusters": []}

    clusters = cluster_words(vectors, valid_tokens)

    return {
        "total_words": len(tokens),
        "total_clusters": len(clusters),
        "clusters": clusters,
        "top_clusters": clusters[:4]  # top 4 biggest clusters
    }

# Read from stdin when called from Node
text = sys.stdin.read() or ""
result = analyze_semantic(text)
output = {
    "overall_sentiment": "semantic_clusters",  #
    "semantic_summary": {
        "total_words": result.get("total_words", 0),
        "total_clusters": result.get("total_clusters", 0), #cluster count
        "top_clusters": result.get("top_clusters", []), #top 4 clusters
        "clusters": result.get("clusters", []) #all clusters
    }
}
print(json.dumps(output, ensure_ascii=False))
