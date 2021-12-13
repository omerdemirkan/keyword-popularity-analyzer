export function localStorageCache<T extends Function>(
  fn: T,
  name: string,
  invalidateAfterMs: number
): T {
  // @ts-ignore
  return async function (...args) {
    const key = name + args.join("-"); // TODO accomidate object arguments to avoid [Object, Object] issue
    const storedString = localStorage.getItem(key);
    const cache = storedString && JSON.parse(storedString);
    const nowMs = Date.now();
    if (cache && nowMs - cache.timestamp < invalidateAfterMs)
      return cache.value;
    const result = await fn(...args);
    localStorage.setItem(
      key,
      JSON.stringify({ value: result, timestamp: nowMs })
    );
    return result;
  };
}
