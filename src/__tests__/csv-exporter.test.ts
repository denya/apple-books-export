import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { exportToCsv } from '../exporters/csv.js';
import type { Book } from '../types.js';

const TEST_OUTPUT_DIR = join(process.cwd(), 'test-output-csv');

describe('CSV Exporter', () => {
  const sampleBooks: Book[] = [
    {
      assetId: 'book-1',
      title: 'Test Book One',
      author: 'Test Author One',
      genre: 'Fiction',
      annotations: [
        {
          id: 1,
          type: 'highlight',
          color: 'yellow',
          text: 'First highlight',
          note: null,
          location: 'page-1',
          chapter: null,
          createdAt: new Date('2024-01-01T10:00:00Z'),
          modifiedAt: new Date('2024-01-01T10:00:00Z'),
        },
        {
          id: 2,
          type: 'note',
          color: 'yellow',
          text: 'Text with note',
          note: 'My note',
          location: 'page-2',
          chapter: null,
          createdAt: new Date('2024-01-02T11:00:00Z'),
          modifiedAt: new Date('2024-01-02T11:00:00Z'),
        },
      ],
    },
    {
      assetId: 'book-2',
      title: 'Test Book Two',
      author: 'Test Author Two',
      genre: 'Non-Fiction',
      annotations: [
        {
          id: 3,
          type: 'bookmark',
          color: 'yellow',
          text: null,
          note: null,
          location: 'page-5',
          chapter: null,
          createdAt: new Date('2024-01-03T12:00:00Z'),
          modifiedAt: new Date('2024-01-03T12:00:00Z'),
        },
      ],
    },
  ];

  beforeEach(() => {
    // Create test output directory
    if (existsSync(TEST_OUTPUT_DIR)) {
      rmSync(TEST_OUTPUT_DIR, { recursive: true, force: true });
    }
    mkdirSync(TEST_OUTPUT_DIR, { recursive: true });
  });

  afterEach(() => {
    // Clean up test output
    if (existsSync(TEST_OUTPUT_DIR)) {
      rmSync(TEST_OUTPUT_DIR, { recursive: true, force: true });
    }
  });

  it('should create a CSV file', () => {
    const outputPath = join(TEST_OUTPUT_DIR, 'export.csv');
    const result = exportToCsv(sampleBooks, outputPath);

    expect(result).toBe(outputPath);
    expect(existsSync(outputPath)).toBe(true);
  });

  it('should include CSV header row', () => {
    const outputPath = join(TEST_OUTPUT_DIR, 'export.csv');
    exportToCsv(sampleBooks, outputPath);

    const content = readFileSync(outputPath, 'utf-8');
    const lines = content.split('\n');

    expect(lines[0]).toContain('assetId');
    expect(lines[0]).toContain('title');
    expect(lines[0]).toContain('author');
    expect(lines[0]).toContain('genre');
    expect(lines[0]).toContain('type');
    expect(lines[0]).toContain('color');
    expect(lines[0]).toContain('text');
    expect(lines[0]).toContain('note');
    expect(lines[0]).toContain('location');
    expect(lines[0]).toContain('createdAt');
  });

  it('should export all annotations from all books', () => {
    const outputPath = join(TEST_OUTPUT_DIR, 'export.csv');
    exportToCsv(sampleBooks, outputPath);

    const content = readFileSync(outputPath, 'utf-8');
    const lines = content.split('\n').filter((l) => l.trim() !== '');

    // 1 header + 3 annotations
    expect(lines.length).toBe(4);
  });

  it('should properly escape CSV fields with commas', () => {
    const booksWithCommas: Book[] = [
      {
        assetId: 'book-1',
        title: 'Test, Book, With, Commas',
        author: 'Author, Name',
        genre: 'Fiction',
        annotations: [
          {
            id: 1,
            type: 'highlight',
            color: 'yellow',
            text: 'Text with, commas, in it',
            note: 'Note, with, commas',
            location: 'page-1',
            chapter: null,
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
        ],
      },
    ];

    const outputPath = join(TEST_OUTPUT_DIR, 'commas.csv');
    exportToCsv(booksWithCommas, outputPath);

    const content = readFileSync(outputPath, 'utf-8');

    // Fields with commas should be quoted
    expect(content).toContain('"Test, Book, With, Commas"');
    expect(content).toContain('"Author, Name"');
    expect(content).toContain('"Text with, commas, in it"');
  });

  it('should properly escape CSV fields with quotes', () => {
    const booksWithQuotes: Book[] = [
      {
        assetId: 'book-1',
        title: 'Test "Book" Title',
        author: 'Author',
        genre: 'Fiction',
        annotations: [
          {
            id: 1,
            type: 'highlight',
            color: 'yellow',
            text: 'Text with "quotes"',
            note: null,
            location: 'page-1',
            chapter: null,
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
        ],
      },
    ];

    const outputPath = join(TEST_OUTPUT_DIR, 'quotes.csv');
    exportToCsv(booksWithQuotes, outputPath);

    const content = readFileSync(outputPath, 'utf-8');

    // Quotes should be escaped by doubling them
    expect(content).toContain('Test ""Book"" Title');
    expect(content).toContain('Text with ""quotes""');
  });

  it('should handle null/undefined fields', () => {
    const booksWithNulls: Book[] = [
      {
        assetId: 'book-1',
        title: null,
        author: null,
        genre: null,
        annotations: [
          {
            id: 1,
            type: 'bookmark',
            color: 'yellow',
            text: null,
            note: null,
            location: 'page-1',
            chapter: null,
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
        ],
      },
    ];

    const outputPath = join(TEST_OUTPUT_DIR, 'nulls.csv');
    exportToCsv(booksWithNulls, outputPath);

    const content = readFileSync(outputPath, 'utf-8');
    const lines = content.split('\n');

    // Should have header + 1 data row
    expect(lines.length).toBeGreaterThanOrEqual(2);

    // Null fields should be empty or contain empty string
    const dataLine = lines[1];
    expect(dataLine).toBeDefined();
  });

  it('should handle newlines in text', () => {
    const booksWithNewlines: Book[] = [
      {
        assetId: 'book-1',
        title: 'Test Book',
        author: 'Author',
        genre: 'Fiction',
        annotations: [
          {
            id: 1,
            type: 'highlight',
            color: 'yellow',
            text: 'Line 1\nLine 2\nLine 3',
            note: 'Note\nwith\nnewlines',
            location: 'page-1',
            chapter: null,
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
        ],
      },
    ];

    const outputPath = join(TEST_OUTPUT_DIR, 'newlines.csv');
    exportToCsv(booksWithNewlines, outputPath);

    const content = readFileSync(outputPath, 'utf-8');

    // Fields with newlines should be quoted
    expect(content).toContain('"Line 1\nLine 2\nLine 3"');
  });
});
