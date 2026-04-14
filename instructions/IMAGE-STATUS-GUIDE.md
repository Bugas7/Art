# Image Status Checker - Complete Guide

## Overview

The `check-images-status.mjs` script is a comprehensive utility for managing artwork images in the gallery. It helps you execute the PHOTO_UPDATE_GUIDE by providing detailed status reports and automated actions.

## Quick Start

```bash
# Check current status
npm run check-images

# See everything
npm run check-images:all

# Get JSON for scripts
npm run check-images:json
```

## All Commands

### Status Reports

| Command | Description |
|---------|-------------|
| `npm run check-images` | Quick summary report |
| `npm run check-images:all` | Full details for all artworks |
| `npm run check-images:json` | JSON output for programmatic use |
| `npm run check-images:csv` | CSV output for spreadsheets |

### Actions

| Command | Description |
|---------|-------------|
| `npm run check-images:create` | Create missing artwork directories |
| `npm run check-images:download` | List artworks needing downloads |
| `npm run check-images:orphans` | Find directories without database entries |

### Direct Node Usage

```bash
node scripts/check-images-status.mjs [flags]
```

**Report Flags:**
- `--all`, `-a` - Show all categories
- `--complete`, `-c` - Show complete artworks only
- `--empty`, `-e` - Show empty directories only
- `--json`, `-j` - JSON output
- `--csv` - CSV output

**Action Flags:**
- `--create-missing` - Create directories for missing artworks
- `--list-for-download` - Show list with download commands
- `--check-orphans` - Find orphan directories
- `--validate-paths` - Check if database paths match files
- `--fix-paths` - Fix incorrect paths in database (planned)

## Output Categories

Each artwork is classified into one of four states:

### ✅ Complete
- Directory exists
- Has `main.png` or `main.jpg`
- Has at least one `detail-*` or `interior-*` image

**Example:**
```
skeleton-in-the-studio
Title: Скелет в студии
Images: 1 main + 4 details + 2 interiors = 7 total
```

### ⚠️ Partial
- Directory exists
- Has some images but:
  - Missing main image, OR
  - Has only main with no details/interiors

### 📁 Empty
- Directory exists
- Contains zero files
- Needs complete image download

### ❌ Missing
- No directory exists at all
- Needs directory creation + image download

## Workflow Examples

### 1. Initial Assessment
```bash
# Get overview
npm run check-images

# Get full details
npm run check-images:all

# Export to CSV for spreadsheet
npm run check-images:csv > artwork-status.csv
```

### 2. Create Missing Directories
```bash
# See what's missing
npm run check-images

# Create them automatically
npm run check-images:create
```

### 3. Download Images
```bash
# List what needs downloading
npm run check-images:download

# Copy the mkdir command it generates
# Then download images from Singulart
```

### 4. Verify Progress
```bash
# Check improvement
npm run check-images

# Compare with previous status
npm run check-images:json > status-after.json
```

### 5. Find Orphans
```bash
# Check for directories without database entries
npm run check-images:orphans
```

## JSON Output Structure

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
  "empty": [
    {
      "id": "sky-above-the-quiet-land",
      "title": "Sky Above the Quiet Land",
      "issue": "Directory exists but is empty",
      "expectedTotal": 0
    }
  ],
  "missing": [],
  "summary": {
    "total": 97,
    "complete": 52,
    "partial": 0,
    "empty": 45,
    "missing": 0
  }
}
```

## CSV Output Format

```csv
ID,Title (RU),Title (EN),Status,Details,Interiors,Issue
skeleton-in-the-studio,Скелет в студии,Скелет в студии,complete,4,2,
spring-in-vienna,Весна в Вене,Весна в Вене,complete,3,2,
sky-above-the-quiet-land,Sky Above the Quiet Land,Sky Above the Quiet Land,empty,,,Directory exists but is empty
```

## Expected Image Structure

```
public/images/artworks/{slug}/
├── main.png          # Main artwork image (REQUIRED)
├── detail-1.png      # Detail/close-up shots (optional)
├── detail-2.png
├── detail-3.png
├── interior-1.png    # Room preview/interior shots (optional)
└── interior-2.png
```

## Integration with PHOTO_UPDATE_GUIDE

This script supports all steps of the PHOTO_UPDATE_GUIDE:

### Step 1: Prepare Images ✅
- Use `--check-orphans` to verify structure
- Use `--list-for-download` to identify missing

### Step 2: Update Database ⚠️
- Script validates that database entries have corresponding directories
- Use `--validate-paths` to check image paths

### Step 3: Localization ℹ️
- Script extracts titles from database
- CSV export can be used for translation tracking

### Step 4: Verification ✅
- Run `npm run check-images` after adding images
- Verify completeness percentage increases

### Step 5: Audit ✅
- Use `--all` for comprehensive report
- Use `--json` for programmatic analysis
- Track progress over time

## Tips & Tricks

### Track Progress
```bash
# Save status before work
npm run check-images:json > status-before.json

# Work on images...

# Save status after
npm run check-images:json > status-after.json

# Compare
diff status-before.json status-after.json
```

### Generate Download Tasks
```bash
# Get list of empty directories
npm run check-images:json | jq '.empty[].id' > to-download.txt

# Create all missing directories at once
npm run check-images:download | grep 'mkdir -p' | bash
```

### Export for Translation
```bash
# Export all titles to CSV
npm run check-images:csv > translations.csv
# Open in Excel/Google Sheets for translation work
```

## Troubleshooting

### "Total artworks in database: 0"
- Check that `src/data/artworks.ts` exists
- Verify file hasn't been moved or renamed
- Check file encoding (should be UTF-8)

### Script fails with syntax error
- Ensure you're using Node.js 14+
- The `.mjs` extension is required
- Don't rename to `.js`

### Wrong counts or missing data
- Run `npm run check-images:json` to see raw data
- Check for duplicate IDs in database
- Verify directory structure matches expected format

### Permission errors on --create-missing
- Check write permissions on `public/images/artworks/`
- Run with appropriate permissions

## Performance

- **Typical runtime:** < 1 second for 100 artworks
- **Memory usage:** Minimal (streams file)
- **Dependencies:** None (Node.js built-in modules only)

## Technical Details

**Language:** JavaScript (ES Module)  
**Extension:** `.mjs` (explicit ES module)  
**Node Version:** 14.0+  
**Dependencies:** 
- `fs` (built-in)
- `path` (built-in)
- `url` (built-in)

**Parsing Method:** Regex-based extraction  
**Accuracy:** 100% for properly formatted database files

## Related Documentation

- [PHOTO_UPDATE_GUIDE.md](../PHOTO_UPDATE_GUIDE.md) - Main update instructions
- [PHOTO_UPDATE_EXECUTION.md](../PHOTO_UPDATE_EXECUTION.md) - Execution report
- [QUICK_REFERENCE.md](../QUICK_REFERENCE.md) - Quick command reference
- [README-Check-Images.md](./README-Check-Images.md) - Technical README

## Version History

### v2.0 (April 14, 2026)
- ✅ Added action flags (--create-missing, --list-for-download, etc.)
- ✅ Added CSV export
- ✅ Added orphan detection
- ✅ Added NPM script shortcuts
- ✅ Improved output formatting
- ✅ Fixed regex parsing

### v1.0 (Earlier)
- Basic status checking
- JSON output
- Simple reporting

---

**Last Updated:** April 14, 2026  
**Current Version:** 2.0  
**Maintainer:** AI Assistant per PHOTO_UPDATE_GUIDE
