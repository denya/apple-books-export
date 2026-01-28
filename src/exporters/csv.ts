import { writeFileSync, mkdirSync } from "fs";
import { dirname } from "path";
import type { Book } from "../types.js";

/**
 * Escape CSV field value
 */
function escapeCsvField(value: string | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // If the value contains quotes, commas, or newlines, it needs to be quoted
  if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n')) {
    // Escape quotes by doubling them
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Format date for CSV
 */
function formatDate(date: Date): string {
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

/**
 * Export books to CSV file
 */
export function exportToCsv(books: Book[], outputPath: string): string {
  // Ensure parent directory exists
  mkdirSync(dirname(outputPath), { recursive: true });

  // CSV header
  const headers = [
    'assetId',
    'title',
    'author',
    'genre',
    'annotationId',
    'type',
    'color',
    'text',
    'note',
    'location',
    'chapter',
    'createdAt',
    'modifiedAt',
  ];

  let csv = headers.join(',') + '\n';

  // Add rows
  for (const book of books) {
    for (const annotation of book.annotations) {
      const row = [
        escapeCsvField(book.assetId),
        escapeCsvField(book.title),
        escapeCsvField(book.author),
        escapeCsvField(book.genre),
        escapeCsvField(String(annotation.id)),
        escapeCsvField(annotation.type),
        escapeCsvField(annotation.color),
        escapeCsvField(annotation.text),
        escapeCsvField(annotation.note),
        escapeCsvField(annotation.location),
        escapeCsvField(annotation.chapter),
        escapeCsvField(formatDate(annotation.createdAt)),
        escapeCsvField(formatDate(annotation.modifiedAt)),
      ];

      csv += row.join(',') + '\n';
    }
  }

  writeFileSync(outputPath, csv, 'utf-8');
  return outputPath;
}
