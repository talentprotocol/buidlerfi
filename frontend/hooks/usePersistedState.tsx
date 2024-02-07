import { useEffect, useState } from "react";

export function usePersistedState<T>(key: string, value: T, type: "session" | "local") {
  const storage = type === "session" ? sessionStorage : localStorage;
  const [state, setState] = useState<T>(() => {
    const storedValue = storage.getItem(key);
    if (storedValue) {
      return JSON.parse(storedValue);
    } else {
      return value;
    }
  });

  useEffect(() => {
    storage.setItem(key, JSON.stringify(state));
  }, [state, key, type, storage]);

  return [state, setState] as const;
}
