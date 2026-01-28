#!/usr/bin/env node

import { findDatabases, queryAnnotations, groupByBook, filterAnnotations } from "./database";
import { exportToMarkdown, exportToSingleMarkdown } from "./exporters/markdown";
import { exportToJson } from "./exporters/json";
import { exportToCsv } from "./exporters/csv";
import { exportToHtml } from "./exporters/html";
import type { ExportFormat, AnnotationColor } from "./types";

interface CliOptions {
  format: ExportFormat;
  output: string;
  singleFile: boolean;
  highlightsOnly: boolean;
  bookmarksOnly: boolean;
  notesOnly: boolean;
  includeBookmarks: boolean;
  colors?: AnnotationColor[];
  annotationsDb?: string;
  libraryDb?: string;
  help: boolean;
}

function printHelp() {
  console.log(`
Apple Books Export Tool
Export highlights, bookmarks, and notes from Apple Books

USAGE:
  npx apple-books-export [FORMAT] [OPTIONS]
  bunx apple-books-export [FORMAT] [OPTIONS]  # Faster with Bun

FORMATS:
  html                      Interactive HTML (default)
  markdown                  Markdown files
  json                      JSON export
  csv                       CSV export

OPTIONS:
  --output <path>           Output file path
  --single-file             Export all books to a single file (markdown/json only)
  --highlights-only         Export only highlights
  --bookmarks-only          Export only bookmarks
  --notes-only              Export only notes
  --include-bookmarks       Include bookmarks (excluded by default)
  --colors <colors>         Filter by colors: yellow,green,blue,pink,purple,underline
  --annotations-db <path>   Custom annotations database path
  --library-db <path>       Custom library database path
  --help                    Show this help message

EXAMPLES:
  # Export to HTML (default)
  npx apple-books-export
  npx apple-books-export html

  # Export to Markdown (one file per book)
  npx apple-books-export markdown --output ./exports

  # Export to single JSON file
  npx apple-books-export json --output ./all.json --single-file

  # Export only yellow and green highlights
  npx apple-books-export html --highlights-only --colors yellow,green

  # Include bookmarks in export
  npx apple-books-export html --include-bookmarks
`);
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {
    format: 'html',
    output: '',
    singleFile: false,
    highlightsOnly: false,
    bookmarksOnly: false,
    notesOnly: false,
    includeBookmarks: false,
    help: false,
  };

  // Check for positional format argument (first arg without --)
  if (args.length > 0 && !args[0].startsWith('--')) {
    const formatArg = args[0].toLowerCase();
    if (['html', 'markdown', 'json', 'csv'].includes(formatArg)) {
      options.format = formatArg as ExportFormat;
      args.shift(); // Remove the format argument
    }
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--help':
      case '-h':
        options.help = true;
        break;

      case '--format':
      case '-f':
        options.format = args[++i] as ExportFormat;
        break;

      case '--output':
      case '-o':
        options.output = args[++i];
        break;

      case '--single-file':
        options.singleFile = true;
        break;

      case '--highlights-only':
        options.highlightsOnly = true;
        break;

      case '--bookmarks-only':
        options.bookmarksOnly = true;
        break;

      case '--notes-only':
        options.notesOnly = true;
        break;

      case '--include-bookmarks':
        options.includeBookmarks = true;
        break;

      case '--colors':
        options.colors = args[++i].split(',') as AnnotationColor[];
        break;

      case '--annotations-db':
        options.annotationsDb = args[++i];
        break;

      case '--library-db':
        options.libraryDb = args[++i];
        break;
    }
  }

  // Set default output paths based on format if not specified
  if (!options.output) {
    switch (options.format) {
      case 'html':
        options.output = './apple-books-export.html';
        break;
      case 'json':
        options.output = './apple-books-export.json';
        break;
      case 'csv':
        options.output = './apple-books-export.csv';
        break;
      case 'markdown':
        options.output = './exports';
        break;
    }
  }

  return options;
}

async function main() {
  const options = parseArgs();

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  console.log('🍎 Apple Books Export Tool\n');

  try {
    // Find databases
    console.log('📚 Finding Apple Books databases...');
    const { annotationsDb, libraryDb } = findDatabases({
      annotations: options.annotationsDb,
      library: options.libraryDb,
    });

    console.log(`  ✓ Annotations: ${annotationsDb}`);
    console.log(`  ✓ Library: ${libraryDb}\n`);

    // Query annotations
    console.log('🔍 Reading annotations...');
    const rawAnnotations = queryAnnotations(annotationsDb, libraryDb);
    console.log(`  ✓ Found ${rawAnnotations.length} annotations\n`);

    // Group by book
    console.log('📖 Grouping by book...');
    const allBooks = groupByBook(rawAnnotations);
    console.log(`  ✓ Found ${allBooks.length} books\n`);

    // Filter annotations based on options
    const includeHighlights = !options.bookmarksOnly && !options.notesOnly;
    const includeBookmarks = options.includeBookmarks || options.bookmarksOnly;
    const includeNotes = !options.highlightsOnly && !options.bookmarksOnly;

    const filteredBooks = allBooks.map(book => ({
      ...book,
      annotations: filterAnnotations(book.annotations, {
        includeHighlights,
        includeBookmarks,
        includeNotes,
        colorFilters: options.colors,
      }),
    })).filter(book => book.annotations.length > 0);

    if (filteredBooks.length === 0) {
      console.log('⚠️  No annotations match the specified filters');
      process.exit(0);
    }

    const totalAnnotations = filteredBooks.reduce((sum, book) => sum + book.annotations.length, 0);
    console.log(`📊 Export statistics:`);
    console.log(`  • Books: ${filteredBooks.length}`);
    console.log(`  • Annotations: ${totalAnnotations}`);

    const highlights = filteredBooks.reduce(
      (sum, book) => sum + book.annotations.filter(a => a.type === 'highlight').length,
      0
    );
    const bookmarks = filteredBooks.reduce(
      (sum, book) => sum + book.annotations.filter(a => a.type === 'bookmark').length,
      0
    );
    const notes = filteredBooks.reduce(
      (sum, book) => sum + book.annotations.filter(a => a.type === 'note').length,
      0
    );

    if (highlights > 0) console.log(`    - Highlights: ${highlights}`);
    if (bookmarks > 0) console.log(`    - Bookmarks: ${bookmarks}`);
    if (notes > 0) console.log(`    - Notes: ${notes}`);

    const orphaned = allBooks.filter(book => !book.title).length;
    if (orphaned > 0) {
      console.log(`    - Orphaned annotations: ${orphaned} books`);
    }

    console.log();

    // Export
    console.log(`💾 Exporting to ${options.format}...`);

    let result: string | string[];

    switch (options.format) {
      case 'html':
        result = exportToHtml(filteredBooks, options.output);
        console.log(`  ✓ Exported to: ${result}`);
        break;

      case 'markdown':
        if (options.singleFile) {
          result = exportToSingleMarkdown(filteredBooks, options.output);
          console.log(`  ✓ Exported to: ${result}`);
        } else {
          result = exportToMarkdown(filteredBooks, options.output);
          console.log(`  ✓ Exported ${result.length} files to: ${options.output}`);
        }
        break;

      case 'json':
        result = exportToJson(filteredBooks, options.output, options.singleFile);
        if (Array.isArray(result)) {
          console.log(`  ✓ Exported ${result.length} files to: ${options.output}`);
        } else {
          console.log(`  ✓ Exported to: ${result}`);
        }
        break;

      case 'csv':
        result = exportToCsv(filteredBooks, options.output);
        console.log(`  ✓ Exported to: ${result}`);
        break;

      default:
        throw new Error(`Unknown format: ${options.format}`);
    }

    console.log('\n✅ Export complete!\n');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
