import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "path";
import * as schema from "./schema";

const DB_PATH = process.env.DATABASE_PATH ?? "./scp-console.db";
const MIGRATIONS_PATH = path.join(process.cwd(), "src/lib/db/migrations");

// Singleton — reused across API route invocations in the same Node.js process
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!_db) {
    const sqlite = new Database(path.resolve(process.cwd(), DB_PATH));
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");
    _db = drizzle(sqlite, { schema });
    // Auto-migrate on first connection — zero manual setup required
    migrate(_db, { migrationsFolder: MIGRATIONS_PATH });
  }
  return _db;
}

export type Db = ReturnType<typeof getDb>;
