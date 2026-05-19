import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middlewares/auth";
import { QuantAgent } from "../../agents/quantAgent";
import { RiskGuardian } from "../../agents/riskGuardian";
import { NewsOracle } from "../../agents/newsOracle";

export const intelligenceRouter = Router();

intelligenceRouter.use(authMiddleware);

// POST /api/intelligence/analyze
intelligenceRouter.post("/analyze", async (req: AuthRequest, res: Response): Promise<void> => {
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

    const result = await QuantAgent.analyzeMarket(portfolioId, userId);

    res.status(200).json({
      message: "Analysis completed",
      data: result
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
    const { portfolioId } = req.body;

    if (!userId) {
       res.status(401).json({ error: "Unauthorized" });
       return;
    }

    if (!portfolioId) {
       res.status(400).json({ error: "portfolioId is required" });
       return;
    }

    const result = await RiskGuardian.evaluateRisk(portfolioId, userId);

    res.status(200).json({
      message: "Risk evaluation completed",
      data: result
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
    const { portfolioId } = req.body;

    if (!userId) {
       res.status(401).json({ error: "Unauthorized" });
       return;
    }

    if (!portfolioId) {
       res.status(400).json({ error: "portfolioId is required" });
       return;
    }

    const result = await NewsOracle.analyzeSentiment(portfolioId, userId);

    res.status(200).json({
      message: "News sentiment analysis completed",
      data: result
    });
  } catch (error: any) {
    console.error("News Oracle error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});
