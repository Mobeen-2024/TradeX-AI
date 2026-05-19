import { MarketProvider, MarketTickEvent } from "./provider";

export class BinanceProvider implements MarketProvider {
  async getTicker(symbol: string): Promise<MarketTickEvent> {
    const formattedSymbol = symbol.toUpperCase();
    const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${formattedSymbol}`);
    
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      provider: "binance",
      symbol: formattedSymbol,
      // lastPrice is provided as a string by Binance API
      price: data.lastPrice,
      // volume is provided as a string by Binance API
      volume24h: data.volume,
      // use closeTime for timestamp
      timestamp: new Date(data.closeTime)
    };
  }
}
