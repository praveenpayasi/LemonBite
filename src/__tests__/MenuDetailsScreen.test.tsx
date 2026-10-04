import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import MenuDetailsScreen from '@/app/menu-details/[id]';
import { CartProvider } from '@/context/CartContext';
import { getMenu, peekMenuCache } from '@/repositories/menuRepository';
import type { MenuItem } from '@/types';

jest.mock('@/repositories/menuRepository', () => ({
  getMenu: jest.fn(),
  peekMenuCache: jest.fn(() => null),
}));

const mockBack = jest.fn();
const mockPush = jest.fn();
const mockReplace = jest.fn();
let mockParams: Record<string, string> = { id: 'greek-salad' };

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack, push: mockPush, replace: mockReplace }),
  useLocalSearchParams: () => mockParams,
  useFocusEffect: jest.fn(),
}));

const mockGetMenu = getMenu as jest.Mock;
const mockPeek = peekMenuCache as jest.Mock;

const greekSalad: MenuItem = {
  id: 'greek-salad',
  title: 'Greek Salad',
  price: 12.99,
  description: 'Crispy lettuce, peppers, olives and our Chicago style feta cheese.',
  image: 'https://example.test/images/greekSalad.jpg',
  category: 'Starters',
};

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function renderScreen() {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <CartProvider>
        <MenuDetailsScreen />
      </CartProvider>
    </SafeAreaProvider>,
  );
}

async function renderReadyScreen() {
  const utils = renderScreen();
  await screen.findByText('Greek Salad');
  return utils;
}

describe('MenuDetailsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = { id: 'greek-salad' };
    mockPeek.mockReturnValue(null);
    mockGetMenu.mockResolvedValue([greekSalad]);
  });

  it('shows a loading indicator while the dish resolves', () => {
    mockGetMenu.mockReturnValue(new Promise(() => {}));

    renderScreen();

    expect(screen.getByLabelText('Loading dish')).toBeOnTheScreen();
  });

  it('renders the dish hero, title, price and description', async () => {
    await renderReadyScreen();

    expect(screen.getByRole('header', { name: 'Greek Salad' })).toBeOnTheScreen();
    expect(screen.getByText('$12.99')).toBeOnTheScreen();
    expect(screen.getByText(greekSalad.description)).toBeOnTheScreen();
    expect(screen.getByLabelText('A photo of Greek Salad')).toBeOnTheScreen();
  });

  it('renders the header controls and the delivery info row', async () => {
    await renderReadyScreen();

    expect(screen.getByLabelText('Go back')).toBeOnTheScreen();
    expect(screen.getByLabelText('Open cart, cart is empty')).toBeOnTheScreen();
    expect(screen.getByText('Delivery time: 20 minutes')).toBeOnTheScreen();
    expect(screen.getByLabelText('Change delivery time')).toBeOnTheScreen();
  });

  it('renders the three add-on rows unselected', async () => {
    await renderReadyScreen();

    expect(screen.getByRole('header', { name: 'Add' })).toBeOnTheScreen();
    for (const name of ['Feta', 'Parmesan', 'Dressing']) {
      expect(
        screen.getByRole('checkbox', { name: `${name}, +$1.00`, checked: false }),
      ).toBeOnTheScreen();
    }
  });

  it('shows the base price in the call to action', async () => {
    await renderReadyScreen();

    expect(screen.getByRole('button', { name: 'Add to Cart — $12.99' })).toBeOnTheScreen();
  });

  it('disables the decrement button at the minimum quantity', async () => {
    await renderReadyScreen();

    expect(screen.getByLabelText('Decrease quantity')).toBeDisabled();
    expect(screen.getByLabelText('Quantity 1')).toBeOnTheScreen();
  });

  it('updates the quantity and the call to action when incrementing', async () => {
    await renderReadyScreen();

    fireEvent.press(screen.getByLabelText('Increase quantity'));

    expect(screen.getByLabelText('Quantity 2')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Add to Cart — $25.98' })).toBeOnTheScreen();
    expect(screen.getByLabelText('Decrease quantity')).not.toBeDisabled();

    fireEvent.press(screen.getByLabelText('Decrease quantity'));

    expect(screen.getByLabelText('Quantity 1')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Add to Cart — $12.99' })).toBeOnTheScreen();
  });

  it('adds the add-on price to the call to action when toggled', async () => {
    await renderReadyScreen();

    fireEvent.press(screen.getByRole('checkbox', { name: 'Feta, +$1.00' }));

    expect(
      screen.getByRole('checkbox', { name: 'Feta, +$1.00', checked: true }),
    ).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Add to Cart — $13.99' })).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('checkbox', { name: 'Parmesan, +$1.00' }));

    expect(screen.getByRole('button', { name: 'Add to Cart — $14.99' })).toBeOnTheScreen();
  });

  it('combines add-ons and quantity in the call to action', async () => {
    await renderReadyScreen();

    fireEvent.press(screen.getByRole('checkbox', { name: 'Feta, +$1.00' }));
    fireEvent.press(screen.getByRole('checkbox', { name: 'Dressing, +$1.00' }));
    fireEvent.press(screen.getByLabelText('Increase quantity'));
    fireEvent.press(screen.getByLabelText('Increase quantity'));

    // (12.99 + 1 + 1) * 3
    expect(screen.getByRole('button', { name: 'Add to Cart — $44.97' })).toBeOnTheScreen();
  });

  it('adds the configured dish to the cart, confirms and navigates back', async () => {
    await renderReadyScreen();

    fireEvent.press(screen.getByRole('checkbox', { name: 'Feta, +$1.00' }));
    fireEvent.press(screen.getByLabelText('Increase quantity'));
    fireEvent.press(screen.getByTestId('add-to-cart'));

    expect(screen.getByRole('alert')).toHaveTextContent('Greek Salad added to your cart.');
    expect(mockBack).toHaveBeenCalledTimes(1);
    // The header badge reflects the two units now in the cart.
    expect(screen.getByTestId('header-cart-badge')).toHaveTextContent('2');
    expect(screen.getByLabelText('Open cart, 2 items')).toBeOnTheScreen();
  });

  it('opens the profile from the header avatar', async () => {
    await renderReadyScreen();

    fireEvent.press(screen.getByLabelText('Open profile'));

    expect(mockPush).toHaveBeenCalledWith('/profile');
  });

  it('shows a not-found message for an unknown dish', async () => {
    mockParams = { id: 'missing-dish' };

    renderScreen();

    await waitFor(() => expect(screen.getByRole('alert')).toBeOnTheScreen());
    expect(screen.getByText('We couldn’t find that dish.')).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Back to menu' }));
    expect(mockReplace).toHaveBeenCalledWith('/menu');
  });

  it('shows an error message when the repository rejects', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGetMenu.mockRejectedValue(new Error('offline'));

    renderScreen();

    await waitFor(() => expect(screen.getByRole('alert')).toBeOnTheScreen());
    expect(
      screen.getByText('We couldn’t load this dish. Please check your connection and try again.'),
    ).toBeOnTheScreen();

    consoleError.mockRestore();
  });
});
