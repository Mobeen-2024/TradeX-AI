import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middlewares/auth";
import { QuantAgent } from "../../agents/quantAgent";
import { RiskGuardian } from "../../agents/riskGuardian";
import { NewsOracle } from "../../agents/newsOracle";
import { EventDispatcher, EventListener, EventType } from "../../events";
import crypto from "crypto";

export const intelligenceRouter = Router();

intelligenceRouter.use(authMiddleware);

// POST /api/intelligence/analyze
intelligenceRouter.post("/analyze", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { portfolioId, useWorker = false, async = false } = req.body;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!portfolioId) {
      res.status(400).json({ error: "portfolioId is required" });
      return;
    }

    if (!useWorker) {
      // Fallback synchronous behavior
      const result = await QuantAgent.analyzeMarket(portfolioId, userId);
      res.status(200).json({
        message: "Analysis completed synchronously",
        data: result
      });
      return;
    }

    const correlationId = crypto.randomUUID();

    await EventDispatcher.emit(EventType.QUANT_ANALYSIS_REQUESTED, {
      portfolioId,
      userId,
      correlationId
    });

    if (async) {
      res.status(202).json({
        message: "Analysis enqueued",
        correlationId
      });
      return;
    }

    // Await for worker result
    const workerResult = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        EventListener.unsubscribe(EventType.QUANT_ANALYSIS_COMPLETED, handler);
        reject(new Error("Worker timed out after 30 seconds"));
      }, 30000);

      const handler = (payload: any) => {
        if (payload.correlationId === correlationId) {
          clearTimeout(timeout);
          EventListener.unsubscribe(EventType.QUANT_ANALYSIS_COMPLETED, handler);
          resolve(payload);
        }
      };

      EventListener.subscribe(EventType.QUANT_ANALYSIS_COMPLETED, handler);
    });

    res.status(200).json({
      message: "Analysis completed via worker",
      data: workerResult
    });
  } catch (error: any) {
    console.error("Intelligence Analysis error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// POST /api/intelligence/risk
intelligenceRouter.post("/risk", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { portfolioId, useWorker = false, async = false } = req.body;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!portfolioId) {
      res.status(400).json({ error: "portfolioId is required" });
      return;
    }

    if (!useWorker) {
      // Fallback synchronous behavior
      const result = await RiskGuardian.evaluateRisk(portfolioId, userId);
      res.status(200).json({
        message: "Risk evaluation completed synchronously",
        data: result
      });
      return;
    }

    const correlationId = crypto.randomUUID();

    await EventDispatcher.emit(EventType.RISK_VALIDATION_REQUESTED, {
      portfolioId,
      userId,
      correlationId
    });

    if (async) {
      res.status(202).json({
        message: "Risk evaluation enqueued",
        correlationId
      });
      return;
    }

    // Await for worker result
    const workerResult = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        EventListener.unsubscribe(EventType.RISK_VALIDATED, handler);
        reject(new Error("Worker timed out after 30 seconds"));
      }, 30000);

      const handler = (payload: any) => {
        if (payload.correlationId === correlationId) {
          clearTimeout(timeout);
          EventListener.unsubscribe(EventType.RISK_VALIDATED, handler);
          resolve(payload);
        }
      };

      EventListener.subscribe(EventType.RISK_VALIDATED, handler);
    });

    res.status(200).json({
      message: "Risk evaluation completed via worker",
      data: workerResult
    });
  } catch (error: any) {
    console.error("Risk Guardian error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// POST /api/intelligence/run-cycle
intelligenceRouter.post("/run-cycle", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { portfolioId } = req.body;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!portfolioId) {
      res.status(400).json({ error: "portfolioId is required" });
      return;
    }

    const { Coordinator } = await import("../../agents/coordinator");
    const result = await Coordinator.runCycle(portfolioId, userId);

    res.status(200).json({
      message: "Run cycle completed",
      data: result
    });
  } catch (error: any) {
    console.error("Coordinator error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});
intelligenceRouter.post("/news", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { portfolioId, useWorker = false, async = false } = req.body;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!portfolioId) {
      res.status(400).json({ error: "portfolioId is required" });
      return;
    }

    if (!useWorker) {
      // Fallback synchronous behavior
      const result = await NewsOracle.analyzeSentiment(portfolioId, userId);
      res.status(200).json({
        message: "News sentiment analysis completed synchronously",
        data: result
      });
      return;
    }

    const correlationId = crypto.randomUUID();

    await EventDispatcher.emit(EventType.NEWS_PROCESSING_REQUESTED, {
      portfolioId,
      userId,
      correlationId
    });

    if (async) {
      res.status(202).json({
        message: "News processing enqueued",
        correlationId
      });
      return;
    }

    // Await for worker result
    const workerResult = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        EventListener.unsubscribe(EventType.NEWS_PROCESSED, handler);
        reject(new Error("Worker timed out after 30 seconds"));
      }, 30000);

      const handler = (payload: any) => {
        if (payload.correlationId === correlationId) {
          clearTimeout(timeout);
          EventListener.unsubscribe(EventType.NEWS_PROCESSED, handler);
          resolve(payload);
        }
      };

      EventListener.subscribe(EventType.NEWS_PROCESSED, handler);
    });

    res.status(200).json({
      message: "News processing completed via worker",
      data: workerResult
    });
  } catch (error: any) {
    console.error("News Oracle error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});
