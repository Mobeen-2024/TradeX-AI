import { MemoryRepository, SemanticMemoryLog } from "../db/repositories/memory";
import { getEmbeddingProvider } from "./embeddings";

export class MemoryService {
  static async logMemory(
    marketRegime: string | null,
    aiRationale: string | null,
    userId?: string | null,
    portfolioId?: string | null,
    correlationId?: string,
    agentName?: string,
    metadata?: any,
    strategyId?: string | null
  ): Promise<SemanticMemoryLog> {
    let embedding: number[];
    if (aiRationale) {
      const provider = getEmbeddingProvider();
      embedding = await provider.embedText(aiRationale);
    } else {
      embedding = new Array(768).fill(0);
    }
    return MemoryRepository.create(marketRegime, aiRationale, embedding, userId, portfolioId, correlationId, agentName, metadata, strategyId);
  }

  static async getPastEvaluations(portfolioId: string, assetId?: string, marketRegime?: string, limit: number = 5): Promise<SemanticMemoryLog[]> {
    return MemoryRepository.getEvaluations(portfolioId, assetId, marketRegime, limit);
  }

  static async searchMemory(
    query: string,
    userId?: string,
    portfolioId?: string
  ): Promise<SemanticMemoryLog[]> {
    const provider = getEmbeddingProvider();
    const queryEmbedding = await provider.embedText(query);
    return MemoryRepository.searchSimilarity(queryEmbedding, 10, userId, portfolioId);
  }

  static async getByCorrelation(
    correlationId: string,
    agentName: string
  ): Promise<SemanticMemoryLog | null> {
    return MemoryRepository.getByCorrelation(correlationId, agentName);
  }
}
