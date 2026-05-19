import { EmbeddingProvider } from "./provider";
import { GeminiEmbeddingProvider } from "./gemini";

// In the future this could read process.env.EMBEDDING_PROVIDER to switch
export const getEmbeddingProvider = (): EmbeddingProvider => {
  return new GeminiEmbeddingProvider();
};
