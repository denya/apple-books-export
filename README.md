# Apple Books Export Tool

A modern CLI tool to export highlights, bookmarks, and notes from Apple Books on macOS. Works with both Node.js and Bun.

## Features

- 🚀 **Fast execution** - typically completes in under 5 seconds
- 📝 **Multiple export formats** - HTML, Markdown, JSON, CSV
- 🌐 **Interactive HTML export** - searchable, styled, single-file export (default)
- 🎨 **Color-coded highlights** - preserves your highlight colors
- 🔍 **Flexible filtering** - filter by type, color, or book
- 📚 **Book metadata** - includes title, author, genre information
- 🔒 **Read-only** - never modifies your Apple Books data
- ⚡ **Dual runtime support** - works with both npx (Node.js) and bunx (Bun)

## Prerequisites

- macOS with Apple Books
- Either:
  - Node.js 18+ (auto-installs dependencies)
  - Bun 1.0+ (zero dependencies, faster) - Install: `curl -fsSL https://bun.sh/install | bash`

## Installation

### Option 1: Run directly with npx (Node.js)

```bash
npx apple-books-export --help
# Automatically installs better-sqlite3 on first run
```

### Option 2: Run directly with bunx (Faster, Bun required)

```bash
bunx apple-books-export --help
# Zero dependencies with Bun
```

### Option 3: Install globally

```bash
# With npm/Node.js
npm install -g apple-books-export

# With Bun (faster, no native compilation)
bun install -g apple-books-export
```

## Usage

### Basic Examples

```bash
# Export to HTML (default format)
npx apple-books-export

# Export to HTML with custom output path
npx apple-books-export html --output ./my-highlights.html

# Export to Markdown (one file per book)
npx apple-books-export markdown --output ./exports

# Export to a single JSON file
npx apple-books-export json --output ./all.json --single-file

# Export to CSV
npx apple-books-export csv --output ./annotations.csv

# Export only highlights (no bookmarks or notes)
npx apple-books-export --highlights-only

# Include bookmarks (excluded by default)
npx apple-books-export --include-bookmarks

# Export only yellow and green highlights
npx apple-books-export --colors yellow,green

# Show help
npx apple-books-export --help
```

### Command Line Options

**Formats:**
- `html` - Interactive HTML with search (default)
- `markdown` - Markdown files with YAML frontmatter
- `json` - JSON export
- `csv` - CSV export

**Usage:**
```bash
npx apple-books-export [format] [options]
bunx apple-books-export [format] [options]  # Faster with Bun
```

| Option | Description | Default |
|--------|-------------|---------|
| `format` | Export format (positional): `html`, `markdown`, `json`, `csv` | `html` |
| `--output <path>` | Output file or directory path | format-specific |
| `--single-file` | Export all books to a single file (markdown/json only) | `false` |
| `--highlights-only` | Export only highlights | `false` |
| `--bookmarks-only` | Export only bookmarks | `false` |
| `--notes-only` | Export only notes | `false` |
| `--include-bookmarks` | Include bookmarks in export | `false` |
| `--colors <colors>` | Filter by colors (comma-separated): `yellow,green,blue,pink,purple,underline` | all colors |
| `--annotations-db <path>` | Custom annotations database path | auto-detect |
| `--library-db <path>` | Custom library database path | auto-detect |
| `--help` | Show help message | - |

**Default output paths:**
- HTML: `./apple-books-export.html`
- JSON: `./apple-books-export.json`
- CSV: `./apple-books-export.csv`
- Markdown: `./exports` (directory)

## Export Formats

### HTML

Creates a single, self-contained HTML file with inline CSS and JavaScript. Perfect for viewing, sharing, or archiving your highlights.

**Features:**
- 🔍 **Real-time search** - Filter books and highlights instantly
- 📑 **Book index** - Jump to any book with one click
- 🎨 **Color-coded highlights** - Visual badges for each color
- 📱 **Responsive design** - Works on mobile and desktop
- 🌙 **Dark mode support** - Adapts to system preferences
- 🖨️ **Print-friendly** - Clean layout for printing
- 📦 **Single file** - Everything embedded, no external dependencies

**Example structure:**
```
📚 Apple Books Highlights
   [Search box]
   685 highlights from 157 books

Books:
   • Book Title 1 (25)
   • Book Title 2 (12)
   ...

Book Title 1
by Author Name

🟡 Highlighted text here
   January 15, 2023
```

### Markdown

Creates readable Markdown files with YAML frontmatter. Each book gets its own file (or combine with `--single-file`).

**Example output:**
```markdown
---
title: "The Pragmatic Programmer"
author: "David Thomas"
genre: "Computers"
exported: "2026-01-28T00:00:00Z"
totalAnnotations: 28
highlights: 25
bookmarks: 2
notes: 1
---

# The Pragmatic Programmer
**by David Thomas**

*28 annotations*

## 🟡 ✨ Highlight - Chapter 3
**Created:** January 15, 2023, 10:30 AM

> Selected text that was highlighted

**Note:** *Optional personal note*

---
```

### JSON

Exports to structured JSON format with full metadata.

**Example output:**
```json
{
  "exported": "2026-01-28T00:00:00Z",
  "totalBooks": 157,
  "totalAnnotations": 858,
  "statistics": {
    "highlights": 687,
    "bookmarks": 155,
    "notes": 16
  },
  "books": [
    {
      "assetId": "asset-id-here",
      "title": "Book Title",
      "author": "Author Name",
      "annotations": [
        {
          "id": 123,
          "type": "highlight",
          "color": "yellow",
          "text": "Highlighted text",
          "note": null,
          "createdAt": "2023-01-15T10:30:00Z"
        }
      ]
    }
  ]
}
```

### CSV

Exports to flat CSV format suitable for Excel or data analysis.

**Example output:**
```csv
assetId,title,author,genre,annotationId,type,color,text,note,location,createdAt
"asset-123","Book Title","Author","Genre",123,"highlight","yellow","Text here","","Chapter 3","2023-01-15 10:30:00"
```

## How It Works

This tool directly reads Apple Books' SQLite databases:

- **Annotations Database**: `~/Library/Containers/com.apple.iBooksX/Data/Documents/AEAnnotation/`
- **Library Database**: `~/Library/Containers/com.apple.iBooksX/Data/Documents/BKLibrary/`

It joins the two databases to match annotations with book metadata, then exports to your chosen format.

## Highlight Colors

Apple Books supports multiple highlight colors:

- 🟡 Yellow
- 🟢 Green
- 🔵 Blue
- 🔴 Pink
- 🟣 Purple
- ➖ Underline

## Troubleshooting

### "Database not found" error

Make sure Apple Books is installed and you have some books with annotations. The databases are only created after you've added highlights or bookmarks.

### "Permission denied" error

The tool needs read access to your Library folder. This should work by default on macOS.

### No annotations exported

Check that:
1. You have actually highlighted or bookmarked content in Apple Books
2. You're not using overly restrictive filters (like `--colors pink` if you only have yellow highlights)

## Development

```bash
# Clone the repository
git clone https://github.com/yourusername/apple-books-export.git
cd apple-books-export

# Install dependencies
bun install  # or npm install

# Run directly with Bun
bun run src/index.ts --help

# Build the package
bun run build

# Test the built package locally
bun ./dist/index.js --help
node ./dist/index.js --help

# Test package installation
npm pack
npm install -g apple-books-export-1.0.0.tgz
```

## Project Structure

```
apple-books-export/
├── src/
│   ├── index.ts              # CLI entry point
│   ├── database.ts           # SQLite query logic
│   ├── types.ts              # TypeScript interfaces
│   └── exporters/
│       ├── html.ts           # HTML export (default)
│       ├── markdown.ts       # Markdown export
│       ├── json.ts           # JSON export
│       └── csv.ts            # CSV export
├── package.json
├── tsconfig.json
└── README.md
```

## Future Enhancements

Potential features for future versions:

- 🔄 Incremental sync (only export new annotations)
- 📊 Statistics and analytics dashboard
- 🔗 Integration with Obsidian, Notion, Roam
- 📄 PDF export format

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Acknowledgments

Inspired by similar projects:
- [jladicos/apple-books-highlights](https://github.com/jladicos/apple-books-highlights)
- [angela-zhao/apple-books-annotations-exporter](https://github.com/angela-zhao/apple-books-annotations-exporter)

Built with [Bun](https://bun.sh) - the fast all-in-one JavaScript runtime.
