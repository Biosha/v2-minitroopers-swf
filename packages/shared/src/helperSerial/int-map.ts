export class IntMap<T> extends Object {
  [key: number]: T;

  constructor(obj: Record<number, T> = {}) {
    super();
    for (const [k, v] of Object.entries(obj)) {
      this[Number(k)] = v;
    }
  }
}
