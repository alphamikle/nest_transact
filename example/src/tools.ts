export type Void = undefined | null;

export type Maybe<T> = T | Void;

export function isDefined<T>(value: T | undefined | null): value is T {
  if (value === null || value === undefined) {
    return false;
  }
  return true;
}

export function isNotDefined<T>(value: T | undefined | null): value is Void {
  return !isDefined(value);
}