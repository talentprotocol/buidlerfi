import { ReactNode, RefObject, createContext, useContext, useRef } from "react";

interface LayoutContextType {
  rootContainerRef: RefObject<HTMLDivElement>;
}
const layoutContext = createContext<LayoutContextType>({
  rootContainerRef: { current: null }
});

export const LayoutContextProvider = ({ children }: { children: ReactNode }) => {
  const rootContainerRef = useRef<HTMLDivElement>(null);

  return <layoutContext.Provider value={{ rootContainerRef }}>{children}</layoutContext.Provider>;
};

export const useLayoutContext = () => useContext(layoutContext);
