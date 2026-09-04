export class Class {
  static resolve(): void {
    if (typeof window !== "undefined") {
      const win = window;
      if (!(win as any).__class__) {
        (win as any).__class__ = {};
      }
      (win as any).__class__[this.name] = this;
    } else {
      const glob = globalThis;
      if (typeof (glob as any).__class__ === "undefined") {
        (glob as any).__class__ = {};
      }
      (glob as any).__class__[this.name] = this;
    }
  }
}
