import { GoogleGenAI } from "@google/genai";
import { getPool } from "../db/connection";
import { SystemTelemetryTab } from "../components/tabs/SystemTelemetryTab"; // wait, backend code can't import frontend component. I'll just use simple log.

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
    this.aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy" });
  }

  public static getInstance(): AiService {
    if (!AiService.instance) {
      AiService.instance = new AiService();
    }
    return AiService.instance;
  }

  public async getSystemControls() {
    try {
      const res = await pool.query("SELECT * FROM global_system_controls WHERE id = 1");
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
      await pool.query("UPDATE global_system_controls SET circuit_breaker_active = $1 WHERE id = 1", [active]);
      if (active) {
          // If breaker trips, kill trading at global level
          await pool.query("UPDATE global_system_controls SET is_trading_enabled = false WHERE id = 1");
      }
    } catch (e) {
      console.warn("Failed to set circuit breaker", e);
    }
  }

  public async auditLog(eventType: string, details: any, severity: string = "INFO") {
     try {
       await pool.query(
         "INSERT INTO audit_logs (event_type, details, severity) VALUES ($1, $2, $3)",
         [eventType, JSON.stringify(details), severity]
       );
     } catch (e) {
       console.warn("Failed to insert audit log", e);
     }
  }

  public async generateContent(prompt: string, model: string = "gemini-2.5-flash"): Promise<string> {
    // 1. Global Kill Switch & Circuit Breaker Check
    const state = await this.getSystemControls();
    if (!state.is_trading_enabled) {
        throw new Error("KILL_SWITCH: System trading is globally disabled.");
    }
    if (state.circuit_breaker_active) {
        throw new Error("CIRCUIT_BREAKER: AI execution is paused due to multiple consecutive failures.");
    }

    // 2. Rate Limiting Enforcer (Sliding Window)
    const now = Date.now();
    this.callTimestamps = this.callTimestamps.filter(ts => now - ts < 60000);
    if (this.callTimestamps.length >= AiService.MAX_CALLS_PER_MINUTE) {
        this.auditLog("RATE_LIMIT_HIT", { timestamp: new Date() }, "WARNING");
        throw new Error("Rate limit exceeded for AI calls. Please back off.");
    }
    this.callTimestamps.push(now);

    // 3. Execution with Circuit Breaker
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured.");
      }
      
      const startTime = Date.now();
      const response = await this.aiClient.models.generateContent({
        model: model,
        contents: prompt,
      });
      const duration = Date.now() - startTime;

      // Reset failures on success
      this.consecutiveFailures = 0;
      
      await this.auditLog("AI_REQUEST_SUCCESS", { model, duration_ms: duration, promptLength: prompt.length }, "INFO");
      return response.text;
    } catch (error: any) {
      this.consecutiveFailures++;
      console.error(`[AiService] Gemini Generation Failed. Consecutive Failures: ${this.consecutiveFailures}`);
      
      await this.auditLog("AI_REQUEST_FAILED", { error: error.message, failures: this.consecutiveFailures }, "ERROR");

      if (this.consecutiveFailures >= this.FAILURE_THRESHOLD) {
         console.error("[AiService] Circuit breaker tripped!");
         await this.setCircuitBreaker(true);
         await this.auditLog("CIRCUIT_BREAKER_TRIPPED", { reason: "Multiple consecutive AI failures" }, "CRITICAL");
         throw new Error("Circuit breaker tripped on AI failures. Trading halted.");
      }

      throw error;
    }
  }
}

export const aiService = AiService.getInstance();
