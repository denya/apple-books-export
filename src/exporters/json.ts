import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import type { Book } from "../types.js";

/**
 * Export all books to a single JSON file
 */
export function exportToJson(books: Book[], outputPath: string, singleFile: boolean = true): string | string[] {
  if (singleFile) {
    return exportToSingleJson(books, outputPath);
  } else {
    return exportToMultipleJson(books, outputPath);
  }
}

/**
 * Export all books to a single JSON file
 */
function exportToSingleJson(books: Book[], outputPath: string): string {
  // Ensure parent directory exists
  mkdirSync(dirname(outputPath), { recursive: true });

  const totalAnnotations = books.reduce((sum, book) => sum + book.annotations.length, 0);
  const totalHighlights = books.reduce(
    (sum, book) => sum + book.annotations.filter(a => a.type === 'highlight').length,
    0
  );
  const totalBookmarks = books.reduce(
    (sum, book) => sum + book.annotations.filter(a => a.type === 'bookmark').length,
    0
  );
  const totalNotes = books.reduce(
    (sum, book) => sum + book.annotations.filter(a => a.type === 'note').length,
    0
  );

  const exportData = {
    exported: new Date().toISOString(),
    totalBooks: books.length,
    totalAnnotations,
    statistics: {
      highlights: totalHighlights,
      bookmarks: totalBookmarks,
      notes: totalNotes,
    },
    books: books.map(book => ({
      assetId: book.assetId,
      title: book.title,
      author: book.author,
      genre: book.genre,
      annotationCount: book.annotations.length,
      annotations: book.annotations.map(ann => ({
        id: ann.id,
        type: ann.type,
        color: ann.color,
        text: ann.text,
        note: ann.note,
        location: ann.location,
        chapter: ann.chapter,
        createdAt: ann.createdAt.toISOString(),
        modifiedAt: ann.modifiedAt.toISOString(),
      })),
    })),
  };

  const json = JSON.stringify(exportData, null, 2);
  writeFileSync(outputPath, json, 'utf-8');

  return outputPath;
}

/**
 * Sanitize filename by removing/replacing invalid characters
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 200);
}

/**
 * Export each book to separate JSON files
 */
function exportToMultipleJson(books: Book[], outputDir: string): string[] {
  // Create output directory
  mkdirSync(outputDir, { recursive: true });

  const filepaths: string[] = [];

  for (const book of books) {
    if (book.annotations.length === 0) continue;

    const bookTitle = book.title || `Unknown Book (${book.assetId.substring(0, 8)})`;
    const filename = sanitizeFilename(`${bookTitle}.json`);
    const filepath = join(outputDir, filename);

    const bookData = {
      assetId: book.assetId,
      title: book.title,
      author: book.author,
      genre: book.genre,
      exported: new Date().toISOString(),
      annotationCount: book.annotations.length,
      annotations: book.annotations.map(ann => ({
        id: ann.id,
        type: ann.type,
        color: ann.color,
        text: ann.text,
        note: ann.note,
        location: ann.location,
        chapter: ann.chapter,
        createdAt: ann.createdAt.toISOString(),
        modifiedAt: ann.modifiedAt.toISOString(),
      })),
    };

    const json = JSON.stringify(bookData, null, 2);
    writeFileSync(filepath, json, 'utf-8');
    filepaths.push(filepath);
  }

  return filepaths;
}
