import { useEffect } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import OrderConfirmationScreen from '@/app/order-confirmation';
import { CartProvider, useCart, type CartContextValue } from '@/context/CartContext';
import { formatEstimatedArrival, generateOrderNumber } from '@/utils/order';
import type { CartItem } from '@/types';

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, back: jest.fn() }),
  useFocusEffect: jest.fn(),
}));

const bruschetta: Omit<CartItem, 'id' | 'totalPrice'> = {
  dishId: 'bruschetta',
  title: 'Bruschetta',
  basePrice: 7.99,
  image: 'https://example.test/images/bruschetta.jpg',
  quantity: 1,
  selectedAddOns: [],
};

const greekSalad: Omit<CartItem, 'id' | 'totalPrice'> = {
  dishId: 'greek-salad',
  title: 'Greek Salad',
  basePrice: 12.99,
  image: 'https://example.test/images/greekSalad.jpg',
  quantity: 1,
  selectedAddOns: [],
};

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

function Harness({ showConfirmation }: { showConfirmation: boolean }) {
  return (
    <SafeAreaProvider initialMetrics={metrics}>
      <CartProvider>
        <CartProbe />
        {showConfirmation ? <OrderConfirmationScreen /> : null}
      </CartProvider>
    </SafeAreaProvider>
  );
}

/**
 * Mounts the provider first so the cart can be seeded, then mounts the screen.
 * Re-rendering the same `Harness` type preserves the provider's state.
 */
function renderConfirmation(seed: Omit<CartItem, 'id' | 'totalPrice'>[] = [bruschetta, greekSalad]) {
  const utils = render(<Harness showConfirmation={false} />);
  act(() => {
    for (const line of seed) {
      cart.current?.addToCart(line);
    }
  });
  utils.rerender(<Harness showConfirmation />);
  return utils;
}

describe('order number helpers', () => {
  it('generates a reference in the Order #LL-NNNN format', () => {
    for (let i = 0; i < 25; i += 1) {
      expect(generateOrderNumber()).toMatch(/^Order #LL-\d{4}$/);
    }
  });

  it('formats the arrival estimate', () => {
    expect(formatEstimatedArrival(20)).toBe('20 mins');
    expect(formatEstimatedArrival(1)).toBe('1 min');
  });
});

describe('OrderConfirmationScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cart.current = null;
  });

  describe('success card', () => {
    it('renders the success headline, subheading and gratitude note', () => {
      renderConfirmation();

      expect(screen.getByRole('header', { name: 'Success!' })).toBeOnTheScreen();
      expect(screen.getByText('Your order will be with you shortly.')).toBeOnTheScreen();
      expect(screen.getByText('Thank you for your business.')).toBeOnTheScreen();
      expect(screen.getByTestId('success-card')).toBeOnTheScreen();
    });

    it('shows a generated order reference and the arrival badge', () => {
      renderConfirmation();

      expect(screen.getByText(/^Order #LL-\d{4}$/)).toBeOnTheScreen();
      expect(screen.getByText('Estimated Arrival: 20 mins')).toBeOnTheScreen();
    });

    it('keeps the same order reference across re-renders', () => {
      const { rerender } = renderConfirmation();

      const first = screen.getByText(/^Order #LL-\d{4}$/).props.children;
      rerender(<Harness showConfirmation />);

      expect(screen.getByText(/^Order #LL-\d{4}$/).props.children).toBe(first);
    });

    it('exposes both actions as buttons', () => {
      renderConfirmation();

      expect(screen.getByRole('button', { name: 'Track Order' })).toBeOnTheScreen();
      expect(screen.getByRole('button', { name: 'Back to Home' })).toBeOnTheScreen();
    });
  });

  describe('order context underlay', () => {
    it('renders the header without a back button', () => {
      renderConfirmation();

      expect(screen.queryByLabelText('Go back')).toBeNull();
      expect(screen.getByLabelText('Open profile')).toBeOnTheScreen();
    });

    it('renders the delivery estimate as a read-only indicator', () => {
      renderConfirmation();

      expect(screen.getByText('Delivery time: 20 minutes')).toBeOnTheScreen();
      expect(screen.queryByLabelText('Change delivery time')).toBeNull();
    });

    it('recaps each ordered line with its quantity and price', () => {
      renderConfirmation();

      expect(screen.getByRole('header', { name: 'Order Summary' })).toBeOnTheScreen();
      expect(screen.getByText('1 × Bruschetta — $7.99')).toBeOnTheScreen();
      expect(screen.getByText('1 × Greek Salad — $12.99')).toBeOnTheScreen();
      // 7.99 + 12.99 + 2.00 delivery + 1.00 service
      expect(screen.getByText('$23.98')).toBeOnTheScreen();
    });

    it('recaps merged quantities', () => {
      renderConfirmation([bruschetta, bruschetta, greekSalad]);

      expect(screen.getByText('2 × Bruschetta — $15.98')).toBeOnTheScreen();
    });

    it('reports the cutlery preference as Yes by default', () => {
      renderConfirmation();

      expect(screen.getByText('Cutlery requested: Yes')).toBeOnTheScreen();
    });

    it('reports the cutlery preference as No when it was switched off', () => {
      const utils = render(<Harness showConfirmation={false} />);
      act(() => {
        cart.current?.addToCart(bruschetta);
        cart.current?.setCutleryRequested(false);
      });
      utils.rerender(<Harness showConfirmation />);

      expect(screen.getByText('Cutlery requested: No')).toBeOnTheScreen();
    });

    it('omits the summary section when the cart was empty', () => {
      renderConfirmation([]);

      expect(screen.queryByRole('header', { name: 'Order Summary' })).toBeNull();
      expect(screen.getByRole('header', { name: 'Success!' })).toBeOnTheScreen();
    });
  });

  describe('cart cleanup', () => {
    it('clears the cart on entering the screen', () => {
      renderConfirmation();

      expect(cart.current?.items).toEqual([]);
      expect(cart.current?.totalItemsCount).toBe(0);
      expect(cart.current?.total).toBe(0);
    });

    it('still shows the snapshot after the cart has been cleared', () => {
      renderConfirmation();

      expect(cart.current?.items).toEqual([]);
      expect(screen.getByText('1 × Bruschetta — $7.99')).toBeOnTheScreen();
    });

    it('leaves the cart empty after Back to Home', () => {
      renderConfirmation();

      fireEvent.press(screen.getByTestId('back-to-home'));

      expect(cart.current?.items).toEqual([]);
    });
  });

  describe('navigation', () => {
    it('navigates to the menu from Track Order', () => {
      renderConfirmation();

      fireEvent.press(screen.getByTestId('track-order'));

      expect(mockReplace).toHaveBeenCalledWith('/menu');
    });

    it('navigates to the menu from Back to Home', () => {
      renderConfirmation();

      fireEvent.press(screen.getByTestId('back-to-home'));

      expect(mockReplace).toHaveBeenCalledWith('/menu');
    });

    it('opens the profile from the header avatar', () => {
      renderConfirmation();

      fireEvent.press(screen.getByLabelText('Open profile'));

      expect(mockPush).toHaveBeenCalledWith('/profile');
    });
  });
});
