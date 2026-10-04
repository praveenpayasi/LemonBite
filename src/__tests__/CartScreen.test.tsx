import { useEffect, type ReactNode } from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import CartScreen from '@/app/cart';
import { CartProvider, useCart, type CartContextValue } from '@/context/CartContext';
import { getMenu, peekMenuCache } from '@/repositories/menuRepository';
import type { CartItem, MenuItem } from '@/types';

jest.mock('@/repositories/menuRepository', () => ({
  getMenu: jest.fn(),
  peekMenuCache: jest.fn(() => null),
}));

const mockBack = jest.fn();
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockNavigate = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
    replace: mockReplace,
    navigate: mockNavigate,
  }),
  usePathname: () => '/cart',
  useFocusEffect: jest.fn(),
}));

const mockGetMenu = getMenu as jest.Mock;
const mockPeek = peekMenuCache as jest.Mock;

const greekSalad: MenuItem = {
  id: 'greek-salad',
  title: 'Greek Salad',
  price: 12.99,
  description: 'Crispy lettuce, peppers, olives and feta.',
  image: 'https://example.test/images/greekSalad.jpg',
  category: 'Starters',
};

const grilledFish: MenuItem = {
  id: 'grilled-fish',
  title: 'Grilled Fish',
  price: 20,
  description: 'Seasoned with salt and pepper.',
  image: 'https://example.test/images/grilledFish.jpg',
  category: 'Mains',
};

const bruschettaLine: Omit<CartItem, 'id' | 'totalPrice'> = {
  dishId: 'bruschetta',
  title: 'Bruschetta',
  basePrice: 7.99,
  image: 'https://example.test/images/bruschetta.jpg',
  quantity: 1,
  selectedAddOns: [{ id: 'feta', name: 'Feta', price: 1 }],
};

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

/** Drives the cart from outside the screen so tests can seed and inspect state. */
const cart: { current: CartContextValue | null } = { current: null };

function CartProbe() {
  const value = useCart();
  useEffect(() => {
    cart.current = value;
  }, [value]);
  return null;
}

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <SafeAreaProvider initialMetrics={metrics}>
      <CartProvider>
        <CartProbe />
        {children}
      </CartProvider>
    </SafeAreaProvider>
  );
}

function renderCartScreen() {
  return render(<CartScreen />, { wrapper: Wrapper });
}

describe('CartScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cart.current = null;
    mockPeek.mockReturnValue([greekSalad, grilledFish]);
    mockGetMenu.mockResolvedValue([greekSalad, grilledFish]);
  });

  describe('empty state', () => {
    it('shows the empty message and an Explore Menu button', () => {
      renderCartScreen();

      expect(screen.getByRole('header', { name: 'Your cart is empty' })).toBeOnTheScreen();
      expect(screen.getByRole('button', { name: 'Explore Menu' })).toBeOnTheScreen();
      expect(screen.queryByTestId('checkout')).toBeNull();
      expect(screen.queryByTestId('price-summary')).toBeNull();
    });

    it('navigates back to the menu from Explore Menu', () => {
      renderCartScreen();

      fireEvent.press(screen.getByTestId('explore-menu'));

      expect(mockReplace).toHaveBeenCalledWith('/menu');
    });
  });

  describe('with items', () => {
    function seedCart() {
      renderCartScreen();
      act(() => cart.current?.addToCart(bruschettaLine));
    }

    it('renders the header, delivery row and cutlery option', () => {
      seedCart();

      expect(screen.getByLabelText('Go back')).toBeOnTheScreen();
      expect(screen.getByText('Delivery time: 20 minutes')).toBeOnTheScreen();
      expect(screen.getByLabelText('Change delivery time')).toBeOnTheScreen();
      expect(screen.getByRole('switch', { name: 'Cutlery', checked: true })).toBeOnTheScreen();
    });

    it('renders the order summary sections and the cart line', () => {
      seedCart();

      expect(screen.getByRole('header', { name: 'Order Summary' })).toBeOnTheScreen();
      expect(screen.getByRole('header', { name: 'Items' })).toBeOnTheScreen();
      expect(screen.getByText('1 × Bruschetta')).toBeOnTheScreen();
      expect(screen.getByText('+ Feta ($1.00)')).toBeOnTheScreen();
      expect(
        within(screen.getByTestId('cart-item-bruschetta')).getByText('$8.99'),
      ).toBeOnTheScreen();
    });

    it('shows the price breakdown including both fees', () => {
      seedCart();

      expect(screen.getByText('Subtotal')).toBeOnTheScreen();
      expect(screen.getByText('Delivery')).toBeOnTheScreen();
      expect(screen.getByText('Service')).toBeOnTheScreen();
      expect(screen.getByText('$2.00')).toBeOnTheScreen();
      expect(screen.getByText('$1.00')).toBeOnTheScreen();
      // 8.99 + 2.00 + 1.00
      expect(screen.getByTestId('price-summary-total')).toHaveTextContent('$11.99');
    });

    it('increments a line and updates the totals', () => {
      seedCart();

      fireEvent.press(screen.getByLabelText('Increase quantity'));

      expect(screen.getByText('2 × Bruschetta')).toBeOnTheScreen();
      expect(screen.getByTestId('price-summary-total')).toHaveTextContent('$20.98');
      expect(cart.current?.totalItemsCount).toBe(2);
    });

    it('decrements a line back down', () => {
      seedCart();

      fireEvent.press(screen.getByLabelText('Increase quantity'));
      fireEvent.press(screen.getByLabelText('Decrease quantity'));

      expect(screen.getByText('1 × Bruschetta')).toBeOnTheScreen();
      expect(screen.getByTestId('price-summary-total')).toHaveTextContent('$11.99');
    });

    it('removes the line and falls back to the empty state', () => {
      seedCart();

      fireEvent.press(screen.getByLabelText('Remove Bruschetta'));

      expect(screen.getByRole('header', { name: 'Your cart is empty' })).toBeOnTheScreen();
      expect(cart.current?.items).toEqual([]);
    });

    it('toggles the cutlery preference', () => {
      seedCart();

      fireEvent.press(screen.getByRole('switch', { name: 'Cutlery' }));

      expect(screen.getByRole('switch', { name: 'Cutlery', checked: false })).toBeOnTheScreen();
      expect(cart.current?.cutleryRequested).toBe(false);
    });

    it('shows a notice when changing the delivery time', () => {
      seedCart();

      fireEvent.press(screen.getByLabelText('Change delivery time'));

      expect(screen.getByRole('alert')).toHaveTextContent('Delivery options are coming soon.');
    });

    it('recommends dishes that are not already in the cart', async () => {
      seedCart();

      await waitFor(() =>
        expect(screen.getByRole('header', { name: 'Add More To Your Order!' })).toBeOnTheScreen(),
      );
      expect(screen.getByTestId('recommended-greek-salad')).toBeOnTheScreen();
      expect(screen.getByTestId('recommended-grilled-fish')).toBeOnTheScreen();
    });

    it('adds a recommended dish and drops it from the recommendations', async () => {
      seedCart();

      await waitFor(() => expect(screen.getByTestId('recommended-greek-salad')).toBeOnTheScreen());
      fireEvent.press(screen.getByLabelText('Add Greek Salad'));

      expect(screen.getByText('1 × Greek Salad')).toBeOnTheScreen();
      expect(screen.queryByTestId('recommended-greek-salad')).toBeNull();
      expect(cart.current?.totalItemsCount).toBe(2);
    });

    it('shows the order total in the checkout button and navigates on press', () => {
      seedCart();

      expect(screen.getByRole('button', { name: 'Checkout — $11.99' })).toBeOnTheScreen();

      fireEvent.press(screen.getByTestId('checkout'));

      expect(mockPush).toHaveBeenCalledWith('/order-confirmation');
    });

    it('opens the profile from the header avatar', () => {
      seedCart();

      fireEvent.press(screen.getByLabelText('Open profile'));

      expect(mockPush).toHaveBeenCalledWith('/profile');
    });

    it('disables the header cart button while already on the cart screen', () => {
      seedCart();

      const cartButton = screen.getByTestId('header-cart-button');
      expect(cartButton).toBeDisabled();

      fireEvent.press(cartButton);
      fireEvent.press(cartButton);

      expect(mockNavigate).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalledWith('/cart');
    });
  });
});
