import { useEffect } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import MenuScreen from '@/app/menu';
import { CartProvider, useCart, type CartContextValue } from '@/context/CartContext';
import { saveCategoryPreferences } from '@/services/storage/profileStorage';
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

const mockPush = jest.fn();
const mockNavigate = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, navigate: mockNavigate }),
  usePathname: () => '/menu',
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

const cart: { current: CartContextValue | null } = { current: null };

function CartProbe() {
  const value = useCart();
  useEffect(() => {
    cart.current = value;
  }, [value]);
  return null;
}

function renderMenu() {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <CartProvider>
        <CartProbe />
        <MenuScreen />
      </CartProvider>
    </SafeAreaProvider>,
  );
}

describe('MenuScreen', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    cart.current = null;
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

    // Let each filter query settle before the next press: both dishes are already
    // on screen pre-filter, so findByText alone would not wait for the query.
    fireEvent.press(screen.getByRole('button', { name: 'Starters' }));
    await waitFor(() => expect(mockGetFiltered).toHaveBeenLastCalledWith('', ['Starters']));
    await waitFor(() => expect(screen.queryByText('Grilled Fish')).toBeNull());

    fireEvent.press(screen.getByRole('button', { name: 'Mains' }));
    await waitFor(() =>
      expect(mockGetFiltered).toHaveBeenLastCalledWith('', ['Starters', 'Mains']),
    );
    await screen.findByText('Grilled Fish');

    // Toggle Mains back off; Starters stays selected.
    fireEvent.press(screen.getByRole('button', { name: 'Mains' }));
    await waitFor(() => expect(mockGetFiltered).toHaveBeenLastCalledWith('', ['Starters']));

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

describe('MenuScreen header cart badge', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    cart.current = null;
    mockPeek.mockReturnValue(items);
    mockGetFiltered.mockResolvedValue(items);
  });

  it('renders the cart button with no badge while the cart is empty', async () => {
    renderMenu();
    await screen.findByText('Greek Salad');

    expect(screen.getByLabelText('Open cart, cart is empty')).toBeOnTheScreen();
    expect(screen.queryByTestId('header-cart-badge')).toBeNull();
  });

  it('shows the live item count once items are added', async () => {
    renderMenu();
    await screen.findByText('Greek Salad');

    act(() =>
      cart.current?.addToCart({
        dishId: 'greek-salad',
        title: 'Greek Salad',
        basePrice: 12.99,
        image: 'greekSalad.jpg',
        quantity: 2,
        selectedAddOns: [],
      }),
    );

    expect(screen.getByTestId('header-cart-badge')).toHaveTextContent('2');
    expect(screen.getByLabelText('Open cart, 2 items')).toBeOnTheScreen();
  });

  it('navigates to the cart when the badge is pressed', async () => {
    renderMenu();
    await screen.findByText('Greek Salad');

    fireEvent.press(screen.getByTestId('header-cart-button'));

    expect(mockNavigate).toHaveBeenCalledWith('/cart');
    // `navigate` reuses an existing cart screen; `push` would stack duplicates.
    expect(mockPush).not.toHaveBeenCalledWith('/cart');
  });

  it('does not stack duplicate cart screens on repeated taps', async () => {
    renderMenu();
    await screen.findByText('Greek Salad');

    const cartButton = screen.getByTestId('header-cart-button');
    fireEvent.press(cartButton);
    fireEvent.press(cartButton);
    fireEvent.press(cartButton);

    expect(mockNavigate).toHaveBeenCalledTimes(3);
    expect(mockNavigate.mock.calls).toEqual([['/cart'], ['/cart'], ['/cart']]);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('keeps the profile avatar reachable from the header', async () => {
    renderMenu();
    await screen.findByText('Greek Salad');

    fireEvent.press(screen.getByLabelText('Open profile'));

    expect(mockPush).toHaveBeenCalledWith('/profile');
  });
});

describe('MenuScreen saved category preferences', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    cart.current = null;
    mockPeek.mockReturnValue(null);
    mockGetMenu.mockResolvedValue(items);
    mockGetFiltered.mockImplementation(async (search: string, categories: string[]) => {
      const needle = search.trim().toLowerCase();
      return items.filter((item) => {
        const matchesSearch = needle === '' || item.title.toLowerCase().includes(needle);
        const matchesCategory = categories.length === 0 || categories.includes(item.category);
        return matchesSearch && matchesCategory;
      });
    });
  });

  it('seeds the category filters from the saved onboarding preferences', async () => {
    await saveCategoryPreferences(['Mains']);

    renderMenu();

    await waitFor(() => expect(mockGetFiltered).toHaveBeenCalledWith('', ['Mains']));
    expect(await screen.findByRole('button', { name: 'Mains', selected: true })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Starters', selected: false })).toBeOnTheScreen();
    await waitFor(() => expect(screen.queryByText('Greek Salad')).toBeNull());
    expect(screen.getByText('Grilled Fish')).toBeOnTheScreen();
  });

  it('applies no filter when nothing was selected during onboarding', async () => {
    await saveCategoryPreferences([]);

    renderMenu();
    await screen.findByText('Greek Salad');

    expect(screen.getByText('Grilled Fish')).toBeOnTheScreen();
    expect(mockGetFiltered).not.toHaveBeenCalled();
  });

  it('ignores saved categories the menu does not contain', async () => {
    await saveCategoryPreferences(['Desserts']);

    renderMenu();
    await screen.findByText('Greek Salad');

    expect(screen.getByText('Grilled Fish')).toBeOnTheScreen();
    expect(mockGetFiltered).not.toHaveBeenCalled();
  });

  it('keeps only the categories that exist in the menu', async () => {
    await saveCategoryPreferences(['Desserts', 'Starters']);

    renderMenu();

    await waitFor(() => expect(mockGetFiltered).toHaveBeenCalledWith('', ['Starters']));
    expect(await screen.findByRole('button', { name: 'Starters', selected: true })).toBeOnTheScreen();
  });

  it('lets the user switch off a preference-seeded category', async () => {
    await saveCategoryPreferences(['Mains']);

    renderMenu();
    await screen.findByRole('button', { name: 'Mains', selected: true });

    fireEvent.press(screen.getByRole('button', { name: 'Mains' }));

    expect(screen.getByRole('button', { name: 'Mains', selected: false })).toBeOnTheScreen();
    expect(await screen.findByText('Greek Salad')).toBeOnTheScreen();
  });
});
