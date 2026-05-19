import { MarketProvider } from "./provider";
import { BinanceProvider } from "./binance";
import { MarketTickRepository } from "../../db/repositories/marketTicks";
import { EventDispatcher, EventType } from "../../events";

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
    
    const dbRecord = await MarketTickRepository.insert(
      tick.provider,
      tick.symbol,
      tick.price,
      tick.volume24h,
      tick.timestamp
    );

    await EventDispatcher.emit(EventType.MARKET_TICK_RECEIVED, { 
      assetId: tick.symbol, 
      price: tick.price, 
      source: tick.provider, 
      timestamp: tick.timestamp 
    });

    return dbRecord;
  }

  static async getLatestTick(symbol?: string) {
    return await MarketTickRepository.getLatest(symbol);
  }
}
