import { MemoryRepository, SemanticMemoryLog } from "../db/repositories/memory";

export class MemoryService {
  static async logMemory(
    marketRegime: string | null,
    aiRationale: string | null,
    userId?: string | null,
    portfolioId?: string | null
  ): Promise<SemanticMemoryLog> {
    // TODO: Integrate proper Gemini API calls to generate embeddings based on the rationale.
    // For now, per requirements: no Gemini integration yet, backend only.
    // We generate a dummy zero vector of dimension 1536 (typical OpenAI/Gemini embedding size).
    const dummyEmbedding = new Array(1536).fill(0);
    return MemoryRepository.create(marketRegime, aiRationale, dummyEmbedding, userId, portfolioId);
  }

  static async searchMemory(
    query: string,
    userId?: string,
    portfolioId?: string
  ): Promise<SemanticMemoryLog[]> {
    // TODO: Integrate proper Gemini API calls to embed the query string.
    // Replace dummy variable locally with the real dynamically generated embedding later.
    const dummyEmbedding = new Array(1536).fill(0);
    return MemoryRepository.searchSimilarity(dummyEmbedding, 10, userId, portfolioId);
  }
}
