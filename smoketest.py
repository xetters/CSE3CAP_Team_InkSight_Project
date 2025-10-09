#!/usr/bin/env python3
"""
InkSight Smoketest - End-to-end verification
Tests the complete flow: upload → analyze → results
"""
import sys
import requests
import time
from pathlib import Path

API_URL = "http://localhost:3000/api/analyze-file"
SAMPLE_TEXT = """
The quick brown fox jumps over the lazy dog.
This is a sample text for testing InkSight.
The analysis should return word counts and statistics.
"""

def create_test_file():
    """Create a temporary test file"""
    test_file = Path("test_sample.txt")
    test_file.write_text(SAMPLE_TEXT)
    return test_file

def test_api(file_path):
    """Test the analyze endpoint"""
    print("🧪 Testing InkSight API...")
    
    try:
        with open(file_path, 'rb') as f:
            files = {'file': ('test.txt', f, 'text/plain')}
            response = requests.post(API_URL, files=files, timeout=10)
        
        if response.status_code != 200:
            print(f"❌ Failed: HTTP {response.status_code}")
            print(f"   Response: {response.text}")
            return False
        
        data = response.json()
        
        # Validate response structure
        required_keys = ['word_count', 'top', 'insight']
        missing = [k for k in required_keys if k not in data]
        
        if missing:
            print(f"❌ Failed: Missing keys {missing}")
            return False
        
        # Display results
        print("✅ Success! API response:")
        print(f"   Word count: {data['word_count']}")
        print(f"   Insight: {data['insight']}")
        top_words = [f"{w['w']}({w['n']})" for w in data['top'][:3]]
        print(f"   Top words: {top_words}")
        
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Failed: Cannot connect to server")
        print("   Make sure the server is running on http://localhost:3000")
        return False
    except Exception as e:
        print(f"❌ Failed: {e}")
        return False

def main():
    print("=" * 50)
    print("InkSight Smoketest")
    print("=" * 50)
    
    # Check if server is running
    print("\n📡 Checking server...")
    try:
        response = requests.get("http://localhost:3000", timeout=5)
        print("✅ Server is running")
    except:
        print("❌ Server not responding")
        print("   Run: node api/app.js")
        sys.exit(1)
    
    # Create test file
    print("\n📝 Creating test file...")
    test_file = create_test_file()
    print(f"✅ Created {test_file}")
    
    # Test API
    print()
    success = test_api(test_file)
    
    # Cleanup
    print("\n🧹 Cleaning up...")
    test_file.unlink()
    print("✅ Test file removed")
    
    # Summary
    print("\n" + "=" * 50)
    if success:
        print("✅ All tests passed!")
        print("=" * 50)
        sys.exit(0)
    else:
        print("❌ Tests failed")
        print("=" * 50)
        sys.exit(1)

if __name__ == "__main__":
    main()