import requests
from bs4 import BeautifulSoup
import re

def scrape_wikipedia(url: str):
    """
    Fetches a Wikipedia URL and extracts the text.
    
    Version 9: The "Correct Selector" Fix.
    We are now using a 2-step find to get the REAL content div
    and not the fake "icon" divs.
    
    Args:
        url: The full URL of the Wikipedia article.

    Returns:
        A dictionary containing:
        - "title": The main title of the article.
        - "clean_text": The cleaned, concatenated text of the article.
        - "sections": An empty list (we are skipping this for now for reliability).
    """
    try:
        # 1. Fetch the HTML content
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers)
        response.raise_for_status() # Check for errors

        # 2. Parse the HTML using LXML
        soup = BeautifulSoup(response.text, 'lxml')

        # 3. Extract the Title
        title_tag = soup.find('h1', {'id': 'firstHeading'})
        title = title_tag.text if title_tag else "Wikipedia Article"

        # 4. --- THIS IS THE FIX ---
        # Step 1: Find the main content container by its unique ID
        main_container = soup.find('div', {'id': 'mw-content-text'})
        
        if not main_container:
            raise ValueError("Could not find main container div ('#mw-content-text').")
            
        # Step 2: From *within* that container, find the parser-output div
        content_div = main_container.find('div', class_='mw-parser-output')
        
        if not content_div:
            raise ValueError("Could not find content div ('mw-parser-output') inside main container.")

        # 5. --- "Do No Harm" Text Extraction ---
        # Get ALL text from the correct div
        full_text = content_div.get_text()

        # 6. --- Minimal Cleaning (with Regex) ---
        # Remove the citation links like [1], [2], [edit], etc.
        clean_text = re.sub(r'\[\d+\]|\[edit\]|\[\w+\s\w+\]', ' ', full_text)
        
        # Remove extra whitespace and newlines
        clean_text = re.sub(r'\s+', ' ', clean_text).strip()
        
        sections = [] # Skipping for now

        return {
            "title": title,
            "clean_text": clean_text,
            "sections": sections
        }

    except requests.exceptions.RequestException as e:
        print(f"Error fetching URL: {e}")
        return None
    except Exception as e:
        print(f"Error scraping content: {e}")
        return None

# --- You can run this file directly to test it ---
if __name__ == "__main__":
    test_url = "https://en.wikipedia.org/wiki/Alan_Turing"
    
    print(f"--- Scraping {test_url} ---")
    scraped_data = scrape_wikipedia(test_url)
    
    if scraped_data:
        print(f"\nTITLE:\n{scraped_data['title']}")
        
        print(f"\n--- CLEAN TEXT (first 500 chars) ---")
        if scraped_data['clean_text']:
            print(scraped_data['clean_text'][:500] + "...")
        else:
            print("No clean text found.")
    else:
        print("Scraping failed.")