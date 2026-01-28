import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { exportToJson } from '../exporters/json.js';
import type { Book } from '../types.js';

const TEST_OUTPUT_DIR = join(process.cwd(), 'test-output-json');

describe('JSON Exporter', () => {
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
          createdAt: new Date('2024-01-01'),
          modifiedAt: new Date('2024-01-01'),
        },
        {
          id: 2,
          type: 'note',
          color: 'yellow',
          text: 'Text with note',
          note: 'My note',
          location: 'page-2',
          chapter: null,
          createdAt: new Date('2024-01-02'),
          modifiedAt: new Date('2024-01-02'),
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
          type: 'highlight',
          color: 'green',
          text: 'Second highlight',
          note: null,
          location: 'page-1',
          chapter: null,
          createdAt: new Date('2024-01-03'),
          modifiedAt: new Date('2024-01-03'),
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

  describe('exportToJson (multiple files)', () => {
    it('should create separate JSON files for each book', () => {
      const outputDir = join(TEST_OUTPUT_DIR, 'multi-json');
      const result = exportToJson(sampleBooks, outputDir, false);

      expect(Array.isArray(result)).toBe(true);
      const resultArray = result as string[];
      expect(resultArray).toHaveLength(2);
      expect(existsSync(resultArray[0]!)).toBe(true);
      expect(existsSync(resultArray[1]!)).toBe(true);
    });

    it('should create valid JSON with correct structure', () => {
      const outputDir = join(TEST_OUTPUT_DIR, 'multi-json');
      const result = exportToJson(sampleBooks, outputDir, false) as string[];

      const content = readFileSync(result[0]!, 'utf-8');
      const json = JSON.parse(content);

      expect(json.title).toBe('Test Book One');
      expect(json.author).toBe('Test Author One');
      expect(json.genre).toBe('Fiction');
      expect(json.annotations).toBeInstanceOf(Array);
      expect(json.annotations).toHaveLength(2);
    });

    it('should include all annotation fields', () => {
      const outputDir = join(TEST_OUTPUT_DIR, 'multi-json');
      const result = exportToJson(sampleBooks, outputDir, false) as string[];

      const content = readFileSync(result[0]!, 'utf-8');
      const json = JSON.parse(content);
      const annotation = json.annotations[0];

      expect(annotation).toHaveProperty('id');
      expect(annotation).toHaveProperty('type');
      expect(annotation).toHaveProperty('color');
      expect(annotation).toHaveProperty('text');
      expect(annotation).toHaveProperty('note');
      expect(annotation).toHaveProperty('location');
      expect(annotation).toHaveProperty('createdAt');
      expect(annotation).toHaveProperty('modifiedAt');
    });

    it('should sanitize filenames', () => {
      const booksWithSpecialChars: Book[] = [
        {
          ...sampleBooks[0]!,
          title: 'Test: Book / Special * Chars?',
        },
      ];

      const outputDir = join(TEST_OUTPUT_DIR, 'special-chars');
      const result = exportToJson(booksWithSpecialChars, outputDir, false) as string[];

      expect(result[0]).toBeTruthy();
      expect(existsSync(result[0]!)).toBe(true);
      // Check just the filename part (not the full path)
      const filename = result[0]!.split('/').pop() || '';
      expect(filename).not.toMatch(/[:/*?]/);
      expect(filename).toContain('Test-');
      expect(filename).toContain('Book');
    });
  });

  describe('exportToJson (single file)', () => {
    it('should create a single JSON file', () => {
      const outputPath = join(TEST_OUTPUT_DIR, 'export.json');
      const result = exportToJson(sampleBooks, outputPath, true) as string;

      expect(result).toBe(outputPath);
      expect(existsSync(outputPath)).toBe(true);
    });

    it('should include all books in the export', () => {
      const outputPath = join(TEST_OUTPUT_DIR, 'export.json');
      exportToJson(sampleBooks, outputPath, true);

      const content = readFileSync(outputPath, 'utf-8');
      const json = JSON.parse(content);

      expect(json.books).toBeInstanceOf(Array);
      expect(json.books).toHaveLength(2);
    });

    it('should include metadata in single file export', () => {
      const outputPath = join(TEST_OUTPUT_DIR, 'export.json');
      exportToJson(sampleBooks, outputPath, true);

      const content = readFileSync(outputPath, 'utf-8');
      const json = JSON.parse(content);

      expect(json).toHaveProperty('exported');
      expect(json).toHaveProperty('totalBooks');
      expect(json).toHaveProperty('totalAnnotations');
      expect(json.totalBooks).toBe(2);
      expect(json.totalAnnotations).toBe(3);
    });

    it('should handle books with null/undefined fields', () => {
      const booksWithNulls: Book[] = [
        {
          assetId: 'orphan-book',
          title: null,
          author: null,
          genre: null,
          annotations: [
            {
              id: 1,
              type: 'highlight',
              color: 'yellow',
              text: null,
              note: null,
              location: 'unknown',
              chapter: null,
              createdAt: new Date(),
              modifiedAt: new Date(),
            },
          ],
        },
      ];

      const outputPath = join(TEST_OUTPUT_DIR, 'nulls.json');
      exportToJson(booksWithNulls, outputPath, true);

      const content = readFileSync(outputPath, 'utf-8');
      const json = JSON.parse(content);

      expect(json.books[0]?.title).toBeNull();
      expect(json.books[0]?.annotations[0]?.text).toBeNull();
    });
  });
});
