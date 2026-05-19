import { NewsArticle, NewsProvider } from "./provider";

export class DummyNewsProvider implements NewsProvider {
  async getTopHeadlines(assetIds: string[]): Promise<NewsArticle[]> {
    if (assetIds.length === 0) return [];
    
    // Abstracted market-relevant headlines
    return assetIds.map(asset => ({
      headline: `${asset} shows significant underlying market movement amid global sector shifts, analysts remain observant.`,
      source: "Market Intelligence",
      timestamp: new Date(),
      assetIds: [asset]
    }));
  }
}
