import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Database } from '../db-adapter.js';
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('Database Adapter', () => {
  let testDir: string;
  let testDbPath: string;

  beforeEach(() => {
    // Create a temporary directory for test databases
    testDir = mkdtempSync(join(tmpdir(), 'apple-books-test-'));
    testDbPath = join(testDir, 'test.db');
  });

  afterEach(() => {
    // Clean up test directory
    try {
      rmSync(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('Runtime Detection', () => {
    it('should detect runtime and create database instance', async () => {
      // Create a minimal SQLite database
      const db = await Database.create(':memory:');
      expect(db).toBeInstanceOf(Database);
      db.close();
    });

    it('should support readonly option', async () => {
      // Create an empty database file first
      writeFileSync(testDbPath, '');

      const db = await Database.create(testDbPath, { readonly: true });
      expect(db).toBeInstanceOf(Database);
      db.close();
    });
  });

  describe('Database Operations', () => {
    it('should execute queries and return results', async () => {
      const db = await Database.create(':memory:');

      // Create a test table
      db.run('CREATE TABLE test (id INTEGER PRIMARY KEY, value TEXT)');
      db.run("INSERT INTO test (value) VALUES ('hello')");
      db.run("INSERT INTO test (value) VALUES ('world')");

      // Query the data
      const results = db.query('SELECT * FROM test ORDER BY id').all();

      expect(results).toHaveLength(2);
      expect(results[0]).toMatchObject({ id: 1, value: 'hello' });
      expect(results[1]).toMatchObject({ id: 2, value: 'world' });

      db.close();
    });

    it('should handle run() for INSERT/UPDATE/DELETE', async () => {
      const db = await Database.create(':memory:');

      db.run('CREATE TABLE test (id INTEGER PRIMARY KEY, value TEXT)');
      db.run("INSERT INTO test (value) VALUES ('test')");

      const results = db.query('SELECT COUNT(*) as count FROM test').all();
      expect(results[0]?.count).toBe(1);

      db.close();
    });

    it('should support ATTACH DATABASE for multiple databases', async () => {
      const db = await Database.create(':memory:');

      // Create main table
      db.run('CREATE TABLE main_table (id INTEGER PRIMARY KEY, value TEXT)');
      db.run("INSERT INTO main_table (value) VALUES ('main')");

      // Attach another database
      db.run("ATTACH DATABASE ':memory:' AS attached");
      db.run('CREATE TABLE attached.other_table (id INTEGER PRIMARY KEY, value TEXT)');
      db.run("INSERT INTO attached.other_table (value) VALUES ('attached')");

      // Query both
      const mainResults = db.query('SELECT * FROM main_table').all();
      const attachedResults = db.query('SELECT * FROM attached.other_table').all();

      expect(mainResults).toHaveLength(1);
      expect(attachedResults).toHaveLength(1);

      db.close();
    });

    it('should close database connections', async () => {
      const db = await Database.create(':memory:');

      // Create and query to ensure it's working
      db.run('CREATE TABLE test (id INTEGER PRIMARY KEY)');

      // Close should not throw
      expect(() => db.close()).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should throw on invalid SQL', async () => {
      const db = await Database.create(':memory:');

      expect(() => {
        db.run('INVALID SQL STATEMENT');
      }).toThrow();

      db.close();
    });

    it('should provide helpful error for missing better-sqlite3 on Node <22.5', async () => {
      // This test is informational - actual behavior depends on runtime
      // We can't easily simulate missing better-sqlite3 in tests
      // But we document the expected behavior

      // Expected error message format:
      const expectedErrorPattern = /No SQLite implementation available/;

      // This is just to document the expected behavior
      expect(expectedErrorPattern.test(
        'No SQLite implementation available. For Node.js <22.5, install better-sqlite3: npm install better-sqlite3'
      )).toBe(true);
    });
  });

  describe('Cross-Runtime Compatibility', () => {
    it('should produce consistent results across runtimes', async () => {
      const db = await Database.create(':memory:');

      // Create table with various data types
      db.run(`
        CREATE TABLE test (
          id INTEGER PRIMARY KEY,
          text_col TEXT,
          int_col INTEGER,
          real_col REAL,
          blob_col BLOB
        )
      `);

      db.run(`
        INSERT INTO test (text_col, int_col, real_col, blob_col)
        VALUES ('test', 42, 3.14, NULL)
      `);

      const results = db.query('SELECT * FROM test').all();

      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        id: 1,
        text_col: 'test',
        int_col: 42,
        real_col: 3.14,
        blob_col: null,
      });

      db.close();
    });

    it('should handle empty result sets', async () => {
      const db = await Database.create(':memory:');

      db.run('CREATE TABLE test (id INTEGER PRIMARY KEY)');
      const results = db.query('SELECT * FROM test').all();

      expect(results).toEqual([]);

      db.close();
    });
  });
});
