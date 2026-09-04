const OBFU_DICTIONARY = {
  "V\x1bE|": "pref",
  "\fA2c": "seed",
  "$PS\x01": "gfx",
  ";\x01\fZ": "mode",
  "An%6": "type",
  "}&\x16Y\x01": "force",
  "\x032\x1A4": "name",
  "7X\x01": "id",
  "\x0bR\x10\x1b\x02": "__CWeapon",
  "\x11!\x0ea\x01": "reloadSystem",
  "\x15S\x17?\x03": "targetType",
  "\x1a)\x13=\x01": "__CBody",
  "\x1dlQK\x03": "moveSystem",
  ")0\x19i\x03": "leftOver",
  ";uXE": "targetSystem",
  ";\x1F\x0FJ": "army",
  "\x05(\x0Bm\x02": "action",
  Vif0: "ymax",
  "hW+a": "xmax",
  "\x17\x06\t\x01": "fac",
  "\x10Gv\x01": "add",
  "\ng\x12;\x01": "space",
  "\nz\nv": "choices",
  "*M\x01": "bg",
  "a]e\x1B\x02": "armies",
  "`1\x1f*\x02": "troopers",
  "OPz\x16\x03": "faction",
  "K)\x16\n\x02": "__UP2",
};

const OBFU_REVERSE_DICTIONARY = Object.fromEntries(
  Object.entries(OBFU_DICTIONARY).map(([key, value]) => [value, key]),
);

export const objectObfuscator = (obj: any) => {
  if (!obj) return obj;

  // If obj is an Enum instance (array with specific properties)
  if (Array.isArray(obj) && obj.constructor.name !== "Array") {
    // Keep the enum structure but obfuscate its contents
    const enumCopy = obj.slice(); // Create a copy of the array
    // Obfuscate any object properties within the enum
    for (let i = 0; i < enumCopy.length; i++) {
      if (typeof enumCopy[i] === "object" && enumCopy[i] !== null) {
        enumCopy[i] = objectObfuscator(enumCopy[i]);
      }
    }
    // Preserve the constructor
    Object.setPrototypeOf(enumCopy, Object.getPrototypeOf(obj));
    return enumCopy;
  }

  // Handle regular objects
  if (typeof obj === "object") {
    const newObj: any = Array.isArray(obj) ? [] : {};

    for (const [k, v] of Object.entries(obj)) {
      // Recursively handle nested objects/arrays
      const newValue = objectObfuscator(v);

      // Check if key should be obfuscated
      const newKey = OBFU_REVERSE_DICTIONARY[k] || k;
      newObj[newKey] = newValue;
    }
    return newObj;
  }

  return obj;
};
