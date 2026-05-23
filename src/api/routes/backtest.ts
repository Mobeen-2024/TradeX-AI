import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middlewares/auth";
import { BacktestService } from "../../services/backtestService";

export const backtestRouter = Router();

backtestRouter.use(authMiddleware);

backtestRouter.post("/run", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { portfolioId, startDate, endDate, strategyId } = req.body;
    const result = await BacktestService.run({ portfolioId, startDate, endDate, strategyId });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

backtestRouter.get("/results/:portfolioId", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const results = await BacktestService.getResults(req.params.portfolioId);
    res.json(results || {});
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
