import _ from "lodash";

type Prev = [never, 0, 1, 2, 3, 4, 5, ...0[]];

type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}${"" extends P ? "" : "."}${P}`
    : never
  : never;

type Paths<T, D extends number = 10> = [D] extends [never]
  ? never
  : T extends object
  ? {
      [K in keyof T]-?: K extends string | number ? `${K}` | Join<K, Paths<T[K], Prev[D]>> : never;
    }[keyof T]
  : "";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SetNull<T, Keys extends keyof any> = {
  [P in keyof T]: P extends Keys ? null : T[P];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function removeNestedKey(obj: any, keyPath: string[]) {
  let current = obj;
  for (let i = 0; i < keyPath.length - 1; i++) {
    if (current[keyPath[i]] === undefined) return;
    current = current[keyPath[i]];
  }
  current[keyPath[keyPath.length - 1]] = null;
}

export function exclude<T, Key extends Paths<T>>(item: T[], keys: Key | Key[]): SetNull<T, Key>[];
export function exclude<T, Key extends Paths<T>>(item: T, keys: Key | Key[]): SetNull<T, Key>;
export function exclude<T, Key extends Paths<T>>(
  item: T | T[],
  keys: Key | Key[]
): SetNull<T, Key> | SetNull<T, Key>[] {
  if (Array.isArray(item)) {
    return item.map(i => exclude(i, keys) as SetNull<T, Key>);
  }

  const clone = _.cloneDeep(item); // Use deep copy
  const keysArray = Array.isArray(keys) ? keys : [keys];

  keysArray.forEach(keyPath => {
    removeNestedKey(clone, keyPath.split("."));
  });

  return clone as SetNull<T, Key>;
}
