import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import MenuScreen from '@/app/menu';
import { getMenu, peekMenuCache } from '@/repositories/menuRepository';
import { getFilteredMenuItems } from '@/services/database/menuDatabase';
import type { MenuItem } from '@/types';

jest.mock('@/repositories/menuRepository', () => ({
  getMenu: jest.fn(),
  peekMenuCache: jest.fn(() => null),
}));

jest.mock('@/services/database/menuDatabase', () => ({
  getFilteredMenuItems: jest.fn(),
}));

// Bypass the 500ms debounce in tests: reflect the search term immediately.
jest.mock('@/hooks/useDebouncedValue', () => ({
  useDebouncedValue: (value: unknown) => value,
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useFocusEffect: jest.fn(),
}));

const mockGetMenu = getMenu as jest.Mock;
const mockPeek = peekMenuCache as jest.Mock;
const mockGetFiltered = getFilteredMenuItems as jest.Mock;

const items: MenuItem[] = [
  {
    id: 'greek-salad',
    title: 'Greek Salad',
    price: 12.99,
    description: 'Feta and cucumber',
    image: 'greekSalad.jpg',
    category: 'Starters',
  },
  {
    id: 'grilled-fish',
    title: 'Grilled Fish',
    price: 20,
    description: 'Seasoned with salt',
    image: 'grilledFish.jpg',
    category: 'Mains',
  },
];

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function renderMenu() {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <MenuScreen />
    </SafeAreaProvider>,
  );
}

describe('MenuScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPeek.mockReturnValue(null);
    // Mimic the SQLite query: case-insensitive title substring AND category IN (...).
    mockGetFiltered.mockImplementation(async (search: string, categories: string[]) => {
      const needle = search.trim().toLowerCase();
      return items.filter((item) => {
        const matchesSearch = needle === '' || item.title.toLowerCase().includes(needle);
        const matchesCategory = categories.length === 0 || categories.includes(item.category);
        return matchesSearch && matchesCategory;
      });
    });
  });

  it('renders immediately from the prepared cache without a loading state', () => {
    mockPeek.mockReturnValue(items);

    renderMenu();

    expect(screen.queryByLabelText('Loading menu')).toBeNull();
    expect(screen.getByText('Greek Salad')).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'Starters' })).toBeOnTheScreen();
  });

  it('shows a loading indicator while data loads', () => {
    mockGetMenu.mockReturnValue(new Promise(() => {}));

    renderMenu();

    expect(screen.getByLabelText('Loading menu')).toBeOnTheScreen();
  });

  it('renders sections and items once data loads', async () => {
    mockGetMenu.mockResolvedValue(items);

    renderMenu();

    expect(await screen.findByRole('header', { name: 'Starters' })).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'Mains' })).toBeOnTheScreen();
    expect(screen.getByText('Greek Salad')).toBeOnTheScreen();
    expect(screen.getByText('$12.99')).toBeOnTheScreen();
    expect(screen.getByText('Feta and cucumber')).toBeOnTheScreen();
  });

  it('renders the search field and category chips', async () => {
    mockGetMenu.mockResolvedValue(items);

    renderMenu();

    expect(await screen.findByTestId('menu-search')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Starters' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Mains' })).toBeOnTheScreen();
  });

  it('filters visible items as the user types', async () => {
    mockGetMenu.mockResolvedValue(items);

    renderMenu();
    await screen.findByText('Greek Salad');

    fireEvent.changeText(screen.getByTestId('menu-search'), 'salad');

    expect(await screen.findByText('Greek Salad')).toBeOnTheScreen();
    await waitFor(() => expect(screen.queryByText('Grilled Fish')).toBeNull());
    expect(mockGetFiltered).toHaveBeenCalledWith('salad', []);
  });

  it('filters by category when a chip is pressed', async () => {
    mockGetMenu.mockResolvedValue(items);

    renderMenu();
    await screen.findByText('Greek Salad');

    fireEvent.press(screen.getByRole('button', { name: 'Mains' }));

    await waitFor(() => expect(mockGetFiltered).toHaveBeenCalledWith('', ['Mains']));
    expect(await screen.findByText('Grilled Fish')).toBeOnTheScreen();
    await waitFor(() => expect(screen.queryByText('Greek Salad')).toBeNull());
    expect(mockGetFiltered).toHaveBeenCalledWith('', ['Mains']);
  });

  it('supports selecting multiple categories at once (union of results)', async () => {
    mockGetMenu.mockResolvedValue(items);

    renderMenu();
    await screen.findByText('Greek Salad');

    fireEvent.press(screen.getByRole('button', { name: 'Starters' }));
    fireEvent.press(screen.getByRole('button', { name: 'Mains' }));

    // Both chips remain selected and both categories' items are shown.
    expect(screen.getByRole('button', { name: 'Starters', selected: true })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Mains', selected: true })).toBeOnTheScreen();
    expect(await screen.findByText('Greek Salad')).toBeOnTheScreen();
    expect(screen.getByText('Grilled Fish')).toBeOnTheScreen();
    expect(mockGetFiltered).toHaveBeenLastCalledWith('', ['Starters', 'Mains']);
  });

  it('deselects a single category while keeping the others active', async () => {
    mockGetMenu.mockResolvedValue(items);

    renderMenu();
    await screen.findByText('Greek Salad');

    fireEvent.press(screen.getByRole('button', { name: 'Starters' }));
    fireEvent.press(screen.getByRole('button', { name: 'Mains' }));
    await screen.findByText('Grilled Fish');

    // Toggle Mains back off; Starters stays selected.
    fireEvent.press(screen.getByRole('button', { name: 'Mains' }));

    expect(screen.getByRole('button', { name: 'Starters', selected: true })).toBeOnTheScreen();
    await waitFor(() => expect(screen.queryByText('Grilled Fish')).toBeNull());
    expect(screen.getByText('Greek Salad')).toBeOnTheScreen();
  });

  it('applies search and category filters together', async () => {
    mockGetMenu.mockResolvedValue(items);

    renderMenu();
    await screen.findByText('Greek Salad');

    fireEvent.press(screen.getByRole('button', { name: 'Mains' }));
    fireEvent.changeText(screen.getByTestId('menu-search'), 'salad');

    expect(await screen.findByText('No menu items match your search.')).toBeOnTheScreen();
    expect(mockGetFiltered).toHaveBeenLastCalledWith('salad', ['Mains']);
  });

  it('shows the no-results state and restores results when the search is cleared', async () => {
    mockGetMenu.mockResolvedValue(items);

    renderMenu();
    await screen.findByText('Greek Salad');

    fireEvent.changeText(screen.getByTestId('menu-search'), 'pizza');
    expect(await screen.findByText('No menu items match your search.')).toBeOnTheScreen();
    expect(screen.queryByText('Greek Salad')).toBeNull();

    fireEvent.press(screen.getByRole('button', { name: 'Clear search' }));
    expect(screen.getByText('Greek Salad')).toBeOnTheScreen();
    expect(screen.getByText('Grilled Fish')).toBeOnTheScreen();
  });

  it('does not query the network while filtering (SQLite only)', async () => {
    mockGetMenu.mockResolvedValue(items);

    renderMenu();
    await screen.findByText('Greek Salad');

    mockGetMenu.mockClear();
    fireEvent.changeText(screen.getByTestId('menu-search'), 'salad');
    await screen.findByText('Greek Salad');
    fireEvent.press(screen.getByRole('button', { name: 'Starters' }));
    await waitFor(() => expect(mockGetFiltered).toHaveBeenCalled());

    expect(mockGetMenu).not.toHaveBeenCalled();
  });

  it('shows an error state when loading fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGetMenu.mockRejectedValue(new Error('load failed'));

    renderMenu();

    expect(await screen.findByRole('alert')).toHaveTextContent(/couldn’t load the menu/i);
    expect(screen.getByRole('button', { name: 'Try again' })).toBeOnTheScreen();
  });
});
