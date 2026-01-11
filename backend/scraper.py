import requests
from bs4 import BeautifulSoup
import re

def scrape_wikipedia_article(url: str):
    headers = {
        "User-Agent": "AIQuizGenerator/1.0 (mailto:your-email@example.com) python-requests/2.25"
    }
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
    except requests.RequestException as e:
        raise ValueError(f"Failed to fetch URL: {e}")

    soup = BeautifulSoup(response.content, 'html.parser')

    # Remove script and style elements
    for script in soup(["script", "style", "aside", "nav", "footer"]):
        script.extract()

    title = soup.find('h1', id='firstHeading')
    title_text = title.get_text().strip() if title else "Unknown Title"

    content_div = soup.find('div', id='mw-content-text')
    if not content_div:
        content_div = soup.find('div', id='bodyContent')
    if not content_div:
        raise ValueError("Could not find article content.")

    # Extract text from paragraphs
    paragraphs = content_div.find_all('p')
    # Limit to reasonable amount of text to avoid context window limits (e.g. first 15k chars)
    # Most quizzes can be generated from the introduction and first few sections.
    
    full_text = ""
    for p in paragraphs:
        text = p.get_text().strip()
        if text:
            full_text += text + "\n\n"
    
    # Heuristic for sections - typically h2
    sections = []
    for header in content_div.find_all('h2'):
        header_text = header.get_text().replace('[edit]', '').strip()
        if header_text and header_text not in ["Contents", "See also", "References", "External links", "Notes"]:
            sections.append(header_text)

    return {
        "title": title_text,
        "content": full_text[:20000], # Cap at 20k chars
        "sections": sections,
        "url": url
    }
