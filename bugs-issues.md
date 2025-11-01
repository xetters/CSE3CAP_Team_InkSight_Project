# Known Issues

## Keyness Statistics: Under-Represented Words Not Detected in Short Texts

**Issue:** Texts under approximately 1,000 words do not show under-represented keywords (words common in the reference corpus but rare/absent in the user's text).

**Root Cause:** Statistical limitation, not a code bug. The log-likelihood significance test (LL >= 3.84, p < 0.05) requires sufficient sample size to detect meaningful differences. Very short texts lack the statistical power needed for reliable significance testing of under-represented words.

**Test Results:**
- 179 words: 0 under-represented words detected
- 1,111 words: 4 under-represented words detected
- 31,444 words: 353 under-represented words detected

**Recommendation:** Keyness analysis is most reliable for texts of 1,000+ words. This is consistent with corpus linguistics best practices.

**Status:** Working as intended. This is a known limitation of the statistical method, not a software bug.

## FastText Model: Copyright Compliance Issue

**Issue:** Current `cc.en.100.bin` (Common Crawl) model violates copyright constraints by being trained on entire web including copyrighted sources.

**Fix:** Replace with FastText Wikipedia model, reduce to 100 dimensions, and load identically—Wikipedia is CC-BY-SA 3.0 licensed and more defensibly copyright-compliant than web-scraped Common Crawl data.

## More things to consider:

Common word filter: "the" "and" "of" "a"?

#ALSO!
need c++ build tools for windows python installation
pip install fasttext-wheel
make python script for automating the installation?

## Example fast text fast setup:

FastText setup


Install required Python packages:
pip install fasttext-wheel scikit-learn numpy gensim



Download the English FastText model:
git clone https://github.com/facebookresearch/fastText.git
cd fastText
python download_model.py en



Move the downloaded file cc.en.300.bin into your project’s models folder.


Example use:
import fasttext
model = fasttext.load_model("models/cc.en.300.bin")


