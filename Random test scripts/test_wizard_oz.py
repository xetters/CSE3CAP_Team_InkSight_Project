#!/usr/bin/env python3
"""Test Wizard of Oz vs Inaugural corpus to verify under-represented words fix"""
import sys
sys.path.insert(0, 'api/utils')

from keyness import analyze_keyness
import mammoth

# Load Wizard of Oz from docx
print("Loading Wizard of Oz from docx file...")
with open('fake-text-samples/The Wonderful Wizard of Oz.docx', 'rb') as docx_file:
    result = mammoth.extract_raw_text(docx_file)
    oz_text = result.value

print(f"Loaded {len(oz_text)} characters")
print(f"First 200 chars: {oz_text[:200]}")

# Test against inaugural corpus (smallest - presidential speeches)
print("\n" + "="*80)
print("Testing: Wizard of Oz vs Inaugural Addresses Corpus")
print("="*80)

result = analyze_keyness(oz_text, 'inaugural')

print(f"\nWizard of Oz stats:")
print(f"  Total words: {result['total_words']:,}")
print(f"  Unique words: {result['unique_words']:,}")
print(f"  Significant keywords: {result['significant_keywords']:,}")

print(f"\nInaugural corpus:")
print(f"  {result['corpus']['display_name']}")
print(f"  {result['corpus']['description']}")
print(f"  Total words: {result['corpus']['total_words']:,}")

# Separate by effect size
over_rep = [k for k in result['keywords'] if k['effect_size'] > 0]
under_rep = [k for k in result['keywords'] if k['effect_size'] < 0]

print("\n" + "="*80)
print(f"RESULTS:")
print(f"  Over-represented words (distinctive to Oz): {len(over_rep)}")
print(f"  Under-represented words (common in speeches, rare in Oz): {len(under_rep)}")
print("="*80)

if under_rep:
    print("\n*** SUCCESS! Found under-represented words! ***")
    print("\nTop 20 Under-represented words (common in presidential speeches, rare in Oz):")
    print(f"{'Word':<15} {'Oz Freq':<10} {'Expected':<12} {'Effect Size':<12} {'LL Score':<10} {'Sig'}")
    print("-" * 85)
    for k in sorted(under_rep, key=lambda x: x['effect_size'])[:20]:
        print(f"{k['word']:<15} {k['user_freq']:<10} {k['corpus_freq']:<12.2f} {k['effect_size']:<12.4f} {k['ll_score']:<10.2f} {k['significance']}")

    print("\nExpected words like: 'government', 'nation', 'citizens', 'constitution', etc.")
else:
    print("\n*** FAILURE! No under-represented words found! ***")
    print("This means the fix didn't work.")

if over_rep:
    print("\n\nTop 20 Over-represented words (distinctive to Wizard of Oz):")
    print(f"{'Word':<15} {'Oz Freq':<10} {'Expected':<12} {'Effect Size':<12} {'LL Score':<10} {'Sig'}")
    print("-" * 85)
    for k in sorted(over_rep, key=lambda x: x['effect_size'], reverse=True)[:20]:
        print(f"{k['word']:<15} {k['user_freq']:<10} {k['corpus_freq']:<12.2f} {k['effect_size']:<12.4f} {k['ll_score']:<10.2f} {k['significance']}")

    print("\nExpected words like: 'dorothy', 'scarecrow', 'wizard', 'lion', 'tin', etc.")

print("\n" + "="*80)
