import { GoogleGenAI } from "@google/genai";
import { getPool } from "../db/connection";

const pool = getPool();

class AiService {
  private static instance: AiService;
  private aiClient: any;

  // Rate Limiting Config
  private static readonly MAX_CALLS_PER_MINUTE = 20;
  private callTimestamps: number[] = [];

  // Circuit Breaker Config
  private consecutiveFailures = 0;
  private readonly FAILURE_THRESHOLD = 3;

  private constructor() {
    this.aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || "dummy",
    });
  }

  public static getInstance(): AiService {
    if (!AiService.instance) {
      AiService.instance = new AiService();
    }
    return AiService.instance;
  }

  public async getSystemControls() {
    try {
      const res = await pool.query(
        "SELECT * FROM global_system_controls WHERE id = 1",
      );
      if (res.rows.length === 0) {
        return { is_trading_enabled: true, circuit_breaker_active: false };
      }
      return res.rows[0];
    } catch {
      // Mock db fallback
      return { is_trading_enabled: true, circuit_breaker_active: false };
    }
  }

  public async setCircuitBreaker(active: boolean) {
    try {
      await pool.query(
        "UPDATE global_system_controls SET circuit_breaker_active = $1 WHERE id = 1",
        [active],
      );
      if (active) {
        // If breaker trips, kill trading at global level
        await pool.query(
          "UPDATE global_system_controls SET is_trading_enabled = false WHERE id = 1",
        );
      }
    } catch (e) {
      console.warn("Failed to set circuit breaker", e);
    }
  }

  public async auditLog(
    eventType: string,
    details: any,
    severity: string = "INFO",
  ) {
    try {
      await pool.query(
        "INSERT INTO audit_logs (event_type, details, severity) VALUES ($1, $2, $3)",
        [eventType, JSON.stringify(details), severity],
      );
    } catch (e) {
      console.warn("Failed to insert audit log", e);
    }
  }

  public async generateContent(
    prompt: string,
    model: string = "gemini-2.5-flash",
  ): Promise<string> {
    // 1. Global Kill Switch & Circuit Breaker Check
    const state = await this.getSystemControls();
    if (!state.is_trading_enabled) {
      return '{"action": "HOLD", "confidenceScore": 0.1, "rationale": "Trading globally disabled", "sentiment": "NEUTRAL"}';
    }
    if (state.circuit_breaker_active) {
      return '{"action": "HOLD", "confidenceScore": 0.1, "rationale": "Circuit breaker active", "sentiment": "NEUTRAL"}';
    }

    // 2. Rate Limiting Enforcer & Retry
    const maxRetries = 3;
    const baseDelay = 1500; // slightly longer base delay

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const now = Date.now();
        this.callTimestamps = this.callTimestamps.filter(
          (ts) => now - ts < 60000,
        );
        if (this.callTimestamps.length >= AiService.MAX_CALLS_PER_MINUTE) {
          await new Promise((r) => setTimeout(r, 2000 * attempt)); // exponential rate limit wait
          throw new Error("Rate limit exceeded for AI calls.");
        }
        this.callTimestamps.push(now);

        if (!process.env.GEMINI_API_KEY) {
          throw new Error("GEMINI_API_KEY is not configured.");
        }

        const startTime = Date.now();
        const response = await this.aiClient.models.generateContent({
          model: model,
          contents: prompt,
        });
        const duration = Date.now() - startTime;

        this.consecutiveFailures = 0;
        await this.auditLog(
          "AI_REQUEST_SUCCESS",
          { model, duration_ms: duration, promptLength: prompt.length },
          "INFO",
        );
        return response.text;
      } catch (error: any) {
        console.warn(
          `[AiService] Gemini Generation Attempt ${attempt}/${maxRetries} Failed. Error: ${error.message}`,
        );

        if (attempt === maxRetries) {
          this.consecutiveFailures++;
          console.error(
            `[AiService] Gemini Generation Failed after ${maxRetries} attempts. Activating safe fallbacks.`,
          );
          await this.auditLog(
            "AI_REQUEST_FAILED",
            { error: error.message, failures: this.consecutiveFailures },
            "ERROR",
          );

          if (this.consecutiveFailures >= this.FAILURE_THRESHOLD) {
            console.error("[AiService] Circuit breaker tripped!");
            await this.setCircuitBreaker(true);
            await this.auditLog(
              "CIRCUIT_BREAKER_TRIPPED",
              { reason: "Multiple consecutive AI failures" },
              "CRITICAL",
            );
          }

          // Return safe default JSON fallbacks instead of crashing the process
          const isNewsOracle =
            prompt.includes("News Oracle") || prompt.includes("sentiment");
          const isCoordinator =
            prompt.includes("Chief Investment Officer") ||
            prompt.includes("Coordinator");

          if (isNewsOracle) {
            return JSON.stringify({
              sentiment: "NEUTRAL",
              aiRationale: `[Fallback] Gemini API failed (Error: ${error.message}). Neutral fallback applied safely.`,
            });
          } else if (isCoordinator) {
            return JSON.stringify({
              action: "HOLD",
              confidenceScore: 0.1,
              strategyTag: "default",
              rationale: `[Fallback] Gemini API failed (Error: ${error.message}). Capital preserved: HOLD default applied.`,
            });
          } else {
            return JSON.stringify({
              action: "HOLD",
              marketRegime: "CHOPPY",
              strategyTag: "default",
              sentiment: "NEUTRAL",
              confidenceScore: 0.1,
              aiRationale: `[Fallback] Gemini API failed (Error: ${error.message}).`,
              rationale: `[Fallback] Gemini API failed (Error: ${error.message}).`,
            });
          }
        }
        // Exponential backoff
        await new Promise((r) =>
          setTimeout(r, baseDelay * Math.pow(2, attempt - 1)),
        );
      }
    }
    return "";
  }
}

export const aiService = AiService.getInstance();
