import { MarketProvider } from "./provider";
import { BinanceProvider } from "./binance";
import { MarketTickRepository } from "../../db/repositories/marketTicks";

export const getMarketProvider = (providerName: string = "binance"): MarketProvider => {
  if (providerName.toLowerCase() === "binance") {
    return new BinanceProvider();
  }
  throw new Error(`Provider ${providerName} not supported.`);
};

export class MarketService {
  static async fetchAndIngestTicker(symbol: string, providerName: string = "binance") {
    const provider = getMarketProvider(providerName);
    const tick = await provider.getTicker(symbol);
    
    return await MarketTickRepository.insert(
      tick.provider,
      tick.symbol,
      tick.price,
      tick.volume24h,
      tick.timestamp
    );
  }

  static async getLatestTick(symbol?: string) {
    return await MarketTickRepository.getLatest(symbol);
  }
}
