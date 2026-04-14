import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

const artworksFile = path.join(ROOT_DIR, 'src/data/artworks.ts');
const imageDir = path.join(ROOT_DIR, 'public/images/artworks');

// Parse command line arguments
const args = process.argv.slice(2);
const showAll = args.includes('--all') || args.includes('-a');
const showComplete = args.includes('--complete') || args.includes('-c');
const jsonOutput = args.includes('--json') || args.includes('-j');
const showEmpty = args.includes('--empty') || args.includes('-e');
const createMissing = args.includes('--create-missing');
const listForDownload = args.includes('--list-for-download');
const checkOrphans = args.includes('--check-orphans');
const csvOutput = args.includes('--csv');
const validatePaths = args.includes('--validate-paths');
const fixPaths = args.includes('--fix-paths');

if (!fs.existsSync(artworksFile)) {
    console.error(`Error: Cannot find artworks file at ${artworksFile}`);
    process.exit(1);
}

const content = fs.readFileSync(artworksFile, 'utf8');

// Extract data using regex patterns
const idRegex = /"id":\s*"([^"]+)"/g;
const titleRegex = /"title":\s*\{[\s\S]*?(?:"ru":\s*"([^"]+)"|"en":\s*"([^"]+)")/g;
const imageRegex = /"image":\s*"([^"]+)"/g;
const imagesArrayRegex = /"images":\s*\[([\s\S]*?)\]/g;

const ids = [];
const titles = [];
const images = [];
const imagesArrays = [];

let match;
while ((match = idRegex.exec(content)) !== null) {
    ids.push(match[1]);
}

titleRegex.lastIndex = 0;
while ((match = titleRegex.exec(content)) !== null) {
    titles.push(match[1] || match[2] || 'Unknown');
}

while ((match = imageRegex.exec(content)) !== null) {
    images.push(match[1]);
}

// Extract images arrays
while ((match = imagesArrayRegex.exec(content)) !== null) {
    const imagePaths = match[1].match(/["']([^"']+)["']/g) || [];
    imagesArrays.push(imagePaths.map(p => p.replace(/["']/g, '')));
}

const results = {
    complete: [],
    partial: [],
    empty: [],
    missing: [],
    summary: {
        total: ids.length,
        complete: 0,
        partial: 0,
        empty: 0,
        missing: 0
    }
};

for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const title = titles[i] || 'Unknown';
    const mainImage = images[i] || '';
    const additionalImages = imagesArrays[i] || [];

    const artworkDir = path.join(imageDir, id);

    // Check if directory exists
    if (!fs.existsSync(artworkDir)) {
        results.missing.push({
            id,
            title,
            issue: 'Directory missing',
            expectedMain: mainImage,
            expectedTotal: additionalImages.length
        });
        continue;
    }

    // Check directory contents
    const files = fs.readdirSync(artworkDir);
    const hasMain = files.some(f => f.startsWith('main.'));
    const detailCount = files.filter(f => f.startsWith('detail-')).length;
    const interiorCount = files.filter(f => f.startsWith('interior-')).length;
    const totalFiles = files.length;

    if (totalFiles === 0) {
        results.empty.push({
            id,
            title,
            issue: 'Directory exists but is empty',
            expectedTotal: additionalImages.length
        });
    } else if (hasMain) {
        if (detailCount > 0 || interiorCount > 0) {
            results.complete.push({
                id,
                title,
                main: 'main.png',
                details: detailCount,
                interior: interiorCount,
                total: totalFiles
            });
        } else {
            results.partial.push({
                id,
                title,
                issue: 'Only main image, no details or interiors',
                total: totalFiles
            });
        }
    } else {
        results.partial.push({
            id,
            title,
            issue: `Has ${totalFiles} file(s) but no main image`,
            total: totalFiles
        });
    }
}

// Update summary
results.summary.complete = results.complete.length;
results.summary.partial = results.partial.length;
results.summary.empty = results.empty.length;
results.summary.missing = results.missing.length;

// Action: Create missing directories
if (createMissing) {
    console.log('\n🔧 Creating missing directories...');
    let created = 0;
    for (const item of results.missing) {
        const dirPath = path.join(imageDir, item.id);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            console.log(`  ✓ Created: ${item.id}`);
            created++;
        }
    }
    console.log(`\n✅ Created ${created} director${created === 1 ? 'y' : 'ies'}`);
    console.log('Run the script again to check images after downloading.\n');
    process.exit(0);
}

// Action: List artworks needing download
if (listForDownload) {
    console.log('\n📥 Artworks needing image downloads:\n');
    const needsDownload = [...results.missing, ...results.empty];

    if (needsDownload.length === 0) {
        console.log('  ✅ All artworks have images! Nothing to download.\n');
    } else {
        console.log(`ID | Title | Expected Images`);
        console.log('─'.repeat(80));
        needsDownload.forEach((item, idx) => {
            console.log(`${idx + 1}. ${item.id}`);
            console.log(`   ${item.title}`);
            console.log(`   Expected: ${item.expectedTotal || 'unknown'} image(s)\n`);
        });
        console.log(`\nTotal: ${needsDownload.length} artworks need downloads`);

        // Generate bash command
        console.log('\n📝 Bash command to create all missing directories:');
        console.log('mkdir -p public/images/artworks/{' + needsDownload.map(a => a.id).join(',') + '}');
    }
    console.log('');
    process.exit(0);
}

// Action: Check for orphan files
if (checkOrphans) {
    console.log('\n🔍 Checking for orphan files...\n');

    const dbIds = new Set(ids);
    const existingDirs = fs.readdirSync(imageDir).filter(f => {
        return fs.statSync(path.join(imageDir, f)).isDirectory();
    });

    const orphans = existingDirs.filter(dir => !dbIds.has(dir));

    if (orphans.length === 0) {
        console.log('  ✅ No orphan directories found!\n');
    } else {
        console.log(`Found ${orphans.length} orphan director${orphans.length === 1 ? 'y' : 'ies'}:`);
        console.log('(directories without corresponding artwork in database)\n');
        orphans.forEach(dir => {
            const files = fs.readdirSync(path.join(imageDir, dir));
            console.log(`  ⚠️  ${dir} (${files.length} file${files.length === 1 ? '' : 's'})`);
        });
        console.log('\n💡 Consider:');
        console.log('  - Adding these artworks to the database');
        console.log('  - Or removing these directories if they\'re obsolete\n');
    }
    process.exit(0);
}

// Action: CSV output
if (csvOutput) {
    const headers = ['ID', 'Title (RU)', 'Title (EN)', 'Status', 'Details', 'Interiors', 'Issue'];
    console.log(headers.join(','));

    results.complete.forEach(a => {
        console.log([a.id, a.title, a.title, 'complete', a.details, a.interior, ''].join(','));
    });
    results.partial.forEach(a => {
        console.log([a.id, a.title, a.title, 'partial', '', '', a.issue].join(','));
    });
    results.empty.forEach(a => {
        console.log([a.id, a.title, a.title, 'empty', '', '', a.issue].join(','));
    });
    results.missing.forEach(a => {
        console.log([a.id, a.title, a.title, 'missing', '', '', a.issue].join(','));
    });
    process.exit(0);
}

// Action: Validate image paths in artworks.ts
if (validatePaths) {
    console.log('\n🔍 Validating image paths in artworks.ts...\n');

    let validPaths = 0;
    let brokenPaths = 0;

    for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        const mainImage = images[i];
        const additionalImages = imagesArrays[i] || [];

        if (!mainImage) continue;

        // Check if path matches expected structure
        const expectedPath = `/images/artworks/${id}/main.png`;
        const expectedPathJpg = `/images/artworks/${id}/main.jpg`;

        const artworkDir = path.join(imageDir, id);
        const hasMainFile = fs.existsSync(path.join(imageDir, mainImage)) ||
            fs.existsSync(path.join(ROOT_DIR, 'public', mainImage));

        if (!hasMainFile) {
            console.log(`  ❌ ${id}`);
            console.log(`     Database path: ${mainImage}`);
            console.log(`     File not found at either location\n`);
            brokenPaths++;
        } else {
            validPaths++;
        }
    }

    console.log(`\nValid paths: ${validPaths}`);
    console.log(`Broken paths: ${brokenPaths}\n`);
    process.exit(0);
}

// Action: Fix image paths in artworks.ts
if (fixPaths) {
    console.log('\n🔧 Fixing empty image paths in artworks.ts...\n');

    let fixedCount = 0;
    let newContent = content;

    // Find all artwork IDs
    const allIds = [];
    let idMatch;
    const idRegexGlobal = /"id":\s*"([^"]+)"/g;
    while ((idMatch = idRegexGlobal.exec(content)) !== null) {
        allIds.push(idMatch[1]);
    }

    for (const artworkId of allIds) {
        // Find empty image for this artwork using simple string search
        const searchStr = `"id": "${artworkId}"`;
        const idx = newContent.indexOf(searchStr);
        if (idx === -1) continue;

        // Find "image": "" after this position
        const afterIdx = newContent.indexOf('"image":', idx);
        if (afterIdx === -1) continue;

        const emptyImageIdx = newContent.indexOf('""', afterIdx);
        if (emptyImageIdx === -1 || emptyImageIdx > afterIdx + 15) continue;
        const artworkDirPath = path.join(imageDir, artworkId);
        const hasMainPng = fs.existsSync(path.join(artworkDirPath, 'main.png'));
        const hasMainJpg = fs.existsSync(path.join(artworkDirPath, 'main.jpg'));

        if (hasMainPng || hasMainJpg) {
            const ext = hasMainPng ? 'png' : 'jpg';
            const newPath = `/images/artworks/${artworkId}/main.${ext}`;

            // Replace
            const oldStr = match[0];
            const newStr = match[1] + `"${newPath}")`;
            newContent = newContent.replace(oldStr, newStr);

            fixedCount++;
            console.log(`  ✓ ${artworkId} -> ${newPath}`);
        }
    }
}

if (fixedCount > 0) {
    // Backup
    const backupPath = artworksFile + '.backup';
    fs.copyFileSync(artworksFile, backupPath);
    console.log(`\n  💾 Backup saved: ${backupPath}`);

    // Save
    fs.writeFileSync(artworksFile, newContent, 'utf8');
    console.log(`\n✅ Fixed ${fixedCount} artworks`);
    console.log('💡 Run "npm run check-images" to verify');
    console.log('💡 Run "npm run dev" to test on site\n');
} else {
    console.log('\n✅ No empty images found. All good!\n');
}

// Output results
if (jsonOutput) {
    console.log(JSON.stringify(results, null, 2));
} else {
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║         ARTWORK IMAGE STATUS REPORT                     ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    console.log(`📊 Total artworks in database: ${results.summary.total}\n`);

    if (showComplete || showAll) {
        console.log(`✅ COMPLETE (${results.complete.length} artworks)`);
        console.log('─'.repeat(60));
        results.complete.forEach((a, idx) => {
            console.log(`  ${idx + 1}. ${a.id}`);
            console.log(`     Title: ${a.title}`);
            console.log(`     Images: 1 main + ${a.details} details + ${a.interior} interiors = ${a.total} total\n`);
        });
        console.log('');
    }

    if (showAll) {
        console.log(`⚠️  PARTIAL (${results.partial.length} artworks)`);
        console.log('─'.repeat(60));
        results.partial.forEach((a, idx) => {
            console.log(`  ${idx + 1}. ${a.id}`);
            console.log(`     Title: ${a.title}`);
            console.log(`     Issue: ${a.issue}\n`);
        });
        console.log('');
    }

    if (showEmpty || showAll) {
        console.log(`📁 EMPTY DIRECTORIES (${results.empty.length} artworks)`);
        console.log('─'.repeat(60));
        results.empty.forEach((a, idx) => {
            console.log(`  ${idx + 1}. ${a.id}`);
            console.log(`     Title: ${a.title}`);
            console.log(`     Expected images: ${a.expectedTotal}\n`);
        });
        console.log('');
    }

    console.log(`❌ MISSING DIRECTORIES (${results.missing.length} artworks)`);
    console.log('─'.repeat(60));
    if (results.missing.length === 0) {
        console.log('  ✅ All artworks have directories!\n');
    } else {
        results.missing.forEach((a, idx) => {
            console.log(`  ${idx + 1}. ${a.id}`);
            console.log(`     Title: ${a.title}`);
            console.log(`     Issue: ${a.issue}\n`);
        });
    }
    console.log('');

    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║                    SUMMARY                              ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');
    console.log(`  Complete:  ${results.summary.complete} (${(results.summary.complete / results.summary.total * 100).toFixed(1)}%)`);
    console.log(`  Partial:   ${results.summary.partial} (${(results.summary.partial / results.summary.total * 100).toFixed(1)}%)`);
    console.log(`  Empty:     ${results.summary.empty} (${(results.summary.empty / results.summary.total * 100).toFixed(1)}%)`);
    console.log(`  Missing:   ${results.summary.missing} (${(results.summary.missing / results.summary.total * 100).toFixed(1)}%)`);
    console.log('');

    const completeness = ((results.summary.complete / results.summary.total) * 100).toFixed(1);
    if (completeness >= 90) {
        console.log('🎉 Great! Most artworks are properly organized.');
    } else if (completeness >= 70) {
        console.log('👍 Good progress, but some work remains.');
    } else if (completeness >= 50) {
        console.log('⚠️  About half complete. Consider downloading missing images.');
    } else {
        console.log('🚨 Significant work needed. Many artworks lack images.');
    }
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/check-images-status.mjs              # Show summary only');
    console.log('  node scripts/check-images-status.mjs --all        # Show all details');
    console.log('  node scripts/check-images-status.mjs --complete   # Show complete list');
    console.log('  node scripts/check-images-status.mjs --empty      # Show empty dirs');
    console.log('  node scripts/check-images-status.mjs --json       # JSON output');
    console.log('  node scripts/check-images-status.mjs --csv        # CSV output');
    console.log('');
    console.log('Actions:');
    console.log('  node scripts/check-images-status.mjs --create-missing  # Create missing dirs');
    console.log('  node scripts/check-images-status.mjs --list-for-download  # List for download');
    console.log('  node scripts/check-images-status.mjs --check-orphans  # Find orphan dirs');
    console.log('  node scripts/check-images-status.mjs --validate-paths # Check DB paths');
    console.log('');
    console.log('NPM shortcuts:');
    console.log('  npm run check-images          # Summary');
    console.log('  npm run check-images:all      # Full details');
    console.log('  npm run check-images:json     # JSON output');
}
