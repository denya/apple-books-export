/**
 * Database adapter for dual runtime support (Bun + Node.js)
 *
 * Provides a unified SQLite interface that works with:
 * - Bun's built-in bun:sqlite (zero dependencies)
 * - Node.js's better-sqlite3 (auto-installed)
 */

type QueryResult = any[];

interface DatabaseInterface {
  query(sql: string): { all(): QueryResult };
  run(sql: string): void;
  close(): void;
}

class BunDatabaseAdapter implements DatabaseInterface {
  private db: any;

  constructor(path: string, options?: { readonly?: boolean }) {
    // Dynamic import of bun:sqlite
    const { Database: BunDatabase } = require("bun:sqlite");
    this.db = new BunDatabase(path, options);
  }

  query(sql: string) {
    return this.db.query(sql);
  }

  run(sql: string): void {
    this.db.run(sql);
  }

  close(): void {
    this.db.close();
  }
}

class NodeDatabaseAdapter implements DatabaseInterface {
  private db: any;

  constructor(path: string, options?: { readonly?: boolean }) {
    // Dynamic import of better-sqlite3
    const BetterSqlite3 = require("better-sqlite3");
    this.db = new BetterSqlite3(path, options);
  }

  query(sql: string) {
    // better-sqlite3 uses prepare().all() instead of query().all()
    return {
      all: () => this.db.prepare(sql).all()
    };
  }

  run(sql: string): void {
    // better-sqlite3 uses prepare().run() instead of run()
    this.db.prepare(sql).run();
  }

  close(): void {
    this.db.close();
  }
}

/**
 * Detect runtime environment
 */
function isBunRuntime(): boolean {
  return typeof (globalThis as any).Bun !== "undefined";
}

/**
 * Unified Database class that works in both Bun and Node.js
 */
export class Database implements DatabaseInterface {
  private adapter: DatabaseInterface;

  constructor(path: string, options?: { readonly?: boolean }) {
    if (isBunRuntime()) {
      this.adapter = new BunDatabaseAdapter(path, options);
    } else {
      this.adapter = new NodeDatabaseAdapter(path, options);
    }
  }

  query(sql: string) {
    return this.adapter.query(sql);
  }

  run(sql: string): void {
    this.adapter.run(sql);
  }

  close(): void {
    this.adapter.close();
  }
}
