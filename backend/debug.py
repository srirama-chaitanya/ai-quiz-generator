import requests

url = "https://en.wikipedia.org/wiki/Alan_Turing"

# --- NEW: Pretend to be a real browser ---
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

print(f"--- Attempting to fetch {url} ---")

try:
    response = requests.get(url, headers=headers)
    
    # Check if we got an error (like 403 Forbidden)
    response.raise_for_status() 
    
    print(f"HTTP Status Code: {response.status_code}")

    # Save the raw HTML content to a file
    with open("debug.html", "w", encoding="utf-8") as f:
        f.write(response.text)
        
    print("\n--- SUCCESS ---")
    print("Saved the page to debug.html.")
    
except requests.exceptions.RequestException as e:
    print(f"\n--- ERROR ---")
    print(f"The request FAILED: {e}")
    print("This confirms we are likely being blocked by the server.")