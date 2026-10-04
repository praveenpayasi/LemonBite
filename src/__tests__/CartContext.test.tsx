import type { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react-native';

import { CartProvider, calculateLineTotal, useCart } from '@/context/CartContext';
import type { CartItem } from '@/types';

const wrapper = ({ children }: { children: ReactNode }) => <CartProvider>{children}</CartProvider>;

const greekSalad: Omit<CartItem, 'id' | 'totalPrice'> = {
  dishId: 'greek-salad',
  title: 'Greek Salad',
  basePrice: 12.99,
  image: 'https://example.test/images/greekSalad.jpg',
  quantity: 1,
  selectedAddOns: [],
};

const bruschetta: Omit<CartItem, 'id' | 'totalPrice'> = {
  dishId: 'bruschetta',
  title: 'Bruschetta',
  basePrice: 7.99,
  image: 'https://example.test/images/bruschetta.jpg',
  quantity: 2,
  selectedAddOns: [{ id: 'feta', name: 'Feta', price: 1 }],
};

function renderCart() {
  return renderHook(() => useCart(), { wrapper });
}

describe('calculateLineTotal', () => {
  it('multiplies the base price plus add-ons by the quantity', () => {
    expect(calculateLineTotal(10, [], 1)).toBeCloseTo(10);
    expect(calculateLineTotal(10, [{ id: 'feta', name: 'Feta', price: 1 }], 3)).toBeCloseTo(33);
    expect(
      calculateLineTotal(
        7.99,
        [
          { id: 'feta', name: 'Feta', price: 1 },
          { id: 'parmesan', name: 'Parmesan', price: 1 },
        ],
        2,
      ),
    ).toBeCloseTo(19.98);
  });
});

describe('CartContext', () => {
  it('starts empty', () => {
    const { result } = renderCart();

    expect(result.current.items).toEqual([]);
    expect(result.current.totalItemsCount).toBe(0);
    expect(result.current.subtotal).toBe(0);
  });

  it('adds an item with a generated id and computed total price', () => {
    const { result } = renderCart();

    act(() => result.current.addToCart(greekSalad));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]?.id).toBe('greek-salad-1');
    expect(result.current.items[0]?.totalPrice).toBeCloseTo(12.99);
    expect(result.current.totalItemsCount).toBe(1);
    expect(result.current.subtotal).toBeCloseTo(12.99);
  });

  it('includes add-ons and quantity in the line total', () => {
    const { result } = renderCart();

    act(() => result.current.addToCart(bruschetta));

    // (7.99 + 1) * 2
    expect(result.current.items[0]?.totalPrice).toBeCloseTo(17.98);
    expect(result.current.totalItemsCount).toBe(2);
    expect(result.current.subtotal).toBeCloseTo(17.98);
  });

  it('aggregates the count and subtotal across several lines', () => {
    const { result } = renderCart();

    act(() => result.current.addToCart(greekSalad));
    act(() => result.current.addToCart(bruschetta));

    expect(result.current.items.map((item) => item.id)).toEqual(['greek-salad-1', 'bruschetta-2']);
    expect(result.current.totalItemsCount).toBe(3);
    expect(result.current.subtotal).toBeCloseTo(30.97);
  });

  it('updates a quantity and recomputes its total and the subtotal', () => {
    const { result } = renderCart();

    act(() => result.current.addToCart(bruschetta));
    act(() => result.current.updateQuantity('bruschetta-1', 4));

    expect(result.current.items[0]?.quantity).toBe(4);
    expect(result.current.items[0]?.totalPrice).toBeCloseTo(35.96);
    expect(result.current.totalItemsCount).toBe(4);
    expect(result.current.subtotal).toBeCloseTo(35.96);
  });

  it('clamps a quantity update to a minimum of 1', () => {
    const { result } = renderCart();

    act(() => result.current.addToCart(greekSalad));
    act(() => result.current.updateQuantity('greek-salad-1', 0));

    expect(result.current.items[0]?.quantity).toBe(1);
    expect(result.current.subtotal).toBeCloseTo(12.99);
  });

  it('ignores a quantity update for an unknown line id', () => {
    const { result } = renderCart();

    act(() => result.current.addToCart(greekSalad));
    act(() => result.current.updateQuantity('does-not-exist', 5));

    expect(result.current.items[0]?.quantity).toBe(1);
    expect(result.current.totalItemsCount).toBe(1);
  });

  it('removes a single line and leaves the rest intact', () => {
    const { result } = renderCart();

    act(() => result.current.addToCart(greekSalad));
    act(() => result.current.addToCart(bruschetta));
    act(() => result.current.removeFromCart('greek-salad-1'));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]?.dishId).toBe('bruschetta');
    expect(result.current.totalItemsCount).toBe(2);
    expect(result.current.subtotal).toBeCloseTo(17.98);
  });

  it('clears every line', () => {
    const { result } = renderCart();

    act(() => result.current.addToCart(greekSalad));
    act(() => result.current.addToCart(bruschetta));
    act(() => result.current.clearCart());

    expect(result.current.items).toEqual([]);
    expect(result.current.totalItemsCount).toBe(0);
    expect(result.current.subtotal).toBe(0);
  });

  it('throws when used outside a CartProvider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useCart())).toThrow(
      'useCart must be used within a CartProvider.',
    );

    consoleError.mockRestore();
  });
});
