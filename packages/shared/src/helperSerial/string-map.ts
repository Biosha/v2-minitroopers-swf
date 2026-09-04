export class StringMap<T> {
  [key: string]: T;

  constructor(obj: Record<string, T> = {}) {
    for (const [k, v] of Object.entries(obj)) {
      this[k] = v;
    }
  }
}
