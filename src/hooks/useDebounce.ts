/**
 * Returns a debounced copy of `value` that only updates after `delay` ms of inactivity.
 * Prevents expensive effects (API calls, heavy filters) from firing on every keystroke.
 */

import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
