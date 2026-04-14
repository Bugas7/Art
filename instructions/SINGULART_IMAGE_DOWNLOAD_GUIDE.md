# Инструкция: Скачивание фотографий картин с Singulart

## Обзор метода

Singulart хранит изображения на CDN с подписанными URL (signed URLs). Ключ к получению всех фотографий картины — извлечь base64-encoded параметры из HTML страницы и получить URL изображений в максимальном разрешении.

---

## Шаг 1: Скачать HTML страницу картины

```bash
ARTWORK_URL="https://www.singulart.com/en/artworks/iryna-barabash-skeleton-in-the-studio-2146432"

curl -s -L \
  -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
  -H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9" \
  -H "Accept-Language: en-US,en;q=0.9" \
  "$ARTWORK_URL" -o /tmp/singulart-page.html
```

---

## Шаг 2: Извлечь все image-sh URL из HTML

```python
import re

with open('/tmp/singulart-page.html', 'r') as f:
    html_content = f.read()

# Паттерн для извлечения signed URLs
pattern = r'(https://www\.singulart\.com/images-sh/([A-Za-z0-9+/=]+))\?signature=([a-f0-9]+)'
matches = re.findall(pattern, html_content)

print(f"Found {len(matches)} image URLs")
```

---

## Шаг 3: Декодировать base64 для понимания структуры изображений

```python
import base64
import json

image_data = []
for full_url, b64_part, signature in matches:
    try:
        # Добавить padding если нужно
        padding = 4 - (len(b64_part) % 4)
        if padding != 4:
            b64_part_padded = b64_part + '=' * padding
        else:
            b64_part_padded = b64_part
        
        # Декодировать base64 → JSON
        decoded = base64.b64decode(b64_part_padded).decode('utf-8')
        data = json.loads(decoded)
        key = data.get('key', '')
        
        # Извлечь размер изображения
        width = data.get('edits', {}).get('resize', {}).get('width', 0)
        
        # Определить тип изображения из key
        # Примеры key:
        # artworks/v2/cropped/63359/main/zoom/2146432_35998df....jpeg  → main
        # artworks/v2/cropped/63359/alts/zoom/alt_2146432_66e294....jpeg → alternate view
        
        image_data.append({
            'url': full_url,
            'key': key,
            'width': width,
        })
    except:
        pass
```

---

## Шаг 4: Отфильтровать только изображения нужной картины

```python
# Фильтр по artwork ID (например, 2146432)
ARTWORK_ID = "2146432"

artwork_images = [
    img for img in image_data 
    if 'artworks' in img['key'] 
    and ARTWORK_ID in img['key']
    and '/zoom/' in img['key']  # Только highest resolution
]

print(f"Found {len(artwork_images)} images for artwork {ARTWORK_ID}")
```

---

## Шаг 5: Группировать по уникальному изображению и выбрать максимальное разрешение

```python
# Каждое уникальное фото имеет hash в имени файла
# Одно и то же фото может быть в разных размерах — берём largest

unique_images = {}
for img in artwork_images:
    # Извлечь hash из key (последняя часть перед .jpeg)
    image_hash = img['key'].split('/')[-1].replace('.jpeg', '')
    
    if image_hash not in unique_images or img['width'] > unique_images[image_hash]['width']:
        unique_images[image_hash] = img

# Отсортировать: main первое, потом alternate views
sorted_images = sorted(
    unique_images.items(), 
    key=lambda x: (0 if 'main' in x[1]['key'] else 1, x[1]['key'])
)

print(f"Unique artwork images: {len(sorted_images)}")
for i, (hash, img) in enumerate(sorted_images):
    print(f"  {i+1}. {img['width']}px — {img['key'].split('/')[-1]}")
```

---

## Шаг 6: Скачать изображения с правильными headers

```python
import urllib.request
import os

OUTPUT_DIR = "/path/to/artworks/skeleton-in-the-studio"
os.makedirs(OUTPUT_DIR, exist_ok=True)

headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': f'https://www.singulart.com/en/artworks/iryna-barabash-skeleton-in-the-studio-{ARTWORK_ID}'
}

for i, (image_hash, img) in enumerate(sorted_images):
    # Определить имя файла
    if i == 0:
        filename = 'main.webp'
    elif i <= 2:
        filename = f'interior-{i}.webp'
    else:
        filename = f'detail-{i-2}.webp'
    
    filepath = os.path.join(OUTPUT_DIR, filename)
    
    # Скачать
    req = urllib.request.Request(img['url'], headers=headers)
    with urllib.request.urlopen(req, timeout=30) as response:
        data = response.read()
    
    with open(filepath, 'wb') as f:
        f.write(data)
    
    file_size = len(data)
    print(f"✓ Downloaded {filename} ({file_size/1024:.1f} KB)")
```

---

## Шаг 7: Конвертировать WebP → PNG (macOS)

```bash
cd /path/to/artworks/skeleton-in-the-studio

for file in *.webp; do
    output="${file%.webp}.png"
    sips -s format png "$file" --out "$output" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        rm "$file"
        echo "✓ Converted $file to $output"
    fi
done
```

---

## Полный Python скрипт для автоматизации

```python
#!/usr/bin/env python3
"""
Download artwork images from Singulart.

Usage:
    python3 download_singulart_artwork.py \
        --url "https://www.singulart.com/en/artworks/iryna-barabash-skeleton-in-the-studio-2146432" \
        --output-dir "./public/images/artworks/skeleton-in-the-studio"
"""

import argparse
import base64
import json
import os
import re
import subprocess
import urllib.request

def download_page(url):
    """Download HTML page with proper headers."""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
        'Accept-Language': 'en-US,en;q=0.9'
    }
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as response:
        return response.read().decode('utf-8')

def extract_image_urls(html_content):
    """Extract all image-sh URLs from HTML."""
    pattern = r'(https://www\.singulart\.com/images-sh/([A-Za-z0-9+/=]+))\?signature=([a-f0-9]+)'
    matches = re.findall(pattern, html_content)
    
    image_data = []
    for full_url, b64_part, signature in matches:
        try:
            padding = 4 - (len(b64_part) % 4)
            b64_part_padded = b64_part + '=' * padding if padding != 4 else b64_part
            
            decoded = base64.b64decode(b64_part_padded).decode('utf-8')
            data = json.loads(decoded)
            key = data.get('key', '')
            width = data.get('edits', {}).get('resize', {}).get('width', 0)
            
            image_data.append({
                'url': full_url,
                'key': key,
                'width': width,
            })
        except:
            pass
    
    return image_data

def filter_artwork_images(image_data, artwork_id):
    """Filter images for specific artwork and get highest resolution."""
    artwork_images = [
        img for img in image_data 
        if 'artworks' in img['key'] 
        and artwork_id in img['key']
        and '/zoom/' in img['key']
    ]
    
    # Group by unique image hash
    unique_images = {}
    for img in artwork_images:
        image_hash = img['key'].split('/')[-1].replace('.jpeg', '')
        if image_hash not in unique_images or img['width'] > unique_images[image_hash]['width']:
            unique_images[image_hash] = img
    
    # Sort: main first, then alts
    return sorted(
        unique_images.items(),
        key=lambda x: (0 if 'main' in x[1]['key'] else 1, x[1]['key'])
    )

def download_images(sorted_images, output_dir, artwork_id, artwork_slug):
    """Download all images with proper headers."""
    os.makedirs(output_dir, exist_ok=True)
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': f'https://www.singulart.com/en/artworks/{artwork_slug}-{artwork_id}'
    }
    
    for i, (image_hash, img) in enumerate(sorted_images):
        if i == 0:
            filename = 'main.webp'
        elif i <= 2:
            filename = f'interior-{i}.webp'
        else:
            filename = f'detail-{i-2}.webp'
        
        filepath = os.path.join(output_dir, filename)
        
        try:
            req = urllib.request.Request(img['url'], headers=headers)
            with urllib.request.urlopen(req, timeout=30) as response:
                data = response.read()
            
            with open(filepath, 'wb') as f:
                f.write(data)
            
            print(f"✓ Downloaded {filename} ({len(data)/1024:.1f} KB)")
        except Exception as e:
            print(f"✗ Error downloading {filename}: {e}")

def convert_webp_to_png(output_dir):
    """Convert WebP files to PNG using sips (macOS)."""
    for filename in os.listdir(output_dir):
        if filename.endswith('.webp'):
            webp_path = os.path.join(output_dir, filename)
            png_path = webp_path.replace('.webp', '.png')
            
            result = subprocess.run(
                ['sips', '-s', 'format', 'png', webp_path, '--out', png_path],
                capture_output=True
            )
            
            if result.returncode == 0:
                os.remove(webp_path)
                print(f"✓ Converted {filename} to {os.path.basename(png_path)}")
            else:
                print(f"✗ Failed to convert {filename}")

def main():
    parser = argparse.ArgumentParser(description='Download Singulart artwork images')
    parser.add_argument('--url', required=True, help='Artwork page URL')
    parser.add_argument('--output-dir', required=True, help='Output directory')
    parser.add_argument('--artwork-id', required=True, help='Artwork ID (e.g., 2146432)')
    parser.add_argument('--artwork-slug', required=True, help='Artwork slug (e.g., iryna-barabash-skeleton-in-the-studio)')
    
    args = parser.parse_args()
    
    print(f"Downloading artwork page...")
    html = download_page(args.url)
    
    print(f"Extracting image URLs...")
    image_data = extract_image_urls(html)
    
    print(f"Filtering artwork images...")
    sorted_images = filter_artwork_images(image_data, args.artwork_id)
    
    print(f"Found {len(sorted_images)} images to download")
    
    print(f"Downloading images...")
    download_images(sorted_images, args.output_dir, args.artwork_id, args.artwork_slug)
    
    print(f"Converting to PNG...")
    convert_webp_to_png(args.output_dir)
    
    print(f"\n✅ Done! Images saved to: {args.output_dir}")

if __name__ == '__main__':
    main()
```

**Использование:**
```bash
python3 download_singulart_artwork.py \
    --url "https://www.singulart.com/en/artworks/iryna-barabash-skeleton-in-the-studio-2146432" \
    --output-dir "./public/images/artworks/skeleton-in-the-studio" \
    --artwork-id "2146432" \
    --artwork-slug "iryna-barabash-skeleton-in-the-studio"
```

---

## Важные заметки

| Проблема | Решение |
|----------|---------|
| **403 Forbidden** | Обязательно указывать правильные headers (User-Agent, Referer) |
| **Signature Does Not Match** | URL имеют ограниченный срок действия. Если signature истёк — нужно заново скачать HTML и извлечь свежие URL |
| **URL обрезаются** | Base64 часть URL очень длинная. При извлечении из HTML следить за полным URL без обрезки |
| **Формат изображений** | Singulart отдаёт WebP. Конвертировать в PNG через `sips` (macOS) или `python3 -m PIL` |
| **Разные размеры** | Одно и то же фото доступно в нескольких разрешениях (от 390px до 2270px). Всегда выбирать `/zoom/` с максимальной шириной |
