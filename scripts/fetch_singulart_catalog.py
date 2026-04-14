import argparse
import os
import re
import urllib.request
import json

def download_page(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as response:
        return response.read().decode('utf-8')

def extract_artworks_from_initial_state(html):
    # Find window.__INITIAL_STATE__
    match = re.search(r'window\.__INITIAL_STATE__\s*=\s*({.*?});', html, re.DOTALL)
    if not match:
        # Try finding the largest JSON block
        matches = re.findall(r'({.*?})', html, re.DOTALL)
        # This is very rough, let's try JSON-LD instead
        ld_matches = re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.DOTALL)
        artworks = []
        for ld in ld_matches:
            try:
                data = json.loads(ld)
                # Check if it's an ItemList of Products
                if data.get('@type') == 'ItemList':
                    for item in data.get('itemListElement', []):
                        prod = item.get('item')
                        if prod and prod.get('@type') == 'Product':
                            artworks.append({
                                'title': prod.get('name'),
                                'url': prod.get('offers', {}).get('url'),
                                'id': prod.get('offers', {}).get('url', '').split(' ')[-1] if prod.get('offers', {}).get('url') else '',
                                'image': prod.get('image'),
                                'description': prod.get('description')
                            })
            except:
                continue
        return artworks
    return []

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--artist-url', required=True)
    parser.add_argument('--output', required=True)
    args = parser.parse_args()

    all_artworks = []
    seen_ids = set()

    for page in range(1, 11):
        url = f"{args.artist_url}?page={page}"
        print(f"Fetching page {page}...")
        html = download_page(url)
        artworks = extract_artworks_from_initial_state(html)
        
        if not artworks:
            break
            
        found_new = False
        for art in artworks:
            if art['id'] not in seen_ids:
                all_artworks.append(art)
                seen_ids.add(art['id'])
                found_new = True
        
        if not found_new:
            break
            
        print(f"  Found {len(artworks)} items")

    # Generate slug
    for art in all_artworks:
        # Title to slug: lowercase, replace spaces with hyphen
        slug = art['title'].lower().replace(' ', '-').replace("'", "").replace('"', "")
        art['slug'] = slug

    with open(args.output, 'w', encoding='utf-8') as f:
        json.dump({'artworks': all_artworks}, f, indent=2, ensure_ascii=False)
    
    print(f"Saved {len(all_artworks)} artworks to {args.output}")

if __name__ == "__main__":
    main()
