import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middlewares/auth";
import { MemoryService } from "../../services/memoryService";

export const memoryRouter = Router();

// Ensure only authenticated users can access the memory logs
memoryRouter.use(authMiddleware);

// POST /api/memory/log
memoryRouter.post("/log", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { marketRegime, aiRationale, portfolioId } = req.body;
    const userId = req.user?.userId;
    
    if (!aiRationale) {
      res.status(400).json({ error: "aiRationale is required" });
      return;
    }

    const log = await MemoryService.logMemory(marketRegime || null, aiRationale, userId, portfolioId);
    res.status(201).json({ message: "Memory logged successfully", log });
  } catch (error) {
    console.error("Log memory error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/memory/search?q=
memoryRouter.get("/search", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query = req.query.q as string;
    const portfolioId = req.query.portfolioId as string;
    const userId = req.user?.userId;
    
    if (!query) {
      res.status(400).json({ error: "Query parameter 'q' is required" });
      return;
    }

    const results = await MemoryService.searchMemory(query, userId, portfolioId);
    res.status(200).json({ results });
  } catch (error) {
    console.error("Search memory error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
