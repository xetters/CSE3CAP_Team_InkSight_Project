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


## More things to consider:

Common word filter: "the" "and" "of" "a"?