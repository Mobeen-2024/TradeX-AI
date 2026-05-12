import React, { createContext, useContext, useState, ReactNode } from "react";

export type MarketRegime = "bull" | "bear" | "volatile" | "neutral";

interface MarketRegimeContextType {
  regime: MarketRegime;
  setRegime: (regime: MarketRegime) => void;
}

const MarketRegimeContext = createContext<MarketRegimeContextType | undefined>(
  undefined,
);

export function MarketRegimeProvider({ children }: { children: ReactNode }) {
  const [regime, setRegime] = useState<MarketRegime>("bull"); // default

  return (
    <MarketRegimeContext.Provider value={{ regime, setRegime }}>
      {children}
    </MarketRegimeContext.Provider>
  );
}

export function useMarketRegime() {
  const context = useContext(MarketRegimeContext);
  if (context === undefined) {
    throw new Error(
      "useMarketRegime must be used within a MarketRegimeProvider",
    );
  }
  return context;
}
