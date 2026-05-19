import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middlewares/auth";
import { PortfolioService } from "../../services/portfolioService";

export const portfolioRouter = Router();

// Apply auth middleware to all portfolio routes
portfolioRouter.use(authMiddleware);

portfolioRouter.post("/create", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { name, description } = req.body;
    if (!name) {
      res.status(400).json({ error: "Name is required" });
      return;
    }

    const portfolio = await PortfolioService.createPortfolio(userId, name, description || null);
    res.status(201).json({ message: "Portfolio created successfully", portfolio });
  } catch (error) {
    console.error("Create portfolio error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/portfolio/:userId
portfolioRouter.get("/:userId", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pathUserId = req.params.userId;
    const authUserId = req.user?.userId;

    if (!authUserId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Basic authorization check: user can only access their own portfolio
    if (pathUserId !== authUserId) {
      res.status(403).json({ error: "Forbidden: You cannot access this portfolio" });
      return;
    }

    const portfolios = await PortfolioService.getUserPortfolios(pathUserId);
    res.status(200).json({ portfolios });
  } catch (error) {
    console.error("Get portfolios error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
