import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))

from scraper import scrape_wikipedia_article
# from llm_service import generate_quiz_from_text

def test_scraper():
    url = "https://en.wikipedia.org/wiki/Python_(programming_language)"
    print(f"Testing Scraper with URL: {url}")
    try:
        data = scrape_wikipedia_article(url)
        print(f"Success! Title: {data['title']}")
        print(f"Content length: {len(data['content'])} characters")
        print(f"Sections found: {len(data['sections'])}")
        print("First 200 chars:", data['content'][:200])
    except Exception as e:
        print(f"Scraper failed: {e}")

if __name__ == "__main__":
    test_scraper()
    # Note: LLM test requires valid API KEY
    from llm_service import generate_quiz_from_text
    print("\nTesting LLM...")
    try:
         data = generate_quiz_from_text("Python", "Python is a programming language.")
         print("LLM Success!", data)
    except Exception as e:
         print("LLM Failed:", e)
