# Apple Books Export

[![npm version](https://badge.fury.io/js/apple-books-export.svg)](https://www.npmjs.com/package/apple-books-export)
[![npm downloads](https://img.shields.io/npm/dm/apple-books-export.svg)](https://www.npmjs.com/package/apple-books-export)
[![license](https://img.shields.io/npm/l/apple-books-export.svg)](https://github.com/denya/apple-books-export/blob/main/LICENSE)

Export all your highlights, bookmarks, and notes from Apple Books on macOS.

## What is this?

If you highlight books in Apple Books, this tool lets you export all your highlights to HTML, Markdown, JSON, or CSV. Perfect for:

- Backing up your highlights
- Searching through all your notes
- Sharing quotes from books you've read
- Importing highlights into note-taking apps

## Quick Start

No installation needed! Just run:

```bash
bunx apple-books-export
```

This creates an `apple-books-export.html` file with all your highlights in a searchable, interactive page.

**Don't have Bun?** Install it with: `curl -fsSL https://bun.sh/install | bash`

Or use Node.js instead: `npx apple-books-export`

## Common Uses

```bash
# Export to searchable HTML (default)
bunx apple-books-export

# Export to Markdown files (one per book)
bunx apple-books-export markdown

# Export to a single JSON file
bunx apple-books-export json --single-file

# Export only highlights (skip bookmarks)
bunx apple-books-export --highlights-only

# Export only yellow highlights
bunx apple-books-export --colors yellow
```

## Export Formats

### HTML (default)
Creates a single webpage with all your highlights. Includes search, color-coding, and works offline.

### Markdown
Creates readable text files with YAML metadata. Great for importing into Obsidian or Notion.

### JSON
Exports raw data with all metadata. Useful for custom processing or analysis.

### CSV
Spreadsheet format for Excel or data analysis.

## Options

Run `bunx apple-books-export --help` to see all options.

Common options:
- `--output <path>` - Custom output location
- `--single-file` - Combine all books into one file (for Markdown/JSON)
- `--highlights-only` - Skip bookmarks and notes
- `--colors yellow,green` - Only export specific highlight colors

## Troubleshooting

**"Database not found"** - Make sure you have Apple Books installed and have created at least one highlight or bookmark.

**No highlights exported** - Check that you're not using filters that exclude all your highlights (e.g., `--colors pink` when you only have yellow highlights).

## License

MIT - Free to use and modify.

## Credits

Built with [Bun](https://bun.sh). Inspired by [jladicos/apple-books-highlights](https://github.com/jladicos/apple-books-highlights) and [angela-zhao/apple-books-annotations-exporter](https://github.com/angela-zhao/apple-books-annotations-exporter).
