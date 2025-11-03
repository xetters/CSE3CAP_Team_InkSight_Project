#!/usr/bin/env python3
"""Full automated installation for InkSight - NLTK + FastText"""

import sys
import subprocess
import urllib.request
import gzip
import shutil
from pathlib import Path

def install_python_requirements():
    requirements_path = Path(__file__).parent / "requirements.txt"
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", str(requirements_path)])

def download_nltk_data():
    setup_nltk_path = Path(__file__).parent / "setup_nltk.py"
    subprocess.check_call([sys.executable, str(setup_nltk_path)])

def download_fasttext_model():
    # Navigate to project root, then into models/ directory
    models_dir = Path(__file__).parent.parent.parent / "models"
    models_dir.mkdir(exist_ok=True)
    model_path = models_dir / "cc.en.100.bin"

    if model_path.exists():
        print("FastText model already exists, skipping download")
        return

    model_url = "https://dl.fbaipublicfiles.com/fasttext/vectors-crawl/cc.en.100.bin.gz"
    gz_path = models_dir / "cc.en.100.bin.gz"

    print("Downloading FastText model (~967 MB)...")
    urllib.request.urlretrieve(model_url, gz_path)

    print("Extracting model...")
    with gzip.open(gz_path, 'rb') as f_in:
        with open(model_path, 'wb') as f_out:
            shutil.copyfileobj(f_in, f_out)

    gz_path.unlink()
    print(f"FastText model installed at {model_path}")

if __name__ == "__main__":
    print("Installing Python dependencies...")
    install_python_requirements()

    print("Downloading NLTK data...")
    download_nltk_data()

    print("Downloading FastText model...")
    download_fasttext_model()

    print("Installation complete!")
