import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middlewares/auth";
import { MarketService } from "../../services/market";

export const marketRouter = Router();

// Apply auth middleware to all market routes
marketRouter.use(authMiddleware);

// POST /api/market/ingest
marketRouter.post("/ingest", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { symbol, provider } = req.body;
    
    if (!symbol) {
      res.status(400).json({ error: "Symbol is required (e.g. BTCUSDT)" });
      return;
    }

    const result = await MarketService.fetchAndIngestTicker(symbol, provider);
    res.status(201).json({ message: "Market tick ingested successfully", data: result });
  } catch (error: any) {
    console.error("Market ingestion error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// GET /api/market/latest?symbol=BTCUSDT
marketRouter.get("/latest", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const symbol = req.query.symbol as string;

    const results = await MarketService.getLatestTick(symbol);
    res.status(200).json({ data: results });
  } catch (error) {
    console.error("Latest market tick error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
