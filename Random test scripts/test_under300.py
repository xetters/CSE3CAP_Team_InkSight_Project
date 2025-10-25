#!/usr/bin/env python3
"""Quick test of under300words.txt with the fix"""
import sys
sys.path.insert(0, 'api/utils')

from keyness import analyze_keyness

# Read the test file
with open('fake-text-samples/under300words.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# Analyze against Brown corpus
result = analyze_keyness(text, 'brown')

print("="*80)
print("Testing: under300words.txt vs Brown Corpus (WITH FIX)")
print("="*80)

print(f"\nTotal words: {result['total_words']}")
print(f"Unique words: {result['unique_words']}")
print(f"Significant keywords: {result['significant_keywords']}")

# Separate by effect size
over_rep = [k for k in result['keywords'] if k['effect_size'] > 0]
under_rep = [k for k in result['keywords'] if k['effect_size'] < 0]

print(f"\n{'='*80}")
print(f"RESULTS:")
print(f"  Over-represented words: {len(over_rep)}")
print(f"  Under-represented words: {len(under_rep)}")
print(f"{'='*80}")

if under_rep:
    print("\n*** SUCCESS! Found under-represented words with fix! ***")
    print(f"\nAll {len(under_rep)} under-represented words:")
    print(f"{'Word':<15} {'User Freq':<12} {'Corpus Freq':<15} {'Effect Size':<12} {'LL Score'}")
    print("-" * 75)
    for k in sorted(under_rep, key=lambda x: x['effect_size']):
        print(f"{k['word']:<15} {k['user_freq']:<12} {k['corpus_freq']:<15.2f} {k['effect_size']:<12.4f} {k['ll_score']:.2f}")
else:
    print("\n*** Still no under-represented words found ***")
    print("This confirms that the text is too short for statistical significance.")

if over_rep:
    print(f"\n\nTop 10 over-represented words:")
    print(f"{'Word':<15} {'User Freq':<12} {'Corpus Freq':<15} {'Effect Size':<12} {'LL Score'}")
    print("-" * 75)
    for k in sorted(over_rep, key=lambda x: x['effect_size'], reverse=True)[:10]:
        print(f"{k['word']:<15} {k['user_freq']:<12} {k['corpus_freq']:<15.2f} {k['effect_size']:<12.4f} {k['ll_score']:.2f}")
