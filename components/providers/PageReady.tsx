"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type PageReadyValue = { ready: boolean; markReady: () => void };

const PageReadyContext = createContext<PageReadyValue>({
  ready: false,
  markReady: () => {},
});

/** `ready` flips once the preloader has finished or was skipped. Hero motion waits for it. */
export function PageReadyProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const markReady = useCallback(() => setReady(true), []);
  const value = useMemo(() => ({ ready, markReady }), [ready, markReady]);
  return <PageReadyContext.Provider value={value}>{children}</PageReadyContext.Provider>;
}

export const usePageReady = () => useContext(PageReadyContext);
