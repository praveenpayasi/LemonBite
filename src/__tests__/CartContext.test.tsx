import type { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react-native';

import { CartProvider, calculateLineTotal, isSameCartLine, useCart } from '@/context/CartContext';
import { DELIVERY_FEE, SERVICE_FEE } from '@/constants/cart';
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

  it('removes the line when a quantity update drops to zero', () => {
    const { result } = renderCart();

    act(() => result.current.addToCart(greekSalad));
    act(() => result.current.updateQuantity('greek-salad-1', 0));

    expect(result.current.items).toEqual([]);
    expect(result.current.totalItemsCount).toBe(0);
    expect(result.current.subtotal).toBe(0);
  });

  it('removes the line when a quantity update goes negative', () => {
    const { result } = renderCart();

    act(() => result.current.addToCart(greekSalad));
    act(() => result.current.updateQuantity('greek-salad-1', -3));

    expect(result.current.items).toEqual([]);
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

describe('isSameCartLine', () => {
  it('matches the same dish with no add-ons', () => {
    expect(
      isSameCartLine(
        { dishId: 'greek-salad', selectedAddOns: [] },
        { dishId: 'greek-salad', selectedAddOns: [] },
      ),
    ).toBe(true);
  });

  it('ignores add-on ordering', () => {
    expect(
      isSameCartLine(
        {
          dishId: 'bruschetta',
          selectedAddOns: [
            { id: 'feta', name: 'Feta', price: 1 },
            { id: 'parmesan', name: 'Parmesan', price: 1 },
          ],
        },
        {
          dishId: 'bruschetta',
          selectedAddOns: [
            { id: 'parmesan', name: 'Parmesan', price: 1 },
            { id: 'feta', name: 'Feta', price: 1 },
          ],
        },
      ),
    ).toBe(true);
  });

  it('separates different dishes and different add-on sets', () => {
    expect(
      isSameCartLine(
        { dishId: 'greek-salad', selectedAddOns: [] },
        { dishId: 'bruschetta', selectedAddOns: [] },
      ),
    ).toBe(false);

    expect(
      isSameCartLine(
        { dishId: 'bruschetta', selectedAddOns: [] },
        { dishId: 'bruschetta', selectedAddOns: [{ id: 'feta', name: 'Feta', price: 1 }] },
      ),
    ).toBe(false);
  });
});

describe('CartContext merge-on-add', () => {
  it('merges a repeat add of the same dish with no add-ons', () => {
    const { result } = renderCart();

    act(() => result.current.addToCart(greekSalad));
    act(() => result.current.addToCart(greekSalad));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]?.id).toBe('greek-salad-1');
    expect(result.current.items[0]?.quantity).toBe(2);
    expect(result.current.items[0]?.totalPrice).toBeCloseTo(25.98);
    expect(result.current.totalItemsCount).toBe(2);
  });

  it('merges quantities rather than overwriting them', () => {
    const { result } = renderCart();

    act(() => result.current.addToCart({ ...greekSalad, quantity: 2 }));
    act(() => result.current.addToCart({ ...greekSalad, quantity: 3 }));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]?.quantity).toBe(5);
    expect(result.current.items[0]?.totalPrice).toBeCloseTo(64.95);
  });

  it('merges when the add-ons match regardless of their order', () => {
    const { result } = renderCart();
    const feta = { id: 'feta', name: 'Feta', price: 1 };
    const parmesan = { id: 'parmesan', name: 'Parmesan', price: 1 };

    act(() =>
      result.current.addToCart({ ...greekSalad, quantity: 1, selectedAddOns: [feta, parmesan] }),
    );
    act(() =>
      result.current.addToCart({ ...greekSalad, quantity: 1, selectedAddOns: [parmesan, feta] }),
    );

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]?.quantity).toBe(2);
    // (12.99 + 1 + 1) * 2
    expect(result.current.items[0]?.totalPrice).toBeCloseTo(29.98);
  });

  it('keeps the same dish on separate lines when the add-ons differ', () => {
    const { result } = renderCart();

    act(() => result.current.addToCart(greekSalad));
    act(() =>
      result.current.addToCart({
        ...greekSalad,
        selectedAddOns: [{ id: 'feta', name: 'Feta', price: 1 }],
      }),
    );

    expect(result.current.items).toHaveLength(2);
    expect(result.current.items.map((item) => item.id)).toEqual([
      'greek-salad-1',
      'greek-salad-2',
    ]);
    expect(result.current.totalItemsCount).toBe(2);
    expect(result.current.subtotal).toBeCloseTo(26.98);
  });

  it('keeps different dishes on separate lines', () => {
    const { result } = renderCart();

    act(() => result.current.addToCart(greekSalad));
    act(() => result.current.addToCart(bruschetta));
    act(() => result.current.addToCart(greekSalad));

    expect(result.current.items).toHaveLength(2);
    expect(result.current.items[0]?.quantity).toBe(2);
    expect(result.current.items[1]?.quantity).toBe(2);
  });
});

describe('CartContext fees and totals', () => {
  it('reports zero total while the cart is empty', () => {
    const { result } = renderCart();

    expect(result.current.subtotal).toBe(0);
    expect(result.current.total).toBe(0);
    expect(result.current.deliveryFee).toBe(DELIVERY_FEE);
    expect(result.current.serviceFee).toBe(SERVICE_FEE);
  });

  it('adds the delivery and service fees to a non-empty order', () => {
    const { result } = renderCart();

    act(() => result.current.addToCart(greekSalad));

    expect(result.current.subtotal).toBeCloseTo(12.99);
    // 12.99 + 2.00 + 1.00
    expect(result.current.total).toBeCloseTo(15.99);
  });

  it('recomputes the total across several lines and quantity changes', () => {
    const { result } = renderCart();

    act(() => result.current.addToCart(greekSalad));
    act(() => result.current.addToCart(bruschetta));

    expect(result.current.subtotal).toBeCloseTo(30.97);
    expect(result.current.total).toBeCloseTo(33.97);

    act(() => result.current.updateQuantity('greek-salad-1', 3));

    expect(result.current.subtotal).toBeCloseTo(56.95);
    expect(result.current.total).toBeCloseTo(59.95);
  });

  it('returns to a zero total once the last line is removed', () => {
    const { result } = renderCart();

    act(() => result.current.addToCart(greekSalad));
    act(() => result.current.removeFromCart('greek-salad-1'));

    expect(result.current.total).toBe(0);
  });
});

describe('CartContext cutlery preference', () => {
  it('defaults to requesting cutlery', () => {
    const { result } = renderCart();

    expect(result.current.cutleryRequested).toBe(true);
  });

  it('toggles the preference off and on', () => {
    const { result } = renderCart();

    act(() => result.current.setCutleryRequested(false));
    expect(result.current.cutleryRequested).toBe(false);

    act(() => result.current.setCutleryRequested(true));
    expect(result.current.cutleryRequested).toBe(true);
  });

  it('leaves the cutlery preference untouched when the cart is cleared', () => {
    const { result } = renderCart();

    act(() => result.current.addToCart(greekSalad));
    act(() => result.current.setCutleryRequested(false));
    act(() => result.current.clearCart());

    expect(result.current.items).toEqual([]);
    expect(result.current.cutleryRequested).toBe(false);
  });
});
