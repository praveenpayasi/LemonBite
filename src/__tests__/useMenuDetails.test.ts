import { createElement, type ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { CartProvider, useCart } from '@/context/CartContext';
import { useMenuDetails } from '@/hooks/useMenuDetails';
import { getMenu, peekMenuCache } from '@/repositories/menuRepository';
import type { MenuItem } from '@/types';

jest.mock('@/repositories/menuRepository', () => ({
  getMenu: jest.fn(),
  peekMenuCache: jest.fn(() => null),
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

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(CartProvider, null, children);

function renderDetails(dishId = greekSalad.id) {
  return renderHook(
    () => ({
      details: useMenuDetails(dishId),
      cart: useCart(),
    }),
    { wrapper },
  );
}

describe('useMenuDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPeek.mockReturnValue(null);
    mockGetMenu.mockResolvedValue([greekSalad]);
  });

  it('starts loading and resolves the dish from the repository', async () => {
    const { result } = renderDetails();

    expect(result.current.details.status).toBe('loading');
    expect(result.current.details.dish).toBeNull();

    await waitFor(() => expect(result.current.details.status).toBe('ready'));
    expect(result.current.details.dish).toEqual(greekSalad);
    expect(mockGetMenu).toHaveBeenCalledTimes(1);
  });

  it('hydrates synchronously from the prepared cache without calling getMenu', () => {
    mockPeek.mockReturnValue([greekSalad]);

    const { result } = renderDetails();

    expect(result.current.details.status).toBe('ready');
    expect(result.current.details.dish).toEqual(greekSalad);
    expect(mockGetMenu).not.toHaveBeenCalled();
  });

  it('reports not-found when the dish id is unknown', async () => {
    const { result } = renderDetails('missing-dish');

    await waitFor(() => expect(result.current.details.status).toBe('not-found'));
    expect(result.current.details.dish).toBeNull();
  });

  it('reports an error when the repository rejects', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGetMenu.mockRejectedValue(new Error('offline'));

    const { result } = renderDetails();

    await waitFor(() => expect(result.current.details.status).toBe('error'));
    consoleError.mockRestore();
  });

  it('defaults to quantity 1 with no add-ons selected', async () => {
    const { result } = renderDetails();
    await waitFor(() => expect(result.current.details.status).toBe('ready'));

    expect(result.current.details.quantity).toBe(1);
    expect(result.current.details.selectedAddOns.size).toBe(0);
    expect(result.current.details.availableAddOns.map((addOn) => addOn.id)).toEqual([
      'feta',
      'parmesan',
      'dressing',
    ]);
    expect(result.current.details.unitPrice).toBeCloseTo(12.99);
    expect(result.current.details.totalPrice).toBeCloseTo(12.99);
  });

  it('increments the quantity and scales the total price', async () => {
    const { result } = renderDetails();
    await waitFor(() => expect(result.current.details.status).toBe('ready'));

    act(() => result.current.details.incrementQuantity());
    act(() => result.current.details.incrementQuantity());

    expect(result.current.details.quantity).toBe(3);
    expect(result.current.details.unitPrice).toBeCloseTo(12.99);
    expect(result.current.details.totalPrice).toBeCloseTo(38.97);
  });

  it('does not decrement below the minimum quantity of 1', async () => {
    const { result } = renderDetails();
    await waitFor(() => expect(result.current.details.status).toBe('ready'));

    act(() => result.current.details.decrementQuantity());

    expect(result.current.details.quantity).toBe(1);
    expect(result.current.details.totalPrice).toBeCloseTo(12.99);
  });

  it('decrements back down after incrementing', async () => {
    const { result } = renderDetails();
    await waitFor(() => expect(result.current.details.status).toBe('ready'));

    act(() => result.current.details.incrementQuantity());
    act(() => result.current.details.incrementQuantity());
    act(() => result.current.details.decrementQuantity());

    expect(result.current.details.quantity).toBe(2);
    expect(result.current.details.totalPrice).toBeCloseTo(25.98);
  });

  it('adds each selected add-on to the unit price', async () => {
    const { result } = renderDetails();
    await waitFor(() => expect(result.current.details.status).toBe('ready'));

    act(() => result.current.details.toggleAddOn('feta'));
    expect(result.current.details.unitPrice).toBeCloseTo(13.99);

    act(() => result.current.details.toggleAddOn('parmesan'));
    expect(result.current.details.selectedAddOns.has('parmesan')).toBe(true);
    expect(result.current.details.unitPrice).toBeCloseTo(14.99);
  });

  it('removes an add-on when toggled a second time', async () => {
    const { result } = renderDetails();
    await waitFor(() => expect(result.current.details.status).toBe('ready'));

    act(() => result.current.details.toggleAddOn('dressing'));
    act(() => result.current.details.toggleAddOn('dressing'));

    expect(result.current.details.selectedAddOns.has('dressing')).toBe(false);
    expect(result.current.details.unitPrice).toBeCloseTo(12.99);
  });

  it('aggregates add-ons and quantity into the total price', async () => {
    const { result } = renderDetails();
    await waitFor(() => expect(result.current.details.status).toBe('ready'));

    act(() => result.current.details.toggleAddOn('feta'));
    act(() => result.current.details.toggleAddOn('parmesan'));
    act(() => result.current.details.incrementQuantity());
    act(() => result.current.details.incrementQuantity());

    // (12.99 + 1 + 1) * 3
    expect(result.current.details.unitPrice).toBeCloseTo(14.99);
    expect(result.current.details.totalPrice).toBeCloseTo(44.97);
  });

  it('pushes the configured dish into the cart', async () => {
    const { result } = renderDetails();
    await waitFor(() => expect(result.current.details.status).toBe('ready'));

    act(() => result.current.details.toggleAddOn('feta'));
    act(() => result.current.details.incrementQuantity());
    act(() => {
      expect(result.current.details.handleAddToCart()).toBe(true);
    });

    expect(result.current.cart.items).toHaveLength(1);
    expect(result.current.cart.items[0]).toMatchObject({
      dishId: 'greek-salad',
      title: 'Greek Salad',
      basePrice: 12.99,
      quantity: 2,
      selectedAddOns: [{ id: 'feta', name: 'Feta', price: 1 }],
    });
    expect(result.current.cart.items[0]?.totalPrice).toBeCloseTo(27.98);
    expect(result.current.cart.totalItemsCount).toBe(2);
  });

  it('refuses to add to the cart when no dish resolved', async () => {
    const { result } = renderDetails('missing-dish');
    await waitFor(() => expect(result.current.details.status).toBe('not-found'));

    act(() => {
      expect(result.current.details.handleAddToCart()).toBe(false);
    });

    expect(result.current.cart.items).toHaveLength(0);
  });
});
