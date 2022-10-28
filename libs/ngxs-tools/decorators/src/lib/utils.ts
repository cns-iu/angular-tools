/**
 * Wraps a value in an array if not already an array
 *
 * @param value Value to cast
 * @returns An array
 */
export function castArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

/**
 * Determines whether value is a string, number, or symbol
 *
 * @param value Value to test
 * @returns true if value is a property key, false otherwise
 */
export function isPropertyKey(value: unknown): value is PropertyKey {
  switch (typeof value) {
    case 'string':
    case 'number':
    case 'symbol':
      return true;

    default:
      return false;
  }
}
