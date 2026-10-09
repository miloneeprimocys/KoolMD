import { useEffect, useState } from "react";

/** Returns `value` only after it stopped changing for `delayMilliseconds` (e.g. search input). */
export function useDebouncedValue<TValue>(value: TValue, delayMilliseconds = 400): TValue {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedValue(value), delayMilliseconds);
    return () => clearTimeout(timeoutId);
  }, [value, delayMilliseconds]);

  return debouncedValue;
}
