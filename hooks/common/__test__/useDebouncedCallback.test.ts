import { renderHook, act } from '@testing-library/react';

import useDebouncedCallback from '../useDebouncedCallback';

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('calls the original function after the specified delay', () => {
    const spy = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(spy, 300));

    act(() => {
      result.current('foo', 'bar');
    });

    expect(spy).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('foo', 'bar');
  });

  it('resets the timer when invoked again before the delay', () => {
    const spy = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(spy, 200));

    act(() => {
      result.current('first');
      jest.advanceTimersByTime(150);
      result.current('second');
      jest.advanceTimersByTime(199);
    });

    expect(spy).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('second');
  });

  it('clears the timeout when the component using the hook unmounts', () => {
    const clearSpy = jest.spyOn(global, 'clearTimeout');
    const { result, unmount } = renderHook(() => useDebouncedCallback(jest.fn(), 100));

    act(() => {
      result.current();
    });

    unmount();
    expect(clearSpy).toHaveBeenCalled();
  });
});
