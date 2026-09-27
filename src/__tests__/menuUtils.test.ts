import { getMenuCategories, getSectionListData } from '@/utils/menu';
import type { MenuItem } from '@/types';

const items: MenuItem[] = [
  { id: 'greek-salad', title: 'Greek Salad', price: 12.99, description: 'Feta, cucumber and olives', image: 'g.jpg', category: 'Starters' },
  { id: 'grilled-fish', title: 'Grilled Fish', price: 20, description: 'Grilled with lemon and herbs', image: 'f.jpg', category: 'Mains' },
  { id: 'bruschetta', title: 'Bruschetta', price: 7.99, description: 'Toasted bread with tomato', image: 'br.jpg', category: 'Starters' },
  { id: 'lemon-dessert', title: 'Lemon Dessert', price: 4.99, description: 'Sweet lemon treat', image: 'l.jpg', category: 'Desserts' },
];

describe('getSectionListData', () => {
  it('groups items by category in the canonical onboarding order', () => {
    const sections = getSectionListData(items);

    expect(sections.map((section) => section.title)).toEqual(['Starters', 'Mains', 'Desserts']);
    expect(sections.map((section) => section.data.map((item) => item.title))).toEqual([
      ['Greek Salad', 'Bruschetta'],
      ['Grilled Fish'],
      ['Lemon Dessert'],
    ]);
  });

  it('keeps the expected menu item fields in section data', () => {
    const [firstSection] = getSectionListData(items);

    expect(firstSection?.data).toContainEqual(
      expect.objectContaining({
        id: expect.any(String),
        title: expect.any(String),
        price: expect.any(Number),
        description: expect.any(String),
        image: expect.any(String),
      }),
    );
  });

  it('does not mutate the input array', () => {
    const snapshot = JSON.parse(JSON.stringify(items));

    getSectionListData(items);

    expect(items).toEqual(snapshot);
  });

  it('returns an empty array when there are no items', () => {
    expect(getSectionListData([])).toEqual([]);
  });
});

describe('getMenuCategories', () => {
  it('returns unique categories in canonical order', () => {
    expect(getMenuCategories(items)).toEqual(['Starters', 'Mains', 'Desserts']);
  });

  it('returns an empty array when there are no items', () => {
    expect(getMenuCategories([])).toEqual([]);
  });
});
