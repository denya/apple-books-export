import { Database } from "./db-adapter.js";
import { homedir } from "os";
import { join } from "path";
import { existsSync, readdirSync } from "fs";
import type { Annotation, Book, RawAnnotation, AnnotationType, AnnotationColor } from "./types";

const APPLE_BOOKS_CONTAINER = join(
  homedir(),
  "Library/Containers/com.apple.iBooksX/Data/Documents"
);

/**
 * Convert Apple's 2001-01-01 epoch timestamp to JavaScript Date
 */
export function convertAppleDate(timestamp: number): Date {
  // Apple epoch starts at 2001-01-01 00:00:00 UTC
  // Unix epoch starts at 1970-01-01 00:00:00 UTC
  // Difference is 978307200 seconds
  const APPLE_EPOCH_OFFSET = 978307200;
  return new Date((timestamp + APPLE_EPOCH_OFFSET) * 1000);
}

/**
 * Map Apple's annotation style code to type and color
 */
function mapAnnotationStyle(style: number): { type: AnnotationType; color: AnnotationColor } {
  // Based on research:
  // 0 = underline (highlight)
  // 1 = green highlight
  // 2 = blue highlight
  // 3 = yellow highlight
  // 4 = pink highlight
  // 5 = purple highlight

  const styleMap: Record<number, { type: AnnotationType; color: AnnotationColor }> = {
    0: { type: 'highlight', color: 'underline' },
    1: { type: 'highlight', color: 'green' },
    2: { type: 'highlight', color: 'blue' },
    3: { type: 'highlight', color: 'yellow' },
    4: { type: 'highlight', color: 'pink' },
    5: { type: 'highlight', color: 'purple' },
  };

  return styleMap[style] || { type: 'highlight', color: 'yellow' };
}

/**
 * Determine annotation type based on content
 */
function determineAnnotationType(raw: RawAnnotation): AnnotationType {
  // If it has a note, it's a note annotation
  if (raw.note && raw.note.trim().length > 0) {
    return 'note';
  }

  // If it has no selected text, it's a bookmark
  if (!raw.text || raw.text.trim().length === 0) {
    return 'bookmark';
  }

  // Otherwise it's a highlight
  return 'highlight';
}

/**
 * Find Apple Books SQLite database files
 */
export function findDatabases(customPaths?: { annotations?: string; library?: string }): {
  annotationsDb: string;
  libraryDb: string;
} {
  if (customPaths?.annotations && customPaths?.library) {
    return {
      annotationsDb: customPaths.annotations,
      libraryDb: customPaths.library,
    };
  }

  // Find AEAnnotation database
  const annotationsDir = join(APPLE_BOOKS_CONTAINER, "AEAnnotation");
  if (!existsSync(annotationsDir)) {
    throw new Error(`Annotations directory not found: ${annotationsDir}`);
  }

  const annotationFiles = readdirSync(annotationsDir).filter(f =>
    f.startsWith("AEAnnotation_") && f.endsWith(".sqlite")
  );

  if (annotationFiles.length === 0) {
    throw new Error(`No annotation database found in ${annotationsDir}`);
  }

  const annotationsDb = join(annotationsDir, annotationFiles[0]);

  // Find BKLibrary database
  const libraryDir = join(APPLE_BOOKS_CONTAINER, "BKLibrary");
  if (!existsSync(libraryDir)) {
    throw new Error(`Library directory not found: ${libraryDir}`);
  }

  const libraryFiles = readdirSync(libraryDir).filter(f =>
    f.startsWith("BKLibrary") && f.endsWith(".sqlite")
  );

  if (libraryFiles.length === 0) {
    throw new Error(`No library database found in ${libraryDir}`);
  }

  const libraryDb = join(libraryDir, libraryFiles[0]);

  return { annotationsDb, libraryDb };
}

/**
 * Query all annotations with book metadata
 */
export function queryAnnotations(
  annotationsDbPath: string,
  libraryDbPath: string
): RawAnnotation[] {
  const annotationsDb = new Database(annotationsDbPath, { readonly: true });

  // Attach the library database
  annotationsDb.run(`ATTACH DATABASE '${libraryDbPath}' AS library`);

  const query = `
    SELECT
      ZAEANNOTATION.Z_PK as id,
      ZAEANNOTATION.ZANNOTATIONASSETID as assetId,
      ZAEANNOTATION.ZANNOTATIONSELECTEDTEXT as text,
      ZAEANNOTATION.ZANNOTATIONNOTE as note,
      ZAEANNOTATION.ZANNOTATIONSTYLE as style,
      ZAEANNOTATION.ZFUTUREPROOFING5 as location,
      ZAEANNOTATION.ZANNOTATIONCREATIONDATE as createdAt,
      ZAEANNOTATION.ZANNOTATIONMODIFICATIONDATE as modifiedAt,
      ZAEANNOTATION.ZANNOTATIONDELETED as deleted,
      library.ZBKLIBRARYASSET.ZTITLE as title,
      library.ZBKLIBRARYASSET.ZAUTHOR as author,
      library.ZBKLIBRARYASSET.ZGENRE as genre
    FROM ZAEANNOTATION
    LEFT JOIN library.ZBKLIBRARYASSET
      ON ZAEANNOTATION.ZANNOTATIONASSETID = library.ZBKLIBRARYASSET.ZASSETID
    WHERE ZAEANNOTATION.ZANNOTATIONDELETED = 0
    ORDER BY title, createdAt
  `;

  const results = annotationsDb.query(query).all() as RawAnnotation[];
  annotationsDb.close();

  return results;
}

/**
 * Transform raw annotations into structured Annotation objects
 */
export function transformAnnotations(rawAnnotations: RawAnnotation[]): Annotation[] {
  return rawAnnotations.map(raw => {
    const type = determineAnnotationType(raw);
    const { color } = mapAnnotationStyle(raw.style);

    return {
      id: raw.id,
      type,
      color,
      text: raw.text,
      note: raw.note,
      location: raw.location,
      chapter: null, // Apple Books doesn't store chapter info in accessible way
      createdAt: convertAppleDate(raw.createdAt),
      modifiedAt: convertAppleDate(raw.modifiedAt),
    };
  });
}

/**
 * Group annotations by book
 */
export function groupByBook(rawAnnotations: RawAnnotation[]): Book[] {
  const bookMap = new Map<string, Book>();

  for (const raw of rawAnnotations) {
    const assetId = raw.assetId;

    if (!bookMap.has(assetId)) {
      bookMap.set(assetId, {
        assetId,
        title: raw.title,
        author: raw.author,
        genre: raw.genre,
        annotations: [],
      });
    }

    const book = bookMap.get(assetId)!;
    const type = determineAnnotationType(raw);
    const { color } = mapAnnotationStyle(raw.style);

    book.annotations.push({
      id: raw.id,
      type,
      color,
      text: raw.text,
      note: raw.note,
      location: raw.location,
      chapter: null,
      createdAt: convertAppleDate(raw.createdAt),
      modifiedAt: convertAppleDate(raw.modifiedAt),
    });
  }

  return Array.from(bookMap.values());
}

/**
 * Filter annotations based on export options
 */
export function filterAnnotations(
  annotations: Annotation[],
  options: {
    includeHighlights: boolean;
    includeBookmarks: boolean;
    includeNotes: boolean;
    colorFilters?: string[];
  }
): Annotation[] {
  return annotations.filter(ann => {
    // Filter by type
    if (ann.type === 'highlight' && !options.includeHighlights) return false;
    if (ann.type === 'bookmark' && !options.includeBookmarks) return false;
    if (ann.type === 'note' && !options.includeNotes) return false;

    // Filter by color
    if (options.colorFilters && options.colorFilters.length > 0) {
      if (!options.colorFilters.includes(ann.color)) return false;
    }

    return true;
  });
}
