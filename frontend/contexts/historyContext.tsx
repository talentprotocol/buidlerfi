"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { MutableRefObject, ReactNode, createContext, useContext, useEffect, useRef } from "react";

const historyContext = createContext<{
  history: MutableRefObject<string[]>;
  ignoreNextNavigation: MutableRefObject<boolean>;
  updateHistory: (params: { push?: string; pop?: boolean }) => string | undefined;
}>({
  history: { current: [] } as MutableRefObject<string[]>,
  ignoreNextNavigation: { current: false } as MutableRefObject<boolean>,
  updateHistory: () => undefined
});

export const HistoryContextProvider = ({ children }: { children: ReactNode }) => {
  const history = useRef<string[]>([]);
  const ignoreNextNavigation = useRef<boolean>(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateHistory = ({ push, pop }: { push?: string; pop?: boolean }) => {
    let poppedItem: string | undefined = undefined;
    if (pop) {
      poppedItem = history.current.pop();
    }
    if (push) history.current.push(push);

    //Remove duplicate adjacent items
    history.current = history.current.reduce((prev, curr) => {
      if (prev.length === 0 || prev[prev.length - 1] !== curr) prev.push(curr);
      return prev;
    }, [] as string[]);

    return poppedItem;
  };

  useEffect(() => {
    const url = Number(searchParams.size) > 0 ? `${pathname}?${searchParams}` : pathname;
    if (!ignoreNextNavigation.current) updateHistory({ push: url });
    else ignoreNextNavigation.current = false;
  }, [history, pathname, searchParams]);

  return (
    <historyContext.Provider value={{ ignoreNextNavigation: ignoreNextNavigation, history: history, updateHistory }}>
      {children}
    </historyContext.Provider>
  );
};

export const useHistoryContext = () => {
  return useContext(historyContext);
};
