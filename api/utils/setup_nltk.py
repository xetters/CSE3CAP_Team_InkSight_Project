#!/usr/bin/env python3
# Downloads all required NLTK data packages for InkSight keyness analysis
# Usage: python api/utils/setup_nltk.py

import nltk

packages = ['punkt_tab', 'brown', 'gutenberg', 'reuters', 'inaugural']

print("Downloading NLTK data packages for InkSight keyness analysis...\n")

for package in packages:
    try:
        print(f"Downloading '{package}'...")
        nltk.download(package, quiet=False)
        print(f"'{package}' downloaded successfully\n")
    except Exception as e:
        print(f"Error downloading '{package}': {e}\n")
        exit(1)

print("=" * 60)
print("All NLTK data packages downloaded successfully!")
print("InkSight keyness analysis is ready to use.")
print("=" * 60)
