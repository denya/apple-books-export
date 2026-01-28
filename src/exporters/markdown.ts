import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import type { Book, Annotation } from "../types";

const COLOR_EMOJI: Record<string, string> = {
  yellow: '🟡',
  green: '🟢',
  blue: '🔵',
  pink: '🔴',
  purple: '🟣',
  underline: '➖',
};

const TYPE_EMOJI: Record<string, string> = {
  highlight: '✨',
  bookmark: '📌',
  note: '📝',
};

/**
 * Sanitize filename by removing/replacing invalid characters
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 200); // Limit length
}

/**
 * Format a single annotation as markdown
 */
function formatAnnotation(annotation: Annotation, index: number): string {
  const colorEmoji = COLOR_EMOJI[annotation.color] || '⚪';
  const typeEmoji = TYPE_EMOJI[annotation.type] || '📄';

  let markdown = `\n## ${colorEmoji} ${typeEmoji} ${annotation.type.charAt(0).toUpperCase() + annotation.type.slice(1)}`;

  if (annotation.location) {
    markdown += ` - ${annotation.location}`;
  }

  markdown += `\n**Created:** ${annotation.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}\n`;

  if (annotation.text) {
    markdown += `\n> ${annotation.text.split('\n').join('\n> ')}\n`;
  }

  if (annotation.note) {
    markdown += `\n**Note:** *${annotation.note}*\n`;
  }

  markdown += '\n---\n';

  return markdown;
}

/**
 * Export a single book to markdown file
 */
export function exportBookToMarkdown(book: Book, outputDir: string): string {
  // Create output directory if it doesn't exist
  mkdirSync(outputDir, { recursive: true });

  // Generate filename
  const bookTitle = book.title || `Unknown Book (${book.assetId.substring(0, 8)})`;
  const filename = sanitizeFilename(`${bookTitle}.md`);
  const filepath = join(outputDir, filename);

  // Count annotation types
  const highlights = book.annotations.filter(a => a.type === 'highlight').length;
  const bookmarks = book.annotations.filter(a => a.type === 'bookmark').length;
  const notes = book.annotations.filter(a => a.type === 'note').length;

  // Build YAML frontmatter
  let content = '---\n';
  content += `title: "${book.title || 'Unknown'}"\n`;
  content += `author: "${book.author || 'Unknown'}"\n`;
  if (book.genre) {
    content += `genre: "${book.genre}"\n`;
  }
  content += `assetId: "${book.assetId}"\n`;
  content += `exported: "${new Date().toISOString()}"\n`;
  content += `totalAnnotations: ${book.annotations.length}\n`;
  content += `highlights: ${highlights}\n`;
  content += `bookmarks: ${bookmarks}\n`;
  content += `notes: ${notes}\n`;
  content += '---\n\n';

  // Book header
  content += `# ${book.title || 'Unknown Book'}\n`;
  if (book.author) {
    content += `**by ${book.author}**\n`;
  }
  content += `\n*${book.annotations.length} annotations*\n`;

  // Add annotations
  book.annotations.forEach((annotation, index) => {
    content += formatAnnotation(annotation, index);
  });

  // Write file
  writeFileSync(filepath, content, 'utf-8');

  return filepath;
}

/**
 * Export all books to markdown files
 */
export function exportToMarkdown(books: Book[], outputPath: string): string[] {
  const filepaths: string[] = [];

  for (const book of books) {
    if (book.annotations.length === 0) continue;

    const filepath = exportBookToMarkdown(book, outputPath);
    filepaths.push(filepath);
  }

  return filepaths;
}

/**
 * Export all books to a single markdown file
 */
export function exportToSingleMarkdown(books: Book[], outputPath: string): string {
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

  let content = '---\n';
  content += `title: "Apple Books Export"\n`;
  content += `exported: "${new Date().toISOString()}"\n`;
  content += `totalBooks: ${books.length}\n`;
  content += `totalAnnotations: ${totalAnnotations}\n`;
  content += `highlights: ${totalHighlights}\n`;
  content += `bookmarks: ${totalBookmarks}\n`;
  content += `notes: ${totalNotes}\n`;
  content += '---\n\n';

  content += `# Apple Books Export\n\n`;
  content += `Exported ${totalAnnotations} annotations from ${books.length} books\n\n`;
  content += '---\n\n';

  // Add each book
  for (const book of books) {
    if (book.annotations.length === 0) continue;

    content += `# ${book.title || 'Unknown Book'}\n`;
    if (book.author) {
      content += `**by ${book.author}**\n`;
    }
    content += `\n*${book.annotations.length} annotations*\n`;

    book.annotations.forEach((annotation, index) => {
      content += formatAnnotation(annotation, index);
    });

    content += '\n\n';
  }

  writeFileSync(outputPath, content, 'utf-8');
  return outputPath;
}
