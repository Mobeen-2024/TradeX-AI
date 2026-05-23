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

    try {
      const response = await this.ai.models.embedContent({
        model: "gemini-embedding-2-preview",
        contents: text,
      });
      return response.embeddings?.[0]?.values || new Array(768).fill(0);
    } catch (e: any) {
      console.warn(
        "Gemini embedding failed, returning zeros. Error:",
        e.message,
      );
      return new Array(768).fill(0);
    }
  }
}
