import { GoogleGenAI } from "@google/genai";
import { EmbeddingProvider } from "./provider";

export class GeminiEmbeddingProvider implements EmbeddingProvider {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async embedText(text: string): Promise<number[]> {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not set. Using dummy fallback zeros.");
      return new Array(768).fill(0);
    }
    
    // gemini-embedding-2-preview actually defaults to 768 dimensions usually.
    const response = await this.ai.models.embedContent({
      model: "text-embedding-004", // Most widely supported google/genai embedding model
      contents: text,
      // You can specify outputDimensionality with config if needed:
      // config: { outputDimensionality: 768 }
    });
    
    return response.embeddings?.[0]?.values || new Array(768).fill(0);
  }
}
