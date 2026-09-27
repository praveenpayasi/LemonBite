import { act, renderHook } from '@testing-library/react-native';

import { useDebouncedValue } from '@/hooks/useDebouncedValue';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('a', 500));

    expect(result.current).toBe('a');
  });

  it('does not update before the delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 500),
      { initialProps: { value: 'a' } },
    );

    rerender({ value: 'ab' });
    act(() => {
      jest.advanceTimersByTime(499);
    });

    expect(result.current).toBe('a');
  });

  it('updates once the full delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 500),
      { initialProps: { value: 'a' } },
    );

    rerender({ value: 'ab' });
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe('ab');
  });

  it('resets the timer on rapid successive changes (only the last value wins)', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 500),
      { initialProps: { value: 'a' } },
    );

    rerender({ value: 'ab' });
    act(() => {
      jest.advanceTimersByTime(300);
    });
    rerender({ value: 'abc' });
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // 600ms total elapsed but only 300ms since the last change: still stale.
    expect(result.current).toBe('a');

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current).toBe('abc');
  });

  it('respects a custom delay', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 1000),
      { initialProps: { value: 'a' } },
    );

    rerender({ value: 'ab' });
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe('a');

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe('ab');
  });
});
