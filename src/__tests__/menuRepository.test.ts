import { fetchMenuItems } from '@/services/api/menuApi';
import { getMenuItems, initDatabase, saveMenuItems } from '@/services/database/menuDatabase';
import { getMenu, peekMenuCache, prepareMenuForHome, resetMenuCache } from '@/repositories/menuRepository';
import { prefetchMenuImages } from '@/utils/imagePrefetch';
import type { MenuItem } from '@/types';

jest.mock('@/services/api/menuApi', () => ({
  fetchMenuItems: jest.fn(),
}));

jest.mock('@/services/database/menuDatabase', () => ({
  initDatabase: jest.fn(),
  getMenuItems: jest.fn(),
  saveMenuItems: jest.fn(),
}));

jest.mock('@/utils/imagePrefetch', () => ({
  prefetchMenuImages: jest.fn(),
}));

const mockInit = initDatabase as jest.Mock;
const mockGetLocal = getMenuItems as jest.Mock;
const mockSave = saveMenuItems as jest.Mock;
const mockFetch = fetchMenuItems as jest.Mock;
const mockPrefetch = prefetchMenuImages as jest.Mock;

const cached: MenuItem[] = [
  { id: 'greek-salad', title: 'Greek Salad', price: 12.99, description: 'a', image: 'g.jpg', category: 'Starters' },
];
const remote: MenuItem[] = [
  { id: 'grilled-fish', title: 'Grilled Fish', price: 20, description: 'b', image: 'f.jpg', category: 'Mains' },
];

describe('menuRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetMenuCache();
    mockInit.mockResolvedValue(undefined);
    mockSave.mockResolvedValue(undefined);
    mockPrefetch.mockResolvedValue(undefined);
  });

  it('initializes the database before reading', async () => {
    mockGetLocal.mockResolvedValue(cached);

    await getMenu();

    expect(mockInit).toHaveBeenCalledTimes(1);
  });

  it('returns local items and does not call the API when SQLite has data', async () => {
    mockGetLocal.mockResolvedValue(cached);

    const result = await getMenu();

    expect(result).toEqual(cached);
    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('fetches, persists and returns remote items when SQLite is empty', async () => {
    mockGetLocal.mockResolvedValue([]);
    mockFetch.mockResolvedValue(remote);

    const result = await getMenu();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockSave).toHaveBeenCalledWith(remote);
    expect(result).toEqual(remote);
  });

  it('serves the in-memory cache on later calls without re-reading SQLite', async () => {
    mockGetLocal.mockResolvedValue(cached);
    await getMenu();

    mockInit.mockClear();
    mockGetLocal.mockClear();
    const second = await getMenu();

    expect(second).toEqual(cached);
    expect(mockInit).not.toHaveBeenCalled();
    expect(mockGetLocal).not.toHaveBeenCalled();
  });

  it('exposes the loaded cache via peekMenuCache', async () => {
    expect(peekMenuCache()).toBeNull();
    mockGetLocal.mockResolvedValue(cached);

    await getMenu();

    expect(peekMenuCache()).toEqual(cached);
  });

  it('dedupes concurrent loads into a single fetch', async () => {
    mockGetLocal.mockResolvedValue([]);
    mockFetch.mockResolvedValue(remote);

    const [a, b] = await Promise.all([getMenu(), getMenu()]);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(a).toEqual(remote);
    expect(b).toEqual(remote);
  });

  it('propagates database errors and leaves the cache empty', async () => {
    mockGetLocal.mockRejectedValue(new Error('db read failed'));

    await expect(getMenu()).rejects.toThrow('db read failed');
    expect(mockFetch).not.toHaveBeenCalled();
    expect(peekMenuCache()).toBeNull();
  });

  it('propagates API errors and does not persist invalid data', async () => {
    mockGetLocal.mockResolvedValue([]);
    mockFetch.mockRejectedValue(new Error('network failed'));

    await expect(getMenu()).rejects.toThrow('network failed');
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('prepareMenuForHome loads the menu and prefetches its images', async () => {
    mockGetLocal.mockResolvedValue(cached);

    await prepareMenuForHome();

    expect(mockPrefetch).toHaveBeenCalledWith(cached);
    expect(peekMenuCache()).toEqual(cached);
  });
});
