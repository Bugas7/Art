# Инструкция: Получение каталога всех работ художника с Singulart

## Обзор метода

Singulart хранит информацию о работах художника в формате JSON-LD (структурированные данные) прямо в HTML коде страницы. Можно извлечь полный каталог без открытия браузера, скачивая страницы каталога художника.

---

## Алгоритм

### Шаг 1: Скачать HTML страницы каталога

Художник имеет paginated каталог: `https://www.singulart.com/en/artist/{artist-slug}-{artist-id}?page={N}`

```bash
ARTIST_URL="https://www.singulart.com/en/artist/iryna-barabash-63359"

# Скачать все страницы (1-6)
for page in 1 2 3 4 5 6; do
  curl -s -L \
    -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
    -H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9" \
    -H "Accept-Language: en-US,en;q=0.9" \
    "${ARTIST_URL}?page=$page" -o "/tmp/singulart-artist-page-$page.html"
done
```

### Шаг 2: Извлечь artwork данные из HTML

Работы перечислены в HTML в формате:
```html
artworks/iryna-barabash-{artwork-slug}-{artwork-id}
```

```python
import re

with open('/tmp/singulart-artist-page-1.html', 'r') as f:
    content = f.read()

# Извлечь все пары (slug, id)
matches = re.findall(r'artworks/iryna-barabash-([^-]+(?:-[^-]+)*)-([0-9]+)', content)

for slug, art_id in matches:
    print(f"{slug} (ID: {art_id})")
```

### Шаг 3: Объединить и дедуплицировать результаты

```python
import os

all_artworks = set()

for page in range(1, 7):
    filepath = f'/tmp/singulart-artist-page-{page}.html'
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            content = f.read()
        matches = re.findall(r'artworks/iryna-barabash-([^-]+(?:-[^-]+)*)-([0-9]+)', content)
        for slug, art_id in matches:
            all_artworks.add((slug, art_id))

# Сортировать по ID
sorted_artworks = sorted(all_artworks, key=lambda x: int(x[1]))
```

### Шаг 4: Сравнить с локальным проектом

```python
import json

# Загрузить artworks.ts (или JSON версию)
with open('src/data/artworks.ts', 'r') as f:
    # Парсим TypeScript файл
    local_artworks = [...]  # Извлечь IDs из файла

# Сравнить
singulart_ids = {art_id for _, art_id in sorted_artworks}
local_ids = {a['id'] for a in local_artworks}

missing = singulart_ids - local_ids
print(f"Missing {len(missing)} artworks")
```

---

## Полный скрипт

Файл: `scripts/fetch_singulart_catalog.py`

```python
#!/usr/bin/env python3
"""
Fetch all artworks from Singulart artist page and compare with local project.

Usage:
    python3 scripts/fetch_singulart_catalog.py \
        --artist-url "https://www.singulart.com/en/artist/iryna-barabash-63359" \
        --artist-id 63359 \
        --output SINGULART_ARTWORK_CATALOG.md
"""

import argparse
import os
import re
import subprocess
import urllib.request

def download_page(url):
    """Download HTML page with proper headers."""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
        'Accept-Language': 'en-US,en;q=0.9'
    }
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as response:
        return response.read().decode('utf-8')

def extract_artworks_from_html(html_content):
    """Extract artwork slugs and IDs from HTML."""
    pattern = r'artworks/iryna-barabash-([^-]+(?:-[^-]+)*)-([0-9]+)'
    matches = re.findall(pattern, html_content)
    return set(matches)

def fetch_all_pages(artist_url, max_pages=10):
    """Download all pages and extract artworks."""
    all_artworks = set()
    
    # Page 1
    print("Downloading page 1...")
    html = download_page(artist_url)
    all_artworks.update(extract_artworks_from_html(html))
    
    # Pages 2+
    for page in range(2, max_pages + 1):
        page_url = f"{artist_url}?page={page}"
        print(f"Downloading page {page}...")
        html = download_page(page_url)
        
        artworks = extract_artworks_from_html(html)
        if not artworks:
            print(f"No more artworks found on page {page}. Stopping.")
            break
        
        all_artworks.update(artworks)
        print(f"  Found {len(artworks)} artworks on this page")
    
    return all_artworks

def generate_catalog_md(artworks, local_ids=None):
    """Generate markdown catalog table."""
    sorted_artworks = sorted(artworks, key=lambda x: int(x[1]))
    
    md = []
    md.append("# Каталог работ художника Iryna Barabash с Singulart\n")
    md.append(f"**Всего работ:** {len(sorted_artworks)}\n")
    md.append("---\n")
    md.append("| # | Название | ID | Статус |\n")
    md.append("|---|----------|-----|---------|\n")
    
    for i, (slug, art_id) in enumerate(sorted_artworks, 1):
        title = slug.replace('-', ' ').title()
        status = "✅ Есть" if local_ids and art_id in local_ids else "❌ Нет"
        md.append(f"| {i} | {title} | {art_id} | {status} |\n")
    
    return ''.join(md)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--artist-url', required=True)
    parser.add_argument('--output', default='SINGULART_ARTWORK_CATALOG.md')
    parser.add_argument('--local-ids', nargs='*', help='Local artwork IDs to compare')
    
    args = parser.parse_args()
    
    # Fetch all artworks
    all_artworks = fetch_all_pages(args.artist_url)
    print(f"\nTotal unique artworks: {len(all_artworks)}")
    
    # Generate catalog
    local_ids = set(args.local_ids) if args.local_ids else None
    md_content = generate_catalog_md(all_artworks, local_ids)
    
    # Save to file
    with open(args.output, 'w') as f:
        f.write(md_content)
    
    print(f"\n✅ Catalog saved to: {args.output}")

if __name__ == '__main__':
    main()
```

**Использование:**
```bash
python3 scripts/fetch_singulart_catalog.py \
    --artist-url "https://www.singulart.com/en/artist/iryna-barabash-63359" \
    --output SINGULART_ARTWORK_CATALOG.md
```

---

## Важные заметки

| Проблема | Решение |
|----------|---------|
| **403 Forbidden** | Обязательно указывать User-Agent header |
| **Пагинация** | Страницы идут от 1 до N. Страница без artwork означает конец каталога |
| **Дубликаты** | Одна и та же работа может встречаться на разных страницах — использовать set() для дедупликации |
| **Специальные символы** | Slug может содержать `%C3%A9` (é) и другие encoded символы — декодировать при отображении |
