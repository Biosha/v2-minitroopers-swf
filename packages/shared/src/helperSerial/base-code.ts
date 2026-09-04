import { Bytes } from "./bytes";

export class BaseCode {
  private base: Bytes;
  private nbits: number;
  private tbl: number[] | null = null;

  constructor(base: Bytes) {
    const len = base.length;
    let nbits = 1;
    while (len > 1 << nbits) {
      ++nbits;
    }
    if (nbits > 8 || len !== 1 << nbits) {
      throw new Error("BaseCode: base length must be a power of two.");
    }
    this.base = base;
    this.nbits = nbits;
  }

  static encode(s: string, base: string): string {
    const b = new BaseCode(Bytes.ofString(base));
    return b.encodeString(s);
  }

  static decode(s: string, base: string): string {
    const b = new BaseCode(Bytes.ofString(base));
    return b.decodeString(s);
  }

  private initTable(): void {
    const tbl: number[] = new Array(256).fill(-1);
    for (let i = 0; i < this.base.length; i++) {
      tbl[this.base[i]] = i;
    }
    this.tbl = tbl;
  }

  encodeBytes(b: Bytes): Bytes {
    const nbits = this.nbits;
    const base = this.base;
    const size = ((b.length * 8) / nbits) | 0;
    const out = new Bytes(size + ((b.length * 8) % nbits === 0 ? 0 : 1));
    let buf = 0;
    let curbits = 0;
    const mask = (1 << nbits) - 1;
    let pin = 0;
    let pout = 0;

    while (pout < size) {
      while (curbits < nbits) {
        curbits += 8;
        buf <<= 8;
        buf |= b[pin++];
      }
      curbits -= nbits;
      out[pout++] = base[(buf >> curbits) & mask];
    }
    if (curbits > 0) {
      out[pout++] = base[(buf << (nbits - curbits)) & mask];
    }
    return out;
  }

  decodeBytes(b: Bytes): Bytes {
    const nbits = this.nbits;
    if (this.tbl === null) {
      this.initTable();
    }
    const tbl = this.tbl!;
    const size = (b.length * nbits) >> 3;
    const out = new Bytes(size);
    let buf = 0;
    let curbits = 0;
    let pin = 0;
    let pout = 0;

    while (pout < size) {
      while (curbits < 8) {
        curbits += nbits;
        buf <<= nbits;
        const i = tbl[b[pin++]];
        if (i === -1) {
          throw new Error("BaseCode: invalid encoded char");
        }
        buf |= i;
      }
      curbits -= 8;
      out[pout++] = (buf >> curbits) & 255;
    }
    return out;
  }

  encodeString(s: string): string {
    return this.encodeBytes(Bytes.ofString(s)).toString();
  }

  decodeString(s: string): string {
    return this.decodeBytes(Bytes.ofString(s)).toString();
  }
}
