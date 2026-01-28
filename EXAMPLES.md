# Usage Examples

## Basic Exports

### Export all annotations to Markdown (separate files)
```bash
bun run export --format markdown --output ./my-books
```

Creates one `.md` file per book in the `./my-books` directory.

### Export all to a single JSON file
```bash
bun run export --format json --output ./all-annotations.json --single-file
```

### Export all to CSV for Excel/analysis
```bash
bun run export --format csv --output ./annotations.csv
```

## Filtered Exports

### Export only highlights (no bookmarks or notes)
```bash
bun run export --highlights-only --output ./highlights.md
```

### Export only bookmarks
```bash
bun run export --bookmarks-only --output ./bookmarks.md
```

### Export yellow highlights only
```bash
bun run export --colors yellow --output ./yellow-highlights
```

### Export yellow and green highlights
```bash
bun run export --colors yellow,green --output ./important-highlights
```

## Advanced Examples

### Single Markdown file with all books
```bash
bun run export --format markdown --output ./everything.md --single-file
```

### Multiple JSON files (one per book)
```bash
bun run export --format json --output ./books-json
```
(Note: Without `--single-file`, creates one JSON file per book)

### Only highlights from specific colors
```bash
bun run export --highlights-only --colors pink,purple --output ./critical-highlights.json --single-file --format json
```

### Export with custom database paths
```bash
bun run export \
  --annotations-db ~/custom/path/AEAnnotation.sqlite \
  --library-db ~/custom/path/BKLibrary.sqlite \
  --output ./exports
```

## Real-World Workflows

### For Obsidian/Note-taking
Export to Markdown with one file per book:
```bash
bun run export --format markdown --output ~/Obsidian/BookNotes
```

### For Data Analysis
Export to CSV for use in Excel, pandas, etc:
```bash
bun run export --format csv --output ~/Downloads/books-analysis.csv
```

### For Backup
Export everything to JSON:
```bash
bun run export --format json --output ~/Backups/apple-books-$(date +%Y%m%d).json --single-file
```

### For Sharing Selected Highlights
Export only yellow highlights to a single readable file:
```bash
bun run export --highlights-only --colors yellow --format markdown --output ./to-share.md --single-file
```

## Automation Examples

### Cron job for daily backup (add to crontab)
```bash
0 2 * * * cd /path/to/apple-books-export && bun run export --format json --output ~/Backups/books-$(date +\%Y\%m\%d).json --single-file
```

### Shell script for multiple exports
```bash
#!/bin/bash
# Export in all formats for backup

BACKUP_DIR="$HOME/Books-Backup-$(date +%Y%m%d)"
mkdir -p "$BACKUP_DIR"

cd /path/to/apple-books-export

bun run export --format json --output "$BACKUP_DIR/all.json" --single-file
bun run export --format csv --output "$BACKUP_DIR/all.csv"
bun run export --format markdown --output "$BACKUP_DIR/markdown"

echo "Backup complete: $BACKUP_DIR"
```

## Troubleshooting

### Check what will be exported (dry run simulation)
```bash
# Export to a temp location first to check
bun run export --format json --output /tmp/test.json --single-file
cat /tmp/test.json | head -n 50
```

### Count annotations by type
```bash
# Export to JSON and use jq to analyze
bun run export --format json --output /tmp/books.json --single-file
cat /tmp/books.json | jq '.statistics'
```

### Find books with most highlights
```bash
bun run export --format json --output /tmp/books.json --single-file
cat /tmp/books.json | jq '.books | sort_by(-.annotationCount) | .[0:10] | .[] | {title, count: .annotationCount}'
```
