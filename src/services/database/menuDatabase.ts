import * as SQLite from 'expo-sqlite';

import { getMenuImageUrl } from '@/constants/api';
import type { MenuItem } from '@/types';

const DATABASE_NAME = 'little_lemon.db';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

/** Opens the database once and reuses the connection. */
function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME);
  }
  return databasePromise;
}

/**
 * Opens the database and creates the `menuitems` table if it does not exist.
 * Idempotent: safe to call on every launch and never drops existing data.
 */
export async function initDatabase(): Promise<void> {
  const db = await openDatabase();
  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS menuitems (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT NOT NULL,
      image TEXT NOT NULL,
      category TEXT NOT NULL
    );`,
  );
}

/**
 * Persists menu items using a single transaction and parameterized statements.
 * `INSERT OR REPLACE` keeps saving idempotent on the item id.
 */
export async function saveMenuItems(items: MenuItem[]): Promise<void> {
  if (items.length === 0) {
    return;
  }

  const db = await openDatabase();
  await db.withTransactionAsync(async () => {
    for (const item of items) {
      await db.runAsync(
        `INSERT OR REPLACE INTO menuitems (id, title, price, description, image, category)
         VALUES (?, ?, ?, ?, ?, ?);`,
        [item.id, item.title, item.price, item.description, item.image, item.category],
      );
    }
  });
}

/** Returns all stored menu items (an empty array when the table is empty). */
export async function getMenuItems(): Promise<MenuItem[]> {
  const db = await openDatabase();
  const rows = await db.getAllAsync<MenuItem>(
    'SELECT id, title, price, description, image, category FROM menuitems;',
  );
  // Normalize legacy rows that stored only an image filename (Phase 7/8 data).
  return rows.map((row) => ({ ...row, image: getMenuImageUrl(row.image) }));
}

/**
 * Filters stored menu items by a case-insensitive title substring (SQLite `LIKE`)
 * and/or a set of categories (OR via `IN`). Both filters combine with AND.
 * All user input is bound as SQL parameters. An empty search / empty category
 * list means "no restriction" for that filter.
 */
export async function getFilteredMenuItems(
  search: string,
  categories: string[],
): Promise<MenuItem[]> {
  const db = await openDatabase();

  const clauses: string[] = [];
  const params: string[] = [];

  const trimmed = search.trim();
  if (trimmed !== '') {
    clauses.push('title LIKE ?');
    params.push(`%${trimmed}%`);
  }
  if (categories.length > 0) {
    const placeholders = categories.map(() => '?').join(', ');
    clauses.push(`category IN (${placeholders})`);
    params.push(...categories);
  }

  const where = clauses.length > 0 ? ` WHERE ${clauses.join(' AND ')}` : '';
  const rows = await db.getAllAsync<MenuItem>(
    `SELECT id, title, price, description, image, category FROM menuitems${where};`,
    params,
  );
  return rows.map((row) => ({ ...row, image: getMenuImageUrl(row.image) }));
}
