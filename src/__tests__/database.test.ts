import { describe, it, expect } from 'vitest';
import {
  convertAppleDate,
  transformAnnotations,
  groupByBook,
  filterAnnotations,
} from '../database.js';
import type { RawAnnotation, Annotation } from '../types.js';

describe('convertAppleDate', () => {
  it('should convert Apple timestamp to JavaScript Date', () => {
    // Apple epoch: 2001-01-01 00:00:00 UTC
    // Unix timestamp for 2001-01-01 00:00:00 UTC: 978307200 seconds
    // Apple timestamp 0 = Unix timestamp 978307200

    const appleTimestamp = 0;
    const date = convertAppleDate(appleTimestamp);

    expect(date.getFullYear()).toBe(2001);
    expect(date.getMonth()).toBe(0); // January (0-indexed)
    expect(date.getDate()).toBe(1);
  });

  it('should handle positive timestamps', () => {
    // 1 year after Apple epoch (2002-01-01)
    const oneYearInSeconds = 365 * 24 * 60 * 60;
    const date = convertAppleDate(oneYearInSeconds);

    expect(date.getFullYear()).toBe(2002);
  });
});

describe('transformAnnotations', () => {
  it('should transform raw annotations to structured format', () => {
    const rawAnnotations: RawAnnotation[] = [
      {
        id: 1,
        assetId: 'book-123',
        text: 'Test highlight',
        note: null,
        style: 3, // yellow
        location: 'page-1',
        createdAt: 0,
        modifiedAt: 0,
        deleted: 0,
        title: 'Test Book',
        author: 'Test Author',
        genre: 'Fiction',
      },
    ];

    const result = transformAnnotations(rawAnnotations);

    expect(result).toHaveLength(1);
    expect(result[0]?.type).toBe('highlight');
    expect(result[0]?.color).toBe('yellow');
    expect(result[0]?.text).toBe('Test highlight');
    expect(result[0]?.createdAt).toBeInstanceOf(Date);
  });

  it('should identify notes correctly', () => {
    const rawAnnotations: RawAnnotation[] = [
      {
        id: 1,
        assetId: 'book-123',
        text: 'Some text',
        note: 'My note',
        style: 3,
        location: 'page-1',
        createdAt: 0,
        modifiedAt: 0,
        deleted: 0,
        title: 'Test Book',
        author: 'Test Author',
        genre: 'Fiction',
      },
    ];

    const result = transformAnnotations(rawAnnotations);
    expect(result[0]?.type).toBe('note');
  });

  it('should identify bookmarks correctly', () => {
    const rawAnnotations: RawAnnotation[] = [
      {
        id: 1,
        assetId: 'book-123',
        text: null,
        note: null,
        style: 3,
        location: 'page-1',
        createdAt: 0,
        modifiedAt: 0,
        deleted: 0,
        title: 'Test Book',
        author: 'Test Author',
        genre: 'Fiction',
      },
    ];

    const result = transformAnnotations(rawAnnotations);
    expect(result[0]?.type).toBe('bookmark');
  });

  it('should map all color styles correctly', () => {
    const colorMap = [
      { style: 0, color: 'underline' },
      { style: 1, color: 'green' },
      { style: 2, color: 'blue' },
      { style: 3, color: 'yellow' },
      { style: 4, color: 'pink' },
      { style: 5, color: 'purple' },
    ];

    colorMap.forEach(({ style, color }) => {
      const rawAnnotations: RawAnnotation[] = [
        {
          id: 1,
          assetId: 'book-123',
          text: 'Test',
          note: null,
          style,
          location: 'page-1',
          createdAt: 0,
          modifiedAt: 0,
          deleted: 0,
          title: 'Test Book',
          author: 'Test Author',
          genre: 'Fiction',
        },
      ];

      const result = transformAnnotations(rawAnnotations);
      expect(result[0]?.color).toBe(color);
    });
  });
});

describe('groupByBook', () => {
  it('should group annotations by assetId', () => {
    const rawAnnotations: RawAnnotation[] = [
      {
        id: 1,
        assetId: 'book-1',
        text: 'Highlight 1',
        note: null,
        style: 3,
        location: 'page-1',
        createdAt: 0,
        modifiedAt: 0,
        deleted: 0,
        title: 'Book One',
        author: 'Author One',
        genre: 'Fiction',
      },
      {
        id: 2,
        assetId: 'book-1',
        text: 'Highlight 2',
        note: null,
        style: 3,
        location: 'page-2',
        createdAt: 0,
        modifiedAt: 0,
        deleted: 0,
        title: 'Book One',
        author: 'Author One',
        genre: 'Fiction',
      },
      {
        id: 3,
        assetId: 'book-2',
        text: 'Highlight 3',
        note: null,
        style: 3,
        location: 'page-1',
        createdAt: 0,
        modifiedAt: 0,
        deleted: 0,
        title: 'Book Two',
        author: 'Author Two',
        genre: 'Non-Fiction',
      },
    ];

    const result = groupByBook(rawAnnotations);

    expect(result).toHaveLength(2);
    expect(result[0]?.assetId).toBe('book-1');
    expect(result[0]?.annotations).toHaveLength(2);
    expect(result[1]?.assetId).toBe('book-2');
    expect(result[1]?.annotations).toHaveLength(1);
  });

  it('should preserve book metadata', () => {
    const rawAnnotations: RawAnnotation[] = [
      {
        id: 1,
        assetId: 'book-1',
        text: 'Highlight',
        note: null,
        style: 3,
        location: 'page-1',
        createdAt: 0,
        modifiedAt: 0,
        deleted: 0,
        title: 'Book Title',
        author: 'Book Author',
        genre: 'Biography',
      },
    ];

    const result = groupByBook(rawAnnotations);

    expect(result[0]?.title).toBe('Book Title');
    expect(result[0]?.author).toBe('Book Author');
    expect(result[0]?.genre).toBe('Biography');
  });
});

describe('filterAnnotations', () => {
  const sampleAnnotations: Annotation[] = [
    {
      id: 1,
      type: 'highlight',
      color: 'yellow',
      text: 'Yellow highlight',
      note: null,
      location: 'page-1',
      chapter: null,
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
    {
      id: 2,
      type: 'highlight',
      color: 'green',
      text: 'Green highlight',
      note: null,
      location: 'page-2',
      chapter: null,
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
    {
      id: 3,
      type: 'bookmark',
      color: 'yellow',
      text: null,
      note: null,
      location: 'page-3',
      chapter: null,
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
    {
      id: 4,
      type: 'note',
      color: 'yellow',
      text: 'Text with note',
      note: 'My note',
      location: 'page-4',
      chapter: null,
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
  ];

  it('should filter by type - highlights only', () => {
    const result = filterAnnotations(sampleAnnotations, {
      includeHighlights: true,
      includeBookmarks: false,
      includeNotes: false,
    });

    expect(result).toHaveLength(2);
    expect(result.every((a) => a.type === 'highlight')).toBe(true);
  });

  it('should filter by type - bookmarks only', () => {
    const result = filterAnnotations(sampleAnnotations, {
      includeHighlights: false,
      includeBookmarks: true,
      includeNotes: false,
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.type).toBe('bookmark');
  });

  it('should filter by type - notes only', () => {
    const result = filterAnnotations(sampleAnnotations, {
      includeHighlights: false,
      includeBookmarks: false,
      includeNotes: true,
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.type).toBe('note');
  });

  it('should filter by color', () => {
    const result = filterAnnotations(sampleAnnotations, {
      includeHighlights: true,
      includeBookmarks: true,
      includeNotes: true,
      colorFilters: ['green'],
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.color).toBe('green');
  });

  it('should filter by multiple colors', () => {
    const result = filterAnnotations(sampleAnnotations, {
      includeHighlights: true,
      includeBookmarks: true,
      includeNotes: true,
      colorFilters: ['yellow', 'green'],
    });

    expect(result).toHaveLength(4);
  });

  it('should combine type and color filters', () => {
    const result = filterAnnotations(sampleAnnotations, {
      includeHighlights: true,
      includeBookmarks: false,
      includeNotes: false,
      colorFilters: ['yellow'],
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.type).toBe('highlight');
    expect(result[0]?.color).toBe('yellow');
  });

  it('should return all annotations when all filters enabled', () => {
    const result = filterAnnotations(sampleAnnotations, {
      includeHighlights: true,
      includeBookmarks: true,
      includeNotes: true,
    });

    expect(result).toHaveLength(4);
  });
});
