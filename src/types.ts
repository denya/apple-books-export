export type AnnotationType = 'highlight' | 'bookmark' | 'note';
export type AnnotationColor = 'yellow' | 'green' | 'blue' | 'pink' | 'purple' | 'underline';

export interface Annotation {
  id: number;
  type: AnnotationType;
  color: AnnotationColor;
  text: string | null;
  note: string | null;
  location: string | null;
  chapter: string | null;
  createdAt: Date;
  modifiedAt: Date;
}

export interface Book {
  assetId: string;
  title: string | null;
  author: string | null;
  genre: string | null;
  annotations: Annotation[];
}

export type ExportFormat = 'html' | 'markdown' | 'json' | 'csv';

export interface ExportOptions {
  format: ExportFormat;
  outputPath: string;
  groupByBook: boolean;
  includeBookmarks: boolean;
  includeNotes: boolean;
  includeHighlights: boolean;
  colorFilters?: AnnotationColor[];
  singleFile?: boolean;
  annotationsDbPath?: string;
  libraryDbPath?: string;
}

export interface RawAnnotation {
  id: number;
  assetId: string;
  text: string | null;
  note: string | null;
  style: number;
  location: string | null;
  createdAt: number;
  modifiedAt: number;
  deleted: number;
  title: string | null;
  author: string | null;
  genre: string | null;
}

export interface ExportStats {
  totalBooks: number;
  totalAnnotations: number;
  highlights: number;
  bookmarks: number;
  notes: number;
  orphaned: number;
}
