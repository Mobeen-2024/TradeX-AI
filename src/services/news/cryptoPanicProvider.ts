import { NewsArticle, NewsProvider } from "./provider";

export class CryptoPanicProvider implements NewsProvider {
  private apiKey: string;
  private baseUrl = "https://cryptopanic.com/api/v1/posts/";

  constructor() {
    this.apiKey = process.env.CRYPTOPANIC_API_KEY || "";
  }

  async getTopHeadlines(assetIds: string[]): Promise<NewsArticle[]> {
    if (!this.apiKey) {
      console.warn("[CryptoPanicProvider] No API key, falling back to generic headlines");
      return assetIds.map(asset => ({
        headline: `${asset} market showing activity amid broader crypto sector movements.`,
        source: "Market Intelligence",
        timestamp: new Date(),
        assetIds: [asset]
      }));
    }

    const currencies = assetIds.join(",");
    const url = `${this.baseUrl}?auth_token=${this.apiKey}&currencies=${currencies}&public=true&kind=news&filter=hot`;

    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw new Error(`CryptoPanic HTTP ${response.status}`);
      const data = await response.json();

      return (data.results || []).slice(0, 10).map((item: any) => ({
        headline: item.title,
        source: item.source?.title || "CryptoPanic",
        timestamp: new Date(item.published_at),
        assetIds: (item.currencies || []).map((c: any) => c.code),
        sentiment: item.votes ? (item.votes.positive > item.votes.negative ? "POSITIVE" : "NEGATIVE") : "NEUTRAL"
      }));
    } catch (err) {
      console.error("[CryptoPanicProvider] Fetch failed:", err);
      return assetIds.map(asset => ({
        headline: `${asset} market update — data temporarily unavailable.`,
        source: "Fallback",
        timestamp: new Date(),
        assetIds: [asset]
      }));
    }
  }
}
