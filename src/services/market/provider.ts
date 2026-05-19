export interface MarketTickEvent {
  provider: string;
  symbol: string;
  price: string;
  volume24h: string;
  timestamp: Date;
}

export interface MarketProvider {
  getTicker(symbol: string): Promise<MarketTickEvent>;
}
