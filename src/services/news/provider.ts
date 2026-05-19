export interface NewsArticle {
  headline: string;
  source: string;
  timestamp: Date;
  assetIds?: string[];
}

export interface NewsProvider {
  getTopHeadlines(assetIds: string[]): Promise<NewsArticle[]>;
}
