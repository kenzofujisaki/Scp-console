/**
 * Standalone migration runner — called via `npm run db:migrate`.
 * Also runs automatically on first `getDb()` call in production via the
 * drizzle migrate() call inside the singleton initializer.
 */
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "path";

const DB_PATH = process.env.DATABASE_PATH ?? "./scp-console.db";
const MIGRATIONS_PATH = path.join(__dirname, "migrations");

const sqlite = new Database(path.resolve(process.cwd(), DB_PATH));
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

const db = drizzle(sqlite);
migrate(db, { migrationsFolder: MIGRATIONS_PATH });

console.warn("Migrations applied successfully.");
sqlite.close();
