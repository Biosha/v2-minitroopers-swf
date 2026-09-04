export class Bytes extends Uint8Array {
  static alloc(): Bytes {
    return new Bytes();
  }

  static ofString(s: string): Bytes {
    const a: number[] = [];
    let i = 0;
    while (i < s.length) {
      let c = s.charCodeAt(i++);
      if (55296 <= c && c <= 56319) {
        c = ((c - 55232) << 10) | (s.charCodeAt(i++) & 1023);
      }
      if (c <= 127) {
        a.push(c);
      } else if (c <= 2047) {
        a.push(192 | (c >> 6));
        a.push(128 | (c & 63));
      } else if (c <= 65535) {
        a.push(224 | (c >> 12));
        a.push(128 | ((c >> 6) & 63));
        a.push(128 | (c & 63));
      } else {
        a.push(240 | (c >> 18));
        a.push(128 | ((c >> 12) & 63));
        a.push(128 | ((c >> 6) & 63));
        a.push(128 | (c & 63));
      }
    }
    return new Bytes(a);
  }

  static fromArray(array: number[]): Bytes {
    if (!Array.isArray(array)) {
      throw new TypeError("Input must be an array of numbers");
    }
    return new Bytes(array);
  }

  getString(start: number, length: number): string {
    if (start < 0 || length < 0 || start + length > this.length) {
      throw new Error("Outside bounds");
    }
    let buffer = "";
    let i = start;
    const end = start + length;

    while (i < end) {
      let code: number;
      const c1 = this[i++];

      if (c1 < 128) {
        if (c1 === 0) break;
        code = c1;
      } else if (c1 < 224) {
        const c2 = this[i++];
        code = ((c1 & 63) << 6) | (c2 & 127);
      } else if (c1 < 240) {
        const c2 = this[i++];
        const c3 = this[i++];
        code = ((c1 & 31) << 12) | ((c2 & 127) << 6) | (c3 & 127);
      } else {
        const c2 = this[i++];
        const c3 = this[i++];
        const c4 = this[i++];
        code =
          ((c1 & 15) << 18) |
          ((c2 & 127) << 12) |
          ((c3 & 127) << 6) |
          (c4 & 127);
      }
      buffer += String.fromCodePoint(code);
    }
    return buffer;
  }

  override toString(): string {
    return this.getString(0, this.length);
  }
}
