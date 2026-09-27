import { getMenuImageUrl } from '@/constants/api';
import { fetchMenuItems, normalizeMenuItem } from '@/services/api/menuApi';

const IMAGES =
  'https://raw.githubusercontent.com/Meta-Mobile-Developer-PC/Working-With-Data-API/main/images';

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

describe('getMenuImageUrl', () => {
  it('builds a full raw URL from a filename', () => {
    expect(getMenuImageUrl('greekSalad.jpg')).toBe(`${IMAGES}/greekSalad.jpg`);
  });

  it('returns an already-absolute URL unchanged (no double prefix)', () => {
    const full = `${IMAGES}/greekSalad.jpg`;
    expect(getMenuImageUrl(full)).toBe(full);
  });
});

describe('normalizeMenuItem', () => {
  it('maps name→title, keeps price, resolves the image URL and capitalizes the category', () => {
    const result = normalizeMenuItem({
      name: 'Greek Salad',
      price: 12.99,
      description: 'Feta and cucumber',
      image: 'greekSalad.jpg',
      category: 'starters',
    });

    expect(result).toEqual({
      id: 'greek-salad',
      title: 'Greek Salad',
      price: 12.99,
      description: 'Feta and cucumber',
      image: `${IMAGES}/greekSalad.jpg`,
      category: 'Starters',
    });
  });

  it('normalizes mains and desserts categories', () => {
    expect(
      normalizeMenuItem({ name: 'Pasta', price: 6.99, description: 'x', image: 'pasta.jpg', category: 'mains' })
        .category,
    ).toBe('Mains');
    expect(
      normalizeMenuItem({
        name: 'Lemon Dessert',
        price: 4.99,
        description: 'x',
        image: 'lemonDessert.jpg',
        category: 'desserts',
      }).category,
    ).toBe('Desserts');
  });

  it('supports a nested category object', () => {
    expect(
      normalizeMenuItem({
        name: 'Bruschetta',
        price: 7.99,
        description: 'x',
        image: 'b.jpg',
        category: { title: 'starters' },
      }).category,
    ).toBe('Starters');
  });

  it('generates a deterministic id from the name', () => {
    expect(
      normalizeMenuItem({ name: 'Grilled Fish', price: 20, description: 'x', image: 'grilledFish.jpg', category: 'mains' })
        .id,
    ).toBe('grilled-fish');
  });
});

describe('fetchMenuItems', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('fetches and normalizes the payload with full image URLs', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        menu: [
          {
            name: 'Grilled Fish',
            price: 20,
            description: 'Seasoned with salt',
            image: 'grilledFish.jpg',
            category: 'mains',
          },
        ],
      }),
    });

    const items = await fetchMenuItems();

    expect(items).toEqual([
      {
        id: 'grilled-fish',
        title: 'Grilled Fish',
        price: 20,
        description: 'Seasoned with salt',
        image: `${IMAGES}/grilledFish.jpg`,
        category: 'Mains',
      },
    ]);
  });

  it('throws when the response is not ok', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });

    await expect(fetchMenuItems()).rejects.toThrow('status 500');
  });

  it('throws when the payload has no menu array', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ items: [] }) });

    await expect(fetchMenuItems()).rejects.toThrow('malformed');
  });

  it('throws when a menu item is malformed', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ menu: [{ name: 'No Price', description: 'x', image: 'x.jpg', category: 'mains' }] }),
    });

    await expect(fetchMenuItems()).rejects.toThrow('malformed');
  });

  it('propagates network errors', async () => {
    mockFetch.mockRejectedValue(new Error('Network down'));

    await expect(fetchMenuItems()).rejects.toThrow('Network down');
  });
});
