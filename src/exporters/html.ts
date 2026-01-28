import type { Book, Annotation } from '../types.js';

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getColorClass(color: string): string {
  const colorMap: Record<string, string> = {
    yellow: 'yellow',
    green: 'green',
    blue: 'blue',
    pink: 'pink',
    purple: 'purple',
    underline: 'underline',
  };
  return colorMap[color] || 'yellow';
}

function generateBookId(book: Book): string {
  return `book-${book.assetId}`;
}

function renderAnnotation(annotation: Annotation): string {
  const colorClass = getColorClass(annotation.color);

  let html = `          <div class="highlight">\n`;
  html += `            <span class="color-dot ${colorClass}"></span>\n`;
  html += `            <div class="highlight-content">\n`;

  if (annotation.text) {
    html += `              <p class="highlight-text">${escapeHtml(annotation.text)}</p>\n`;
  }

  if (annotation.note) {
    html += `              <p class="note">${escapeHtml(annotation.note)}</p>\n`;
  }

  html += `              <div class="highlight-meta">\n`;

  if (annotation.location) {
    html += `                <span class="location">${escapeHtml(annotation.location)}</span>\n`;
  }

  html += `                <time>${formatDate(annotation.createdAt)}</time>\n`;
  html += `              </div>\n`;
  html += `            </div>\n`;
  html += `          </div>\n`;

  return html;
}

function renderBook(book: Book): string {
  const bookId = generateBookId(book);
  const title = book.title || 'Unknown Title';
  const author = book.author || 'Unknown Author';

  let html = `      <section id="${bookId}" class="book">\n`;
  html += `        <div class="book-header">\n`;
  html += `          <div class="book-info">\n`;
  html += `            <h2>${escapeHtml(title)}</h2>\n`;
  html += `            <p class="author">by ${escapeHtml(author)}</p>\n`;
  html += `          </div>\n`;
  html += `          <button class="collapse-btn" aria-label="Toggle highlights">\n`;
  html += `            <svg class="chevron" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n`;
  html += `              <polyline points="6 9 12 15 18 9"></polyline>\n`;
  html += `            </svg>\n`;
  html += `          </button>\n`;
  html += `        </div>\n`;
  html += `        <div class="highlights">\n`;

  for (const annotation of book.annotations) {
    html += renderAnnotation(annotation);
  }

  html += `        </div>\n`;
  html += `      </section>\n\n`;

  return html;
}

function renderBookIndex(books: Book[]): string {
  let html = `    <aside class="sidebar">\n`;
  html += `      <h3>Library</h3>\n`;
  html += `      <ul class="book-list">\n`;

  for (const book of books) {
    const bookId = generateBookId(book);
    const title = book.title || 'Unknown Title';
    const count = book.annotations.length;

    html += `        <li>\n`;
    html += `          <a href="#${bookId}" class="book-link">\n`;
    html += `            <span class="book-title">${escapeHtml(title)}</span>\n`;
    html += `            <span class="book-count">${count}</span>\n`;
    html += `          </a>\n`;
    html += `        </li>\n`;
  }

  html += `      </ul>\n`;
  html += `    </aside>\n\n`;

  return html;
}

export function exportToHtml(books: Book[], outputPath: string): string {
  const totalHighlights = books.reduce((sum, book) => sum + book.annotations.length, 0);
  const totalBooks = books.length;
  const exportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Apple Books Highlights</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    :root {
      --bg-page: #faf8f5;
      --bg-card: #ffffff;
      --bg-sidebar: #f5f3f0;
      --bg-hover: #f0ede8;
      --text-primary: #2c2c2c;
      --text-secondary: #6b6b6b;
      --text-tertiary: #999999;
      --accent-primary: #d4a574;
      --border-color: #e8e5e0;
      --dot-yellow: #ffc107;
      --dot-green: #4caf50;
      --dot-blue: #2196f3;
      --dot-pink: #e91e63;
      --dot-purple: #9c27b0;
      --dot-underline: #757575;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      font-size: 1.0625rem;
      line-height: 1.7;
      color: var(--text-primary);
      background: var(--bg-page);
      margin: 0;
      padding: 0;
    }

    /* Header */
    .header {
      position: sticky;
      top: 0;
      background: var(--bg-card);
      border-bottom: 1px solid var(--border-color);
      padding: 1.5rem 2rem;
      z-index: 100;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .header h1 {
      font-family: 'Crimson Text', Georgia, serif;
      font-size: 2.5rem;
      font-weight: 600;
      color: var(--text-primary);
      letter-spacing: -0.02em;
    }

    .header-actions {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    .expand-all-btn {
      padding: 0.5rem 1rem;
      font-size: 0.9375rem;
      font-family: inherit;
      background: transparent;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .expand-all-btn:hover {
      background: var(--bg-hover);
      border-color: var(--accent-primary);
      color: var(--text-primary);
    }

    .sidebar-toggle {
      display: none;
      padding: 0.5rem;
      font-size: 1.5rem;
      background: transparent;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .sidebar-toggle:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    .search-container {
      margin-bottom: 1rem;
    }

    .search-box {
      width: 100%;
      padding: 0.75rem 1rem;
      font-size: 1rem;
      font-family: inherit;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      background: var(--bg-page);
      color: var(--text-primary);
      transition: all 0.2s ease;
    }

    .search-box:focus {
      outline: none;
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1);
    }

    .stats {
      color: var(--text-tertiary);
      font-size: 0.9375rem;
    }

    /* Layout */
    .container {
      display: flex;
      min-height: calc(100vh - 180px);
    }

    /* Sidebar */
    .sidebar {
      width: 280px;
      background: var(--bg-sidebar);
      border-right: 1px solid var(--border-color);
      padding: 2rem 1.5rem;
      overflow-y: auto;
      position: sticky;
      top: 180px;
      height: calc(100vh - 180px);
      flex-shrink: 0;
      transition: transform 0.3s ease;
    }

    .sidebar.hidden {
      transform: translateX(-100%);
      position: absolute;
    }

    .sidebar h3 {
      font-family: 'Crimson Text', Georgia, serif;
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: var(--text-primary);
    }

    .book-list {
      list-style: none;
    }

    .book-list li {
      margin-bottom: 0.5rem;
    }

    .book-link {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 0.5rem 0.75rem;
      text-decoration: none;
      color: var(--text-secondary);
      border-radius: 6px;
      transition: all 0.2s ease;
      font-size: 0.9375rem;
    }

    .book-link:hover {
      background: var(--bg-hover);
      color: var(--accent-primary);
    }

    .book-link.active {
      background: var(--bg-card);
      color: var(--text-primary);
      border-left: 3px solid var(--accent-primary);
    }

    .book-title {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-right: 0.5rem;
    }

    .book-count {
      font-size: 0.875rem;
      color: var(--text-tertiary);
    }

    /* Main content */
    main {
      flex: 1;
      padding: 3rem 2rem;
      max-width: 900px;
      margin: 0 auto;
    }

    /* Book cards */
    .book {
      background: var(--bg-card);
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      scroll-margin-top: 200px;
    }

    .book:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .book-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
      cursor: pointer;
      user-select: none;
    }

    .book-info {
      flex: 1;
    }

    .book h2 {
      font-family: 'Crimson Text', Georgia, serif;
      font-size: 1.75rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
      line-height: 1.3;
    }

    .author {
      color: var(--text-secondary);
      font-size: 1rem;
    }

    .collapse-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      color: var(--text-secondary);
      transition: all 0.2s ease;
      border-radius: 6px;
    }

    .collapse-btn:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    .chevron {
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .book.collapsed .chevron {
      transform: rotate(-90deg);
    }

    .highlights {
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .book.collapsed .highlights {
      max-height: 0 !important;
      margin-bottom: 0;
    }

    /* Highlight items */
    .highlight {
      display: flex;
      gap: 12px;
      margin-bottom: 1.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-color);
    }

    .highlight:last-child {
      border-bottom: none;
      padding-bottom: 0;
      margin-bottom: 0;
    }

    .color-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 6px;
    }

    .color-dot.yellow {
      background: var(--dot-yellow);
      box-shadow: 0 0 8px rgba(255, 193, 7, 0.3);
    }

    .color-dot.green {
      background: var(--dot-green);
      box-shadow: 0 0 8px rgba(76, 175, 80, 0.3);
    }

    .color-dot.blue {
      background: var(--dot-blue);
      box-shadow: 0 0 8px rgba(33, 150, 243, 0.3);
    }

    .color-dot.pink {
      background: var(--dot-pink);
      box-shadow: 0 0 8px rgba(233, 30, 99, 0.3);
    }

    .color-dot.purple {
      background: var(--dot-purple);
      box-shadow: 0 0 8px rgba(156, 39, 176, 0.3);
    }

    .color-dot.underline {
      background: var(--dot-underline);
      box-shadow: 0 0 8px rgba(117, 117, 117, 0.3);
    }

    .highlight-content {
      flex: 1;
    }

    .highlight-text {
      font-size: 1.0625rem;
      line-height: 1.7;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .note {
      font-style: italic;
      color: var(--text-secondary);
      margin-top: 0.75rem;
      font-size: 1rem;
    }

    .highlight-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.75rem;
      gap: 1rem;
    }

    .location {
      font-size: 0.875rem;
      color: var(--text-tertiary);
    }

    time {
      font-size: 0.875rem;
      color: var(--text-tertiary);
      text-align: right;
    }

    .hidden {
      display: none;
    }

    /* Responsive design */
    @media (max-width: 1023px) {
      .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        z-index: 200;
        box-shadow: 2px 0 12px rgba(0, 0, 0, 0.1);
        transform: translateX(-100%);
      }

      .sidebar.visible {
        transform: translateX(0);
      }

      .sidebar-toggle {
        display: block;
      }

      main {
        padding: 2rem 1.5rem;
      }

      .book {
        padding: 1.5rem;
      }
    }

    @media (max-width: 767px) {
      .header {
        padding: 1rem 1.25rem;
      }

      .header h1 {
        font-size: 1.75rem;
      }

      .expand-all-btn {
        display: none;
      }

      main {
        padding: 1.5rem 1rem;
      }

      .book {
        padding: 1.25rem;
      }

      .book h2 {
        font-size: 1.5rem;
      }

      .sidebar {
        width: 260px;
      }
    }

    /* Print styles */
    @media print {
      body {
        background: white;
      }

      .header {
        position: static;
        box-shadow: none;
      }

      .search-container,
      .expand-all-btn,
      .sidebar-toggle,
      .collapse-btn {
        display: none !important;
      }

      .sidebar {
        position: static;
        width: 100%;
        height: auto;
        page-break-after: always;
      }

      .book {
        box-shadow: none;
        page-break-inside: avoid;
      }

      .book.collapsed .highlights {
        max-height: none !important;
      }

      main {
        padding: 1rem 0;
      }
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="header-content">
      <h1>Apple Books Highlights</h1>
      <div class="header-actions">
        <button class="expand-all-btn">Collapse All</button>
        <button class="sidebar-toggle">☰</button>
      </div>
    </div>
    <div class="search-container">
      <input type="search" class="search-box" placeholder="Search books or highlights..." aria-label="Search" />
    </div>
    <div class="stats">${totalHighlights} highlights from ${totalBooks} books • Exported ${exportDate}</div>
  </header>

  <div class="container">
${renderBookIndex(books)}
    <main>
`;

  for (const book of books) {
    html += renderBook(book);
  }

  html += `    </main>
  </div>

  <script>
    // Initialize highlights heights for smooth transitions
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('.highlights').forEach(highlights => {
        highlights.style.maxHeight = highlights.scrollHeight + 'px';
      });
    });

    // Search functionality with debouncing
    const searchInput = document.querySelector('.search-box');
    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const query = e.target.value.toLowerCase().trim();
        const books = document.querySelectorAll('.book');

        if (query === '') {
          books.forEach(book => {
            book.classList.remove('hidden');
            book.style.opacity = '1';
          });
        } else {
          books.forEach(book => {
            const text = book.textContent.toLowerCase();
            if (text.includes(query)) {
              book.classList.remove('hidden');
              book.style.opacity = '1';
            } else {
              book.style.opacity = '0';
              setTimeout(() => book.classList.add('hidden'), 200);
            }
          });
        }
      }, 150);
    });

    // Expand/Collapse individual book
    document.querySelectorAll('.book-header').forEach(header => {
      header.addEventListener('click', (e) => {
        const book = header.closest('.book');
        book.classList.toggle('collapsed');

        // Save state to localStorage
        const bookId = book.id;
        const isCollapsed = book.classList.contains('collapsed');
        localStorage.setItem('book-' + bookId, isCollapsed ? 'collapsed' : 'expanded');
      });
    });

    // Expand/Collapse All button
    const expandAllBtn = document.querySelector('.expand-all-btn');
    let allCollapsed = false;

    expandAllBtn.addEventListener('click', () => {
      const books = document.querySelectorAll('.book');
      allCollapsed = !allCollapsed;

      books.forEach(book => {
        if (allCollapsed) {
          book.classList.add('collapsed');
          localStorage.setItem('book-' + book.id, 'collapsed');
        } else {
          book.classList.remove('collapsed');
          localStorage.setItem('book-' + book.id, 'expanded');
        }
      });

      expandAllBtn.textContent = allCollapsed ? 'Expand All' : 'Collapse All';
    });

    // Sidebar toggle
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');

    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('visible');
      const isVisible = sidebar.classList.contains('visible');
      localStorage.setItem('sidebar-visible', isVisible ? 'true' : 'false');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 1023) {
        if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
          sidebar.classList.remove('visible');
        }
      }
    });

    // Smooth scroll for anchor links with active state
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          // Remove active class from all links
          document.querySelectorAll('.book-link').forEach(link => {
            link.classList.remove('active');
          });

          // Add active class to clicked link
          this.classList.add('active');

          // Expand book if collapsed
          target.classList.remove('collapsed');
          localStorage.setItem('book-' + target.id, 'expanded');

          // Instant scroll
          target.scrollIntoView({
            behavior: 'instant',
            block: 'start'
          });

          // Close sidebar on mobile
          if (window.innerWidth <= 1023) {
            sidebar.classList.remove('visible');
          }
        }
      });
    });

    // Restore collapse states from localStorage
    document.querySelectorAll('.book').forEach(book => {
      const bookId = book.id;
      const savedState = localStorage.getItem('book-' + bookId);
      if (savedState === 'collapsed') {
        book.classList.add('collapsed');
      }
    });

    // Restore sidebar state from localStorage
    const sidebarState = localStorage.getItem('sidebar-visible');
    if (sidebarState === 'true' && window.innerWidth <= 1023) {
      sidebar.classList.add('visible');
    }

    // Update expand/collapse all button text based on current state
    function updateExpandAllButton() {
      const books = document.querySelectorAll('.book');
      const collapsedCount = document.querySelectorAll('.book.collapsed').length;
      allCollapsed = collapsedCount === books.length;
      expandAllBtn.textContent = allCollapsed ? 'Expand All' : 'Collapse All';
    }

    updateExpandAllButton();
  </script>
</body>
</html>
`;

  // Write to file
  const fs = require('fs');
  const path = require('path');

  const resolvedPath = path.resolve(outputPath);
  fs.writeFileSync(resolvedPath, html, 'utf-8');

  return resolvedPath;
}
