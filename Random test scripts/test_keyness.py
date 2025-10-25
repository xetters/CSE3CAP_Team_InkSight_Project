#!/usr/bin/env python3
"""Diagnostic menu for keyness analysis bug investigation"""
import json
import sys
import math
sys.path.insert(0, 'api/utils')

from nltk import word_tokenize, FreqDist
from nltk.corpus import brown
from keyness import analyze_keyness, log_likelihood, effect_size, tokenize

# Global variables for caching
user_tokens = None
user_freq = None
user_total = None
corpus_tokens = None
corpus_freq = None
corpus_total = None

def load_data():
    """Load and cache user text and corpus data"""
    global user_tokens, user_freq, user_total, corpus_tokens, corpus_freq, corpus_total

    print("\n⏳ Loading data...")

    # Load user text
    with open('fake-text-samples/under300words.txt', 'r', encoding='utf-8') as f:
        text = f.read()

    user_tokens = tokenize(text)
    user_freq = FreqDist(user_tokens)
    user_total = len(user_tokens)

    # Load corpus
    corpus_tokens = [w.lower() for w in brown.words() if w.isalpha() and len(w) >= 3]
    corpus_freq = FreqDist(corpus_tokens)
    corpus_total = len(corpus_tokens)

    print("✓ Data loaded successfully!\n")

def test_corpus_stats():
    """Test 1: Display Brown corpus statistics"""
    print("\n" + "="*60)
    print("TEST 1: BROWN CORPUS STATISTICS")
    print("="*60)

    print(f"Total words: {corpus_total:,}")
    print(f"Unique words: {len(corpus_freq):,}")
    print(f"\nTop 20 most frequent words:")
    print(f"{'Rank':<6} {'Word':<15} {'Count':<10} {'% of corpus'}")
    print("-" * 60)

    for i, (word, count) in enumerate(corpus_freq.most_common(20), 1):
        percentage = (count / corpus_total) * 100
        print(f"{i:<6} {word:<15} {count:<10,} {percentage:.4f}%")

def test_user_stats():
    """Test 2: Display user text statistics"""
    print("\n" + "="*60)
    print("TEST 2: USER TEXT STATISTICS (under300words.txt)")
    print("="*60)

    print(f"Total words: {user_total}")
    print(f"Unique words: {len(user_freq)}")
    print(f"\nTop 20 most frequent words:")
    print(f"{'Rank':<6} {'Word':<15} {'Count':<10} {'% of text'}")
    print("-" * 60)

    for i, (word, count) in enumerate(user_freq.most_common(20), 1):
        percentage = (count / user_total) * 100
        print(f"{i:<6} {word:<15} {count:<10} {percentage:.2f}%")

def test_word_overlap():
    """Test 3: Check which top corpus words are missing from user text"""
    print("\n" + "="*60)
    print("TEST 3: WORD OVERLAP ANALYSIS")
    print("="*60)

    top_corpus = corpus_freq.most_common(50)

    print(f"\nChecking top 50 corpus words against user text:\n")
    print(f"{'Word':<15} {'Corpus Count':<15} {'User Count':<12} {'Status'}")
    print("-" * 60)

    missing_count = 0
    present_count = 0

    for word, corpus_count in top_corpus:
        user_count = user_freq.get(word, 0)
        status = "MISSING ❌" if user_count == 0 else "Present ✓"

        if user_count == 0:
            missing_count += 1
        else:
            present_count += 1

        print(f"{word:<15} {corpus_count:<15,} {user_count:<12} {status}")

    print("\n" + "-" * 60)
    print(f"Summary: {present_count} present, {missing_count} missing from user text")

def test_ll_calculation():
    """Test 4: Test log-likelihood calculations for specific words"""
    print("\n" + "="*60)
    print("TEST 4: LOG-LIKELIHOOD CALCULATIONS")
    print("="*60)

    # Test words with different scenarios
    test_words = []

    # Get top corpus words
    top_corpus = dict(corpus_freq.most_common(30))

    # Find words with different characteristics
    for word in top_corpus:
        user_count = user_freq.get(word, 0)
        if user_count == 0:
            test_words.append((word, user_count, top_corpus[word], "Missing"))
            if len([w for w in test_words if w[3] == "Missing"]) >= 3:
                break

    # Add some words that are present
    for word, user_count in user_freq.most_common(3):
        corpus_count = corpus_freq.get(word, 1)
        test_words.append((word, user_count, corpus_count, "Present"))

    print(f"\nTesting LL calculation for {len(test_words)} words:\n")
    print(f"{'Word':<15} {'User':<8} {'Corpus':<10} {'LL Score':<12} {'Significant?':<12} {'Type'}")
    print("-" * 80)

    for word, user_count, corpus_count, word_type in test_words:
        # This is what the current code does
        corpus_count_adjusted = max(corpus_count, 1)

        if user_count > 0:
            ll = log_likelihood(user_count, corpus_count_adjusted, user_total, corpus_total)
            sig = "YES (p<0.05)" if ll >= 3.84 else "NO"
            print(f"{word:<15} {user_count:<8} {corpus_count:<10,} {ll:<12.4f} {sig:<12} {word_type}")
        else:
            # For missing words, show what SHOULD happen
            print(f"{word:<15} {user_count:<8} {corpus_count:<10,} {'N/A':<12} {'SKIPPED':<12} {word_type} ⚠️")

    print("\n⚠️  Note: Words with user_count=0 are SKIPPED by current code!")

def test_effect_size():
    """Test 5: Test effect size calculations"""
    print("\n" + "="*60)
    print("TEST 5: EFFECT SIZE CALCULATIONS")
    print("="*60)

    # Find some test cases
    test_cases = []

    # Words present in user text
    for word, user_count in user_freq.most_common(5):
        corpus_count = max(corpus_freq.get(word, 0), 1)
        es = effect_size(user_count, corpus_count, user_total, corpus_total)
        test_cases.append((word, user_count, corpus_count, es, "Present"))

    print(f"\nTesting effect size for words in user text:\n")
    print(f"{'Word':<15} {'User Freq':<12} {'Corpus Freq':<15} {'Effect Size':<15} {'Direction'}")
    print("-" * 80)

    for word, user_count, corpus_count, es, word_type in test_cases:
        direction = "Over-rep ⬆️" if es > 0 else "Under-rep ⬇️" if es < 0 else "Neutral"
        print(f"{word:<15} {user_count:<12} {corpus_count:<15,} {es:<15.4f} {direction}")

    # Simulate what SHOULD happen for missing words
    print(f"\n\nSimulation: What SHOULD happen for missing corpus words:\n")
    print(f"{'Word':<15} {'User Freq':<12} {'Corpus Freq':<15} {'Effect Size':<15} {'Direction'}")
    print("-" * 80)

    for word, count in corpus_freq.most_common(5):
        if user_freq.get(word, 0) == 0:
            # Simulate with smoothing
            es = effect_size(0.5, count + 0.5, user_total, corpus_total)
            direction = "Under-rep ⬇️" if es < 0 else "Over-rep ⬆️"
            print(f"{word:<15} {0:<12} {count:<15,} {es:<15.4f} {direction}")

def test_full_analysis():
    """Test 6: Run full keyness analysis and show results"""
    print("\n" + "="*60)
    print("TEST 6: FULL KEYNESS ANALYSIS")
    print("="*60)

    with open('fake-text-samples/under300words.txt', 'r', encoding='utf-8') as f:
        text = f.read()

    result = analyze_keyness(text, 'brown')

    print(f"\nTotal words: {result['total_words']}")
    print(f"Unique words: {result['unique_words']}")
    print(f"Significant keywords: {result['significant_keywords']}")

    # Separate by effect size
    over_rep = [k for k in result['keywords'] if k['effect_size'] > 0]
    under_rep = [k for k in result['keywords'] if k['effect_size'] < 0]

    print(f"\n{'='*60}")
    print(f"Over-represented words: {len(over_rep)}")
    print(f"Under-represented words: {len(under_rep)} ⚠️")
    print(f"{'='*60}")

    if over_rep:
        print(f"\nTop 10 Over-represented words:")
        print(f"{'Word':<15} {'User Freq':<12} {'Corpus Freq':<15} {'Effect Size':<12} {'LL Score'}")
        print("-" * 75)
        for k in sorted(over_rep, key=lambda x: x['effect_size'], reverse=True)[:10]:
            print(f"{k['word']:<15} {k['user_freq']:<12} {k['corpus_freq']:<15.2f} {k['effect_size']:<12.4f} {k['ll_score']:.2f}")

    if under_rep:
        print(f"\nTop 10 Under-represented words:")
        print(f"{'Word':<15} {'User Freq':<12} {'Corpus Freq':<15} {'Effect Size':<12} {'LL Score'}")
        print("-" * 75)
        for k in sorted(under_rep, key=lambda x: x['effect_size'])[:10]:
            print(f"{k['word']:<15} {k['user_freq']:<12} {k['corpus_freq']:<15.2f} {k['effect_size']:<12.4f} {k['ll_score']:.2f}")
    else:
        print(f"\n❌ NO UNDER-REPRESENTED WORDS FOUND - THIS IS THE BUG!")

def test_check_negatives():
    """Test 7: Specifically look for negative effect sizes"""
    print("\n" + "="*60)
    print("TEST 7: CHECK FOR NEGATIVE EFFECT SIZES")
    print("="*60)

    print("\nManually checking all words in user text for negative effect sizes...\n")

    negative_words = []

    for word, user_count in user_freq.items():
        corpus_count = max(corpus_freq.get(word, 0), 1)
        es = effect_size(user_count, corpus_count, user_total, corpus_total)
        ll = log_likelihood(user_count, corpus_count, user_total, corpus_total)

        if es < 0 and ll >= 3.84:
            negative_words.append({
                'word': word,
                'user_freq': user_count,
                'corpus_freq': corpus_count,
                'effect_size': es,
                'll_score': ll
            })

    print(f"Found {len(negative_words)} words with negative effect size and LL >= 3.84\n")

    if negative_words:
        print(f"{'Word':<15} {'User Freq':<12} {'Corpus Freq':<15} {'Effect Size':<12} {'LL Score'}")
        print("-" * 75)
        for k in sorted(negative_words, key=lambda x: x['effect_size'])[:20]:
            print(f"{k['word']:<15} {k['user_freq']:<12} {k['corpus_freq']:<15} {k['effect_size']:<12.4f} {k['ll_score']:.2f}")
    else:
        print("❌ No words with negative effect size found!")
        print("\nThis could mean:")
        print("1. The short text doesn't have enough data for statistical significance")
        print("2. Words that ARE under-represented have user_count=0 and aren't checked")

def show_menu():
    """Display the diagnostic menu"""
    print("\n" + "="*60)
    print("KEYNESS ANALYSIS DIAGNOSTIC MENU")
    print("="*60)
    print("\n1. Test Corpus Stats (Brown corpus)")
    print("2. Test User Text Stats (under300words.txt)")
    print("3. Test Word Overlap (which corpus words are missing?)")
    print("4. Test Log-Likelihood Calculation")
    print("5. Test Effect Size Calculation")
    print("6. Run Full Keyness Analysis")
    print("7. Check for Negative Effect Sizes")
    print("8. Run All Tests")
    print("9. Exit")
    print("\n" + "="*60)

def run_all_tests():
    """Run all diagnostic tests"""
    tests = [
        test_corpus_stats,
        test_user_stats,
        test_word_overlap,
        test_ll_calculation,
        test_effect_size,
        test_full_analysis,
        test_check_negatives
    ]

    for test in tests:
        test()
        input("\nPress Enter to continue to next test...")

def main():
    """Main menu loop"""
    print("\n🔬 KEYNESS ANALYSIS DIAGNOSTIC TOOL")
    print("Investigating the missing under-represented words bug\n")

    load_data()

    while True:
        show_menu()
        choice = input("Select a test (1-9): ").strip()

        if choice == '1':
            test_corpus_stats()
        elif choice == '2':
            test_user_stats()
        elif choice == '3':
            test_word_overlap()
        elif choice == '4':
            test_ll_calculation()
        elif choice == '5':
            test_effect_size()
        elif choice == '6':
            test_full_analysis()
        elif choice == '7':
            test_check_negatives()
        elif choice == '8':
            run_all_tests()
        elif choice == '9':
            print("\n👋 Exiting diagnostic tool. Good luck with the fix!\n")
            break
        else:
            print("\n❌ Invalid choice. Please select 1-9.")

        input("\nPress Enter to return to menu...")

if __name__ == '__main__':
    main()
