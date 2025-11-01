#!/usr/bin/env python3
from nltk.corpus import brown, gutenberg, reuters, inaugural

# Corpus metadata: (display_name, simple_description, full_description, loader_function)
CORPORA = {
    'brown': {
        'display_name': 'Brown Corpus',
        'simple_description': 'Balanced American English',
        'full_description': 'Balanced corpus of American English across multiple genres',
        'loader': brown.words
    },
    'gutenberg': {
        'display_name': 'Project Gutenberg',
        'simple_description': 'Classic literature',
        'full_description': 'Classic literature from 19th and early 20th century',
        'loader': gutenberg.words
    },
    'reuters': {
        'display_name': 'Reuters Corpus',
        'simple_description': 'News articles',
        'full_description': 'Newswire articles from Reuters',
        'loader': reuters.words
    },
    'inaugural': {
        'display_name': 'Inaugural Addresses Corpus',
        'simple_description': 'Presidential speeches',
        'full_description': 'U.S. Presidential inaugural addresses',
        'loader': inaugural.words
    }
}
