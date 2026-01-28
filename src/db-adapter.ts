/**
 * Database adapter for multi-runtime support (Bun + Node.js)
 *
 * Provides a unified SQLite interface that works with:
 * - Bun's built-in bun:sqlite (zero dependencies)
 * - Node.js 22.5+ built-in node:sqlite (zero dependencies)
 * - Node.js <22.5 better-sqlite3 (fallback with native compilation)
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryResult = any[];

interface DatabaseInterface {
  query(sql: string): { all(): QueryResult };
  run(sql: string): void;
  close(): void;
}

/**
 * Runtime types supported by this adapter
 */
enum RuntimeType {
  BUN = 'bun',
  NODE_MODERN = 'node-modern',  // Node.js 22.5+
  NODE_LEGACY = 'node-legacy'    // Node.js <22.5
}

/**
 * Detect runtime environment with version awareness
 */
function detectRuntime(): RuntimeType {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof (globalThis as any).Bun !== 'undefined') {
    return RuntimeType.BUN;
  }

  // Check Node.js version for built-in sqlite support
  const [major, minor] = process.versions.node.split('.').map(Number);
  if (major && (major > 22 || (major === 22 && minor && minor >= 5))) {
    return RuntimeType.NODE_MODERN;
  }

  return RuntimeType.NODE_LEGACY;
}

/**
 * Try to load Node.js built-in sqlite module
 * Returns null if not available (Node <22.5 or load failure)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function tryNodeSqlite(): Promise<any> {
  try {
    const { DatabaseSync } = await import('node:sqlite');
    return DatabaseSync;
  } catch {
    return null;
  }
}

/**
 * Unified Database class that works across Bun and Node.js runtimes
 *
 * This uses a factory pattern since constructors can't be async.
 */
export class Database implements DatabaseInterface {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private db: any;
  private runtime: RuntimeType;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private constructor(db: any, runtime: RuntimeType) {
    this.db = db;
    this.runtime = runtime;
  }

  /**
   * Create a new Database instance (async factory)
   */
  static async create(path: string, options?: { readonly?: boolean }): Promise<Database> {
    const runtime = detectRuntime();

    if (runtime === RuntimeType.BUN) {
      // Bun runtime - use built-in bun:sqlite
      const { Database: BunDB } = await import('bun:sqlite');
      const db = new BunDB(path, options);
      return new Database(db, runtime);
    }

    // Node.js runtime - try node:sqlite first, fall back to better-sqlite3
    if (runtime === RuntimeType.NODE_MODERN) {
      const NodeSqlite = await tryNodeSqlite();
      if (NodeSqlite) {
        // Node.js 22.5+ with built-in sqlite
        // Note: node:sqlite uses 'readOnly' (camelCase) instead of 'readonly'
        const nodeOptions = options?.readonly ? { readOnly: true } : {};
        const db = new NodeSqlite(path, nodeOptions);
        return new Database(db, runtime);
      }
    }

    // Fallback to better-sqlite3 for Node.js <22.5 or if node:sqlite fails
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const BetterSqlite3Module: any = await import('better-sqlite3');
      const BetterSqlite3 = BetterSqlite3Module.default || BetterSqlite3Module;
      const db = new BetterSqlite3(path, options);
      return new Database(db, RuntimeType.NODE_LEGACY);
    } catch {
      throw new Error(
        'No SQLite implementation available. For Node.js <22.5, install better-sqlite3: npm install better-sqlite3'
      );
    }
  }

  query(sql: string): { all(): QueryResult } {
    if (this.runtime === RuntimeType.BUN) {
      // Bun: db.query(sql).all()
      return this.db.query(sql);
    } else {
      // Node.js (both modern and legacy): db.prepare(sql).all()
      return {
        all: (): QueryResult => this.db.prepare(sql).all(),
      };
    }
  }

  run(sql: string): void {
    if (this.runtime === RuntimeType.BUN) {
      // Bun: db.run(sql)
      this.db.run(sql);
    } else {
      // Node.js (both modern and legacy): db.prepare(sql).run()
      this.db.prepare(sql).run();
    }
  }

  close(): void {
    this.db.close();
  }
}
