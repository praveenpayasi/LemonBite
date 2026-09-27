import * as SQLite from 'expo-sqlite';

import {
  getFilteredMenuItems,
  getMenuItems,
  initDatabase,
  saveMenuItems,
} from '@/services/database/menuDatabase';
import type { MenuItem } from '@/types';

interface StoredRow {
  id: string;
  title: string;
  price: number;
  description: string;
  image: string;
  category: string;
}

jest.mock('expo-sqlite', () => {
  const rows = new Map<string, StoredRow>();
  const db = {
    execAsync: jest.fn(async () => {}),
    withTransactionAsync: jest.fn(async (callback: () => Promise<void>) => {
      await callback();
    }),
    runAsync: jest.fn(async (_sql: string, params: unknown[]) => {
      const [id, title, price, description, image, category] = params;
      rows.set(id as string, {
        id: id as string,
        title: title as string,
        price: price as number,
        description: description as string,
        image: image as string,
        category: category as string,
      });
    }),
    // Minimal SQL executor: understands the WHERE clauses our queries build so
    // parameterized filtering can be asserted from the bound params.
    getAllAsync: jest.fn(async (sql: string, params: unknown[] = []) => {
      let result = Array.from(rows.values());
      const bound = [...params];

      if (/title LIKE \?/i.test(sql)) {
        const pattern = String(bound.shift() ?? '');
        const needle = pattern.replace(/%/g, '').toLowerCase();
        result = result.filter((row) => row.title.toLowerCase().includes(needle));
      }

      const inMatch = sql.match(/category IN \(([^)]*)\)/i);
      if (inMatch) {
        const placeholderCount = ((inMatch[1] ?? '').match(/\?/g) ?? []).length;
        const categories = bound.splice(0, placeholderCount).map(String);
        result = result.filter((row) => categories.includes(row.category));
      }

      return result;
    }),
  };
  return {
    openDatabaseAsync: jest.fn(async () => db),
    __db: db,
    __rows: rows,
  };
});

const sqliteMock = SQLite as unknown as {
  __db: {
    execAsync: jest.Mock;
    withTransactionAsync: jest.Mock;
    runAsync: jest.Mock;
    getAllAsync: jest.Mock;
  };
  __rows: Map<string, unknown>;
};

const IMAGES =
  'https://raw.githubusercontent.com/Meta-Mobile-Developer-PC/Working-With-Data-API/main/images';

const greekSalad: MenuItem = {
  id: 'greek-salad',
  title: 'Greek Salad',
  price: 12.99,
  description: 'Feta and cucumber',
  image: `${IMAGES}/greekSalad.jpg`,
  category: 'Starters',
};

const grilledFish: MenuItem = {
  id: 'grilled-fish',
  title: 'Grilled Fish',
  price: 19.99,
  description: 'Fresh catch of the day',
  image: `${IMAGES}/grilledFish.jpg`,
  category: 'Mains',
};

const lemonDessert: MenuItem = {
  id: 'lemon-dessert',
  title: 'Lemon Dessert',
  price: 6.99,
  description: 'Tangy and sweet',
  image: `${IMAGES}/lemonDessert.jpg`,
  category: 'Desserts',
};


describe('menuDatabase', () => {
  beforeEach(() => {
    sqliteMock.__rows.clear();
    jest.clearAllMocks();
  });

  it('creates the menuitems table on initialization', async () => {
    await initDatabase();

    expect(sqliteMock.__db.execAsync).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE IF NOT EXISTS menuitems'),
    );
  });

  it('saves menu items and retrieves them', async () => {
    await saveMenuItems([greekSalad]);
    const items = await getMenuItems();

    expect(items).toEqual([greekSalad]);
  });

  it('saves with parameterized statements', async () => {
    await saveMenuItems([greekSalad]);

    expect(sqliteMock.__db.runAsync).toHaveBeenCalledWith(expect.stringContaining('INSERT OR REPLACE'), [
      'greek-salad',
      'Greek Salad',
      12.99,
      'Feta and cucumber',
      `${IMAGES}/greekSalad.jpg`,
      'Starters',
    ]);
  });

  it('normalizes a legacy image filename to a full URL when reading', async () => {
    await saveMenuItems([{ ...greekSalad, image: 'greekSalad.jpg' }]);

    const items = await getMenuItems();

    expect(items[0]?.image).toBe(`${IMAGES}/greekSalad.jpg`);
  });

  it('returns an empty array when the table is empty', async () => {
    const items = await getMenuItems();

    expect(items).toEqual([]);
  });
});

describe('getFilteredMenuItems', () => {
  beforeEach(async () => {
    sqliteMock.__rows.clear();
    jest.clearAllMocks();
    await saveMenuItems([greekSalad, grilledFish, lemonDessert]);
  });

  it('returns all items when there is no search and no categories', async () => {
    const items = await getFilteredMenuItems('', []);

    expect(items).toEqual([greekSalad, grilledFish, lemonDessert]);
    // No WHERE clause when nothing is filtered.
    const [sql] = sqliteMock.__db.getAllAsync.mock.calls.at(-1) ?? [];
    expect(sql).not.toContain('WHERE');
  });

  it('matches dish names case-insensitively by substring', async () => {
    const items = await getFilteredMenuItems('gr', []);

    expect(items.map((item) => item.title)).toEqual(['Greek Salad', 'Grilled Fish']);
  });

  it('trims the search term before querying', async () => {
    const items = await getFilteredMenuItems('  lemon  ', []);

    expect(items.map((item) => item.title)).toEqual(['Lemon Dessert']);
  });

  it('filters by a single category', async () => {
    const items = await getFilteredMenuItems('', ['Mains']);

    expect(items.map((item) => item.title)).toEqual(['Grilled Fish']);
  });

  it('filters by multiple categories (OR / union)', async () => {
    const items = await getFilteredMenuItems('', ['Starters', 'Desserts']);

    expect(items.map((item) => item.title)).toEqual(['Greek Salad', 'Lemon Dessert']);
  });

  it('combines search and categories with AND (intersection)', async () => {
    const items = await getFilteredMenuItems('gr', ['Mains']);

    expect(items.map((item) => item.title)).toEqual(['Grilled Fish']);
  });

  it('returns an empty array when search and category do not intersect', async () => {
    const items = await getFilteredMenuItems('greek', ['Mains']);

    expect(items).toEqual([]);
  });

  it('binds all user input as SQL parameters', async () => {
    await getFilteredMenuItems('gr', ['Starters', 'Mains']);

    const [sql, params] = sqliteMock.__db.getAllAsync.mock.calls.at(-1) ?? [];
    expect(sql).toContain('title LIKE ?');
    expect(sql).toContain('category IN (?, ?)');
    expect(params).toEqual(['%gr%', 'Starters', 'Mains']);
  });

  it('normalizes legacy image filenames on filtered rows', async () => {
    sqliteMock.__rows.clear();
    await saveMenuItems([{ ...greekSalad, image: 'greekSalad.jpg' }]);

    const items = await getFilteredMenuItems('greek', []);

    expect(items[0]?.image).toBe(`${IMAGES}/greekSalad.jpg`);
  });
});
