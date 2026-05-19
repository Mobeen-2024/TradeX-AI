export interface EmbeddingProvider {
  embedText(text: string): Promise<number[]>;
}
