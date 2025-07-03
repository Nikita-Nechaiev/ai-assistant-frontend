import { useRef, useCallback, useEffect } from 'react';

export default function useDebouncedCallback<T extends (...args: any[]) => void>(fn: T, delay = 500) {
  const timer = useRef<NodeJS.Timeout | null>(null);

  const callback = useCallback(
    (...args: Parameters<T>) => {
      if (timer.current) clearTimeout(timer.current);

      timer.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay],
  );

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  return callback;
}
