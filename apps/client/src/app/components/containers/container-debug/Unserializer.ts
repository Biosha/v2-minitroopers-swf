/* global Bytes, BaseCode, StringMap, IntMap, List, ObjectMap */
// @ts-nocheck
export default class Unserializer {
  constructor(
    data,
    { DEBUG_MODE = true, ENUM_RESOLVER = {}, CLASS_RESOLVER = {} },
  ) {
    this.i = 0;
    this.buffer = data;
    this.length = data.length;
    this.StringCache = [];
    this.ObjectCache = [];
    this.DEBUG_MODE = DEBUG_MODE;
    this.ENUM_RESOLVER = ENUM_RESOLVER;
    this.CLASS_RESOLVER = CLASS_RESOLVER;
  }

  static unserialize(data) {
    const U = new Unserializer(data, {
      ENUM_RESOLVER: window?.__enum__,
      CLASS_RESOLVER: window?.__class__,
    });
    return U.run();
  }

  run() {
    const type = this.buffer[this.i++];

    switch (type) {
      case 'a':
        return this.readArrayScheme('Array', 'h');
      case 'b':
        const smo = this.readObjectScheme('StringMap', 'h');
        return new StringMap(smo);
      case 'c':
        this.i++;
        const cname = this.readStringScheme('String'),
          values = this.readObjectScheme('Class', 'g');
        return this.resolveClass(cname, values);
      case 'd':
        return this.readNumberScheme('Float');
      // case 'e': RESERVED for Float representation
      case 'f':
        return false;
      // case 'g': RESERVED for Object / Class representation
      // case 'h': RESERVED for Array / List / ... representation
      case 'i':
        return this.readNumberScheme('Integer');
      case 'j':
        return this.readEnum('Index');
      case 'k':
        return NaN;
      case 'l':
        const al = this.readArrayScheme('List', 'h');
        return new List(...al);
      case 'm':
        return Number.NEGATIVE_INFINITY;
      case 'n':
        return null;
      case 'o':
        return this.readObjectScheme('Object', 'g');
      case 'p':
        return Number.POSITIVE_INFINITY;
      case 'q':
        const imo = this.readObjectScheme('IntMap', 'h');
        return new IntMap(imo);
      case 'r':
        return this.readCache(this.ObjectCache);
      case 's':
        const bX = new BaseCode(
            Bytes.ofString(
              'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789%:',
            ),
          ),
          b64 = this.readStringScheme('Bytes');
        return bX.decodeBytes(Bytes.ofString(b64));
      case 't':
        return true;
      case 'u':
        return new Array(this.readNumberScheme('Integer')).fill(null);
      case 'v':
        return new Date(this.buffer.slice(this.i, (this.i += 19)));
      case 'w':
        return this.readEnum('Name');
      case 'x':
        const e = this.run();
        if (this.DEBUG_MODE) {
          return new Error(e);
        } else {
          throw new Error(e);
        }
      case 'y':
        return this.readStringScheme('String');
      case 'z':
        return 0;
      case 'C':
        return; // Custom
      case 'M':
        const oma = this.readArrayScheme('ObjectMap', 'h');
        return new ObjectMap(...oma);
      case 'R':
        return this.readCache(this.StringCache);
      default:
        const p = this.i - 1;

        throw new Error(
          `Invalid char "${this.buffer[p]}" (${this.buffer.charCodeAt(p)}) at position ${p}`,
        );
    }
  }

  readCache(cache) {
    const index = this.readNumberScheme('Integer');
    if (index < 0 || index > cache.length) {
      throw 'Invalid string reference';
    }
    return cache[index];
  }

  // .<SerializedValue>*.
  readArrayScheme(type, end) {
    const a = [];
    this.ObjectCache.push(a);
    while (this.buffer[this.i] !== end) {
      if (type == 'Array' && this.buffer[this.i] == 'u') {
        a.push(...this.run());
      } else {
        a.push(this.run());
      }
    }
    this.i++;
    return a;
  }

  // [-0-9+,./eE]+
  readNumberScheme(type) {
    const start = this.i,
      charset = ['-', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    if (type == 'Float') {
      charset.push('+', ',', '.', '/', 'e', 'E');
    }
    while (true) {
      if (charset.indexOf(this.buffer[this.i]) < 0) {
        break;
      }
      this.i++;
    }
    if (type == 'Float') {
      return parseFloat(this.buffer.slice(start, this.i));
    }
    return parseInt(this.buffer.slice(start, this.i));
  }

  // .(<SerializedKey><SerializedValue>)*.
  readObjectScheme(type, end) {
    const o = {};
    this.ObjectCache.push(o);
    while (this.buffer[this.i] !== end) {
      const k =
        type != 'IntMap' ? this.run() : (this.i++, this.readNumberScheme());
      if (['number', 'string'].indexOf(typeof k) < 0) {
        throw 'Invalid object key ' + k;
      }
      o[k] = this.run();
      if (this.i > this.length) {
        throw 'Invalid object';
      }
    }
    this.i++;
    return o;
  }

  // .([0-9]+):.{$1}
  readStringScheme(type) {
    const length = this.readNumberScheme('Integer');
    if (this.buffer[this.i++] != ':') {
      throw 'Invalide string scheme at ' + (this.i - 1);
    }
    if (this.i + length > this.length) {
      throw 'Invalid string length';
    }
    let str = this.buffer.slice(this.i, (this.i += length));
    try {
      str = decodeURIComponent(str.split('+').join(' '));
    } catch (e) {
      if (!this.DEBUG_MODE) {
        throw e;
      }
    }
    if (type == 'String') {
      this.StringCache.push(str);
    }
    return str;
  }

  readEnum(type) {
    let index,
      e,
      debug = false,
      ename = this.run();

    if (!this.ENUM_RESOLVER.hasOwnProperty(ename))
      x: {
        if (this.DEBUG_MODE) {
          e = {};
          debug = true;
          break x;
        }
        throw 'Enum ' + ename + ' not found in resolver.';
      }
    else {
      e = this.ENUM_RESOLVER[ename];
    }
    if (type == 'Index') {
      this.i++;
      index = this.readNumberScheme('Integer');
      if (!debug) {
        index = e.__construct__[index];
      }
    } else {
      index = this.run();
    }

    if (!e.hasOwnProperty(index))
      x: {
        if (this.DEBUG_MODE) {
          debug = true;
          break x;
        }
        throw 'Enum ' + ename + '@' + index + ' not found in resolver.';
      }
    this.i++;
    const al = this.readNumberScheme('Integer'),
      a = [];
    for (let i = 0; i < al; i++) {
      a.push(this.run());
    }
    if (!debug) {
      if (al > 0) {
        try {
          e = e[index](...a);
        } catch (e) {
          if (this.DEBUG_MODE) {
            e = ['DEBUG_VALUE', ename, index, ...a];
          } else {
            throw new Error(
              'Bad enumeration construction ' +
                ename +
                '@' +
                index +
                ' a function was expected',
            );
          }
        }
      } else {
        e = e[index];
      }
    } else {
      e = ['DEBUG_VALUE', ename, index, ...a];
    }
    this.ObjectCache.push(e);
    return e;
  }

  resolveClass(name, values) {
    if (!this.CLASS_RESOLVER.hasOwnProperty(name)) {
      if (this.DEBUG_MODE) {
        return ['DEBUG_VALUE', name, values];
      }
      throw 'Class ' + name + ' not found in resolver.';
    }
    const c = new this.CLASS_RESOLVER[name]();
    return Object.assign(c, values);
  }
}
