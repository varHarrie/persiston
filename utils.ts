import { PlainObject } from "./types.ts";

export async function isFileExisted(filePath: string) {
  try {
    const info = await Deno.stat(filePath);
    return info.isFile;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return false;
    } else {
      throw error;
    }
  }
}

export function deepGet(
  obj: PlainObject,
  path: number | string | string[]
): unknown {
  if (!obj || typeof obj !== "object") return undefined;

  const [first, ...parts] = Array.isArray(path)
    ? path
    : path.toString().split(".");

  if (!obj || !first) return undefined;
  if (!parts.length) return obj[first];

  return deepGet(obj[first] as PlainObject, parts);
}

export function match<T extends PlainObject>(
  obj: T,
  conditions: [string, unknown][]
) {
  for (const [key, value] of conditions) {
    if (deepGet(obj, key) !== value) return false;
  }

  return true;
}

export function computeKeys<T>(obj: T, keys?: string[]) {
  const allKeys = Object.keys(obj);
  if (!keys?.length) return allKeys;

  const excluded: Record<string, boolean> = {};

  const included = keys.filter((key) => {
    const minus = key.startsWith("-");
    const realKey = minus ? key.slice(1) : key;
    if (!realKey) return false;

    if (minus) excluded[realKey] = true;
    return !minus;
  });

  return included.length ? included : allKeys.filter((key) => !excluded[key]);
}

function isObject(obj: unknown): obj is PlainObject {
  return !!obj && typeof obj === "object";
}

export function deepCopy<T>(obj: T, fields?: string[]): T {
  if (
    typeof obj === "boolean" ||
    typeof obj === "number" ||
    typeof obj === "string" ||
    obj === null
  ) {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj) as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((o) => deepCopy(o)) as unknown as T;
  }

  if (isObject(obj)) {
    const keys = computeKeys(obj, fields);
    const result: PlainObject = {};

    keys.forEach((key) => {
      result[key] = deepCopy(obj[key]);
    });

    return result as unknown as T;
  }

  return undefined as unknown as T;
}
