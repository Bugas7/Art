# check-images-status.mjs

A comprehensive utility for checking the status of artwork images in the gallery.

## Purpose

This script analyzes the artwork database (`src/data/artworks.ts`) and checks whether the corresponding image directories and files exist in `public/images/artworks/`. It provides detailed reports on the completeness of your artwork image collection.

## Usage

```bash
# Show summary only (default)
node scripts/check-images-status.mjs

# Show all details (complete, partial, empty, missing)
node scripts/check-images-status.mjs --all

# Show only complete artworks
node scripts/check-images-status.mjs --complete

# Show only empty directories
node scripts/check-images-status.mjs --empty

# Output as JSON for programmatic use
node scripts/check-images-status.mjs --json
```

## Flags

| Flag | Short | Description |
|------|-------|-------------|
| `--all` | `-a` | Show all categories with full details |
| `--complete` | `-c` | Show only complete artworks |
| `--empty` | `-e` | Show only empty directories |
| `--json` | `-j` | Output results as JSON |

## Output Categories

The script classifies each artwork into one of four categories:

### ✅ Complete
- Directory exists
- Has `main.png` or `main.jpg`
- Has at least one `detail-*` or `interior-*` image

### ⚠️ Partial
- Directory exists
- Has some images but missing main image OR has only main image with no details/interiors

### 📁 Empty
- Directory exists but contains no files

### ❌ Missing
- No directory exists for this artwork

## JSON Output Format

When using `--json`, the output structure is:

```json
{
  "complete": [
    {
      "id": "skeleton-in-the-studio",
      "title": "Скелет в студии",
      "main": "main.png",
      "details": 4,
      "interior": 2,
      "total": 7
    }
  ],
  "partial": [],
  "empty": [],
  "missing": [],
  "summary": {
    "total": 97,
    "complete": 52,
    "partial": 0,
    "empty": 41,
    "missing": 4
  }
}
```

## Expected Image Structure

According to the PHOTO_UPDATE_GUIDE.md, each artwork should have:

```
public/images/artworks/{slug}/
├── main.png          # Main artwork image (required)
├── detail-1.png      # Detail/close-up shots (optional)
├── detail-2.png
├── interior-1.png    # Room preview/interior shots (optional)
└── interior-2.png
```

## Integration with PHOTO_UPDATE_GUIDE

This script is designed to help you execute the PHOTO_UPDATE_GUIDE.md by:

1. **Identifying missing directories** - Tells you which artworks need new directories created
2. **Finding empty directories** - Shows which directories need images downloaded
3. **Verifying completeness** - Confirms that complete artworks have all required images
4. **Generating reports** - Provides data for audit reports and progress tracking

## Example Workflow

```bash
# 1. Check current status
node scripts/check-images-status.mjs

# 2. Get detailed report of what's missing
node scripts/check-images-status.mjs --all > status-report.txt

# 3. Export missing items for processing
node scripts/check-images-status.mjs --json | jq '.missing[].id' > missing-artworks.txt

# 4. After downloading images, verify progress
node scripts/check-images-status.mjs
```

## Troubleshooting

### "Total artworks in database: 0"
- Check that `src/data/artworks.ts` exists and contains the artworks array
- Verify the file uses the expected format with `"id":`, `"title":`, etc.

### "Module type warning"
- This is normal for Node.js without `"type": "module"` in package.json
- The `.mjs` extension ensures it runs as an ES module

### Script finds wrong data
- The script uses regex to parse the TypeScript file
- If the format changes significantly, regex patterns may need updating

## Technical Details

- **Runtime:** Node.js (ES Module via .mjs extension)
- **Dependencies:** None (uses only Node.js built-in modules: fs, path, url)
- **Database format:** Parses TypeScript file directly using regex
- **Path resolution:** Automatically resolves paths relative to project root

## Files

- `check-images-status.mjs` - Main script
- `../src/data/artworks.ts` - Artwork database (read)
- `../public/images/artworks/` - Image directory (checked)

## Related Scripts

- `find-missing-images.js` - Older version, less comprehensive
- `fetch_singulart_catalog.py` - Fetches catalog from Singulart
- `download_singulart_artwork.py` - Downloads individual artworks
- `update_all_photos.py` - Updates artwork image paths
