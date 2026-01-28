/**
 * Database adapter for dual runtime support (Bun + Node.js)
 *
 * Provides a unified SQLite interface that works with:
 * - Bun's built-in bun:sqlite (zero dependencies)
 * - Node.js's better-sqlite3 (auto-installed)
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryResult = any[];

interface DatabaseInterface {
  query(sql: string): { all(): QueryResult };
  run(sql: string): void;
  close(): void;
}

/**
 * Detect runtime environment
 */
function isBunRuntime(): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return typeof (globalThis as any).Bun !== 'undefined';
}

/**
 * Unified Database class that works in both Bun and Node.js
 *
 * This uses a factory pattern since constructors can't be async.
 */
export class Database implements DatabaseInterface {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private db: any;
  private isBun: boolean;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private constructor(db: any, isBun: boolean) {
    this.db = db;
    this.isBun = isBun;
  }

  /**
   * Create a new Database instance (async factory)
   */
  static async create(path: string, options?: { readonly?: boolean }): Promise<Database> {
    const isBun = isBunRuntime();

    if (isBun) {
      // Bun runtime - use built-in bun:sqlite
      // Dynamic import works in both runtimes
      const { Database: BunDB } = await import('bun:sqlite');
      const db = new BunDB(path, options);
      return new Database(db, isBun);
    } else {
      // Node.js runtime - use better-sqlite3
      // Dynamic import works in ESM
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const BetterSqlite3Module: any = await import('better-sqlite3');
      const BetterSqlite3 = BetterSqlite3Module.default || BetterSqlite3Module;
      const db = new BetterSqlite3(path, options);
      return new Database(db, isBun);
    }
  }

  query(sql: string): { all(): QueryResult } {
    if (this.isBun) {
      // Bun: db.query(sql).all()
      return this.db.query(sql);
    } else {
      // Node.js: db.prepare(sql).all()
      return {
        all: (): QueryResult => this.db.prepare(sql).all(),
      };
    }
  }

  run(sql: string): void {
    if (this.isBun) {
      // Bun: db.run(sql)
      this.db.run(sql);
    } else {
      // Node.js: db.prepare(sql).run()
      this.db.prepare(sql).run();
    }
  }

  close(): void {
    this.db.close();
  }
}
