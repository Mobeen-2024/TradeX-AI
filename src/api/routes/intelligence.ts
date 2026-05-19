import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middlewares/auth";
import { QuantAgent } from "../../agents/quantAgent";

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
