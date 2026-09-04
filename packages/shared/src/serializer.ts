import { BaseCode } from "./helperSerial/base-code";
import { Bytes } from "./helperSerial/bytes";
import { Class } from "./helperSerial/class";
import { Enum } from "./helperSerial/enum";
import { IntMap } from "./helperSerial/int-map";
import { List } from "./helperSerial/list";
import { ObjectMap } from "./helperSerial/object-map";
import { StringMap } from "./helperSerial/string-map";

// Type pour les valeurs pouvant être sérialisées
type SerializableValue =
  | string
  | number
  | boolean
  | null
  | Date
  | Bytes
  | Enum
  | Class
  | Array<any>
  | ObjectMap<any, any>
  | IntMap<any>
  | StringMap<any>
  | List<any>
  | Error;

// Type pour les types supportés retournés par la méthode typeof
type SupportedType =
  | "Array"
  | "Boolean"
  | "Bytes"
  | "Date"
  | "Null"
  | "Number"
  | "Object"
  | "String"
  | "Enum"
  | "Error";

export class Serializer {
  private StringCache: string[];
  private ObjectCache: any[];
  private USE_CACHE: boolean;
  private USE_ENUM_INDEX: boolean;

  constructor(useCache = false, useEnumIndex = true) {
    this.StringCache = [];
    this.ObjectCache = [];
    this.USE_CACHE = useCache;
    this.USE_ENUM_INDEX = useEnumIndex;
  }

  typeof(v: SerializableValue): SupportedType {
    switch (true) {
      case v instanceof Bytes:
        return "Bytes";
      case v instanceof Enum:
        return "Enum";
      case v instanceof Class:
        return "Object";
      default: {
        const type = Object.prototype.toString.call(v);
        return type.replace(/^.*? (.*?)\]$/, "$1") as SupportedType;
      }
    }
  }

  static serialize(data: SerializableValue): string {
    const _s = new Serializer();
    return _s.run(data);
  }

  run(data: SerializableValue): string {
    const type = this.typeof(data);
    switch (type) {
      case "Array":
        return this.serializeObject(data as Array<any>);
      case "Boolean":
        return (data as boolean) ? "t" : "f";
      case "Bytes":
        return this.serializeBytes(data as Bytes);
      case "Date":
        return this.serializeDate(data as Date);
      case "Null":
        return "n";
      case "Number":
        return this.serializeNumber(data as number);
      case "Object":
        return this.serializeObject(data as object);
      case "String":
        return this.serializeString(data as string);
      case "Enum":
        return this.serializeEnum(data as Enum);
      case "Error":
        return `x${this.run((data as Error).message)}`;
      default:
        throw new Error(`Unknown type ${type}`);
    }
  }

  private cache(type: "String" | "Object", v: any): string | false {
    const buffer = type === "String" ? "R" : "r";
    if (this.USE_CACHE || type === "String") {
      const i = this[`${type}Cache`].indexOf(v);
      if (i > -1) {
        return buffer + i;
      } else {
        this[`${type}Cache`].push(v);
      }
    }
    return false;
  }

  private serializeString(s: string): string {
    const cached = this.cache("String", s);
    if (cached !== false) {
      return cached;
    }
    s = encodeURIComponent(s);
    return `y${s.length}:${s}`;
  }

  private serializeDate(d: Date): string {
    const Y = `0${d.getFullYear()}`;
    const M = `0${d.getMonth() + 1}`;
    const D = `0${d.getDate()}`;
    const H = `0${d.getHours()}`;
    const m = `0${d.getMinutes()}`;
    const s = `0${d.getSeconds()}`;

    return `v${Y.slice(-4)}-${M.slice(-2)}-${D.slice(-2)} ${H.slice(-2)}:${m.slice(-2)}:${s.slice(-2)}`;
  }

  private serializeNumber(n: number): string {
    if (Number.isNaN(n)) {
      return "k";
    }
    if (!Number.isFinite(n)) {
      return Math.sign(n) > 0 ? "p" : "m";
    }
    if (!Number.isSafeInteger(n)) {
      if (Number.isInteger(n)) {
        return `d${n.toExponential()}`;
      }
      return `d${n}`;
    }
    return n === 0 ? "z" : `i${n}`;
  }

  private serializeObject(o: any): string {
    const cached = this.cache("Object", o);
    if (cached !== false) {
      return cached;
    }

    let buffer = o instanceof Class ? this.run(o.constructor.name) : "";
    let consecutive_null = 0;

    for (const [k, v] of Object.entries(o)) {
      if (o instanceof Class && k === "__name__") {
        continue;
      }

      if (o instanceof ObjectMap) {
        // ObjectMap handling remains the same
      } else if (o instanceof Array) {
        const t = this.typeof(v as any);
        if (t === "Null") {
          consecutive_null++;
          if (!(o instanceof List) && o.length - 1 > Number(k)) {
            continue;
          }
        }
        if (consecutive_null > 0) {
          buffer += consecutive_null > 1 ? `u${consecutive_null}` : "n";
          consecutive_null = 0;
        }
        if (t === "Null") {
          continue;
        }
      } else {
        buffer += o instanceof IntMap ? `:${k}` : this.run(k);
      }
      buffer += this.run(v as any);
    }

    switch (true) {
      case o instanceof Class:
        return `c${buffer}g`;
      case o instanceof IntMap:
        return `q${buffer}h`;
      case o instanceof ObjectMap:
        return `M${buffer}h`;
      case o instanceof StringMap:
        return `b${buffer}h`;
      case o instanceof List:
        return `l${buffer}h`;
      case o instanceof Array:
        return `a${buffer}h`;
      default:
        return `o${buffer}g`;
    }
  }

  private serializeEnum(e: Enum): string {
    const cached = this.cache("Object", e);
    if (cached !== false) {
      return cached;
    }

    let buffer = this.USE_ENUM_INDEX ? "j" : "w";
    let i = 2;

    buffer += this.run(e.constructor.name);
    buffer += this.USE_ENUM_INDEX ? `:${e[1]}` : this.run(e[0]);
    buffer += `:${e.length - 2}`;

    while (i < e.length) {
      buffer += this.run(e[i++]);
    }
    return buffer;
  }

  private serializeBytes(b: Bytes): string {
    const b64 = new BaseCode(
      Bytes.ofString(
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789%:",
      ),
    );
    const r = b64.encodeBytes(b);
    return `s${r.length}:${r}`;
  }
}
