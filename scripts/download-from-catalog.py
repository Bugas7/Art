#!/usr/bin/env python3
"""
Download artwork images from Singulart catalog.

This script downloads main, detail, and interior images for artworks
that are missing photos. It uses the full_catalog.json file.

Usage:
    python3 scripts/download-from-catalog.py [--dry-run] [--limit N] [--all]
"""

import argparse
import json
import os
import re
import sys
import time
import urllib.request
from pathlib import Path

# Paths
SCRIPT_DIR = Path(__file__).parent
ROOT_DIR = SCRIPT_DIR.parent
ARTWORKS_FILE = ROOT_DIR / 'src' / 'data' / 'artworks.ts'
IMAGE_DIR = ROOT_DIR / 'public' / 'images' / 'artworks'
CATALOG_FILE = SCRIPT_DIR / 'full_catalog.json'

def read_artworks_ts():
    """Extract artwork IDs and titles from TypeScript file."""
    with open(ARTWORKS_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    id_regex = r'"id":\s*"([^"]+)"'
    ids = re.findall(id_regex, content)
    return ids

def find_artworks_needing_images(db_ids):
    """Find artworks that need image downloads."""
    needs_images = []
    
    for artwork_id in db_ids:
        artwork_dir = IMAGE_DIR / artwork_id
        
        # Check if directory exists
        if not artwork_dir.exists():
            artwork_dir.mkdir(parents=True, exist_ok=True)
        
        # Check for main image
        has_main = any(artwork_dir.glob('main.*'))
        
        if not has_main:
            needs_images.append(artwork_id)
    
    return needs_images

def download_image(url, output_path):
    """Download a single image."""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            'Referer': 'https://www.singulart.com/'
        }
        req = urllib.request.Request(url, headers=headers)
        
        with urllib.request.urlopen(req, timeout=30) as response:
            data = response.read()
        
        with open(output_path, 'wb') as f:
            f.write(data)
        
        size_kb = len(data) / 1024
        return True, size_kb
    except Exception as e:
        return False, str(e)

def get_artwork_page_urls(artwork_url):
    """Download artwork page and extract all image URLs."""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        }
        req = urllib.request.Request(artwork_url, headers=headers)
        
        with urllib.request.urlopen(req, timeout=30) as response:
            html = response.read().decode('utf-8')
        
        # Extract all image URLs from the page
        # Look for various patterns
        image_urls = []
        
        # Pattern 1: image-sh URLs with signature
        pattern1 = r'(https://www\.singulart\.com/images-sh/[^"\s\?]+\?signature=[^"\s]+)'
        image_urls.extend(re.findall(pattern1, html))
        
        # Pattern 2: artworks/v2/cropped images
        pattern2 = r'(https://www\.singulart\.com/images/artworks/v2/cropped/[^"\s\?]+)'
        image_urls.extend(re.findall(pattern2, html))
        
        # Pattern 3: General image URLs
        pattern3 = r'(https://www\.singulart\.com/images/[^"\s]+\.(jpg|jpeg|png|webp))'
        matches = re.findall(pattern3, html)
        image_urls.extend([m[0] for m in matches])
        
        # Remove duplicates and filter
        unique_urls = list(dict.fromkeys(image_urls))  # Preserve order
        
        return unique_urls[:10]  # Limit to 10 images max
    except Exception as e:
        print(f"  ⚠️  Error: {e}")
        return []

def download_images_for_artwork(artwork_id, catalog_entry, dry_run=False):
    """Download images for a single artwork."""
    directory = IMAGE_DIR / artwork_id
    
    print(f"\n📥 {artwork_id}")
    if catalog_entry:
        print(f"   Title: {catalog_entry.get('title', 'Unknown')}")
        print(f"   URL: {catalog_entry.get('url', 'N/A')}")
    
    if dry_run:
        print("   [DRY RUN] Would download images")
        return True
    
    # Try to get URLs from artwork page
    image_urls = []
    if catalog_entry and catalog_entry.get('url'):
        print(f"   Fetching page...")
        image_urls = get_artwork_page_urls(catalog_entry['url'])
        time.sleep(1)  # Be polite
    
    if not image_urls:
        print(f"   ⚠️  No images found")
        return False
    
    # Download images
    downloaded = 0
    for idx, url in enumerate(image_urls[:7]):  # Max 7 images per artwork
        # Determine filename
        if idx == 0:
            filename = 'main.png'
        elif idx <= 3:
            filename = f'detail-{idx}.png'
        else:
            filename = f'interior-{idx-3}.png'
        
        output_path = directory / filename
        
        print(f"   ⬇️  {filename}...", end=' ')
        
        success, result = download_image(url, output_path)
        if success:
            print(f"✓ ({result:.0f} KB)")
            downloaded += 1
        else:
            print(f"✗ {result}")
        
        time.sleep(0.5)  # Be polite
    
    print(f"   ✅ Downloaded {downloaded}/{len(image_urls[:7])} images")
    return downloaded > 0

def main():
    parser = argparse.ArgumentParser(description='Download artwork images from Singulart catalog')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be downloaded')
    parser.add_argument('--limit', type=int, default=0, help='Limit number of artworks (0 = all)')
    parser.add_argument('--all', action='store_true', help='Process all artworks including those with images')
    args = parser.parse_args()
    
    print('═' * 70)
    print('  DOWNLOAD ARTWORK IMAGES FROM SINGULART')
    print('═' * 70)
    
    # Load catalog
    if not CATALOG_FILE.exists():
        print(f"\n❌ Catalog file not found: {CATALOG_FILE}")
        print("Run: python3 scripts/fetch_singulart_catalog.py --artist-url <URL> --output scripts/full_catalog.json")
        sys.exit(1)
    
    with open(CATALOG_FILE, 'r', encoding='utf-8') as f:
        catalog_data = json.load(f)
    
    catalog_artworks = catalog_data.get('artworks', [])
    print(f"\n📚 Loaded catalog: {len(catalog_artworks)} artworks")
    
    # Create catalog lookup by slug
    catalog_lookup = {}
    for art in catalog_artworks:
        # Create slug from title
        title = art.get('title', '')
        slug = title.lower().replace(' ', '-').replace("'", '').replace('"', '').replace(',', '')
        catalog_lookup[slug] = art
    
    # Get database IDs
    db_ids = read_artworks_ts()
    print(f"📊 Database: {len(db_ids)} artworks")
    
    # Find artworks needing images
    needs_images = find_artworks_needing_images(db_ids)
    
    if not args.all:
        print(f"\n⚠️  Found {len(needs_images)} artworks needing images")
    else:
        needs_images = db_ids
        print(f"\n🔄 Processing all {len(needs_images)} artworks")
    
    if args.limit > 0:
        needs_images = needs_images[:args.limit]
        print(f"⚠️  Limited to first {args.limit} artworks")
    
    if args.dry_run:
        print("\n🔍 DRY RUN MODE\n")
    
    # Process each artwork
    success_count = 0
    fail_count = 0
    
    for idx, artwork_id in enumerate(needs_images, 1):
        print(f"\n[{idx}/{len(needs_images)}] {artwork_id}")
        
        # Find in catalog
        catalog_entry = catalog_lookup.get(artwork_id)
        
        success = download_images_for_artwork(artwork_id, catalog_entry, args.dry_run)
        if success:
            success_count += 1
        else:
            fail_count += 1
        
        # Be polite between artworks
        if idx < len(needs_images):
            time.sleep(2)
    
    # Summary
    print('\n' + '═' * 70)
    print('  SUMMARY')
    print('═' * 70)
    print(f"\n  Success: {success_count}")
    print(f"  Failed:  {fail_count}")
    print(f"  Total:   {len(needs_images)}")
    
    if args.dry_run:
        print("\n  💡 Remove --dry-run to actually download images.\n")
    else:
        print(f"\n  💡 Run 'npm run check-images' to verify downloads.\n")

if __name__ == '__main__':
    main()
