#!/usr/bin/env python3
"""Test 1500-word text file to verify under-represented words detection"""
import sys
sys.path.insert(0, 'api/utils')

from keyness import analyze_keyness

# Load the 1500-word test file
print("Loading 1500-word test file...")
with open('fake-text-samples/1500words-test.txt', 'r', encoding='utf-8') as f:
    text = f.read()

word_count_estimate = len(text.split())
print(f"Estimated word count: {word_count_estimate}")

# Test against Brown corpus
print("\n" + "="*80)
print("Testing: 1500-word Garden Story vs Brown Corpus")
print("="*80)

result = analyze_keyness(text, 'brown')

print(f"\nActual word count: {result['total_words']:,}")
print(f"Unique words: {result['unique_words']:,}")
print(f"Significant keywords: {result['significant_keywords']:,}")

print(f"\nCorpus: {result['corpus']['display_name']}")
print(f"Corpus total words: {result['corpus']['total_words']:,}")

# Separate by effect size
over_rep = [k for k in result['keywords'] if k['effect_size'] > 0]
under_rep = [k for k in result['keywords'] if k['effect_size'] < 0]

print("\n" + "="*80)
print(f"RESULTS:")
print(f"  Over-represented words (distinctive to garden story): {len(over_rep)}")
print(f"  Under-represented words (common in Brown, rare in story): {len(under_rep)}")
print("="*80)

# Expected outcome: Should have BOTH over and under-represented words
expected_under = len(under_rep) > 0
expected_over = len(over_rep) > 0

if expected_under and expected_over:
    print("\n*** SUCCESS! Found both over- and under-represented words! ***")
    print("This confirms the fix works for mid-sized texts (~1500 words)")
elif not expected_under:
    print("\n*** PARTIAL SUCCESS: Found over-represented but NO under-represented words ***")
    print("Text may still be too short for statistical significance")
else:
    print("\n*** UNEXPECTED RESULT ***")

if under_rep:
    print(f"\nTop 15 Under-represented words:")
    print(f"{'Word':<15} {'Story Freq':<12} {'Expected':<12} {'Effect Size':<12} {'LL Score':<10} {'Sig'}")
    print("-" * 85)
    for k in sorted(under_rep, key=lambda x: x['effect_size'])[:15]:
        print(f"{k['word']:<15} {k['user_freq']:<12} {k['corpus_freq']:<12.2f} {k['effect_size']:<12.4f} {k['ll_score']:<10.2f} {k['significance']}")

if over_rep:
    print(f"\nTop 15 Over-represented words:")
    print(f"{'Word':<15} {'Story Freq':<12} {'Expected':<12} {'Effect Size':<12} {'LL Score':<10} {'Sig'}")
    print("-" * 85)
    for k in sorted(over_rep, key=lambda x: x['effect_size'], reverse=True)[:15]:
        print(f"{k['word']:<15} {k['user_freq']:<12} {k['corpus_freq']:<12.2f} {k['effect_size']:<12.4f} {k['ll_score']:<10.2f} {k['significance']}")

print("\n" + "="*80)
print("CONCLUSION:")
if expected_under:
    print("  The fix WORKS for texts around 1500 words!")
    print("  Minimum recommended text length: ~1000-1500 words")
else:
    print("  Text may need to be longer for reliable under-represented word detection")
    print("  Consider testing with 2000+ word samples")
print("="*80)
