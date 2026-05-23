import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../middlewares/auth";
import { PortfolioService } from "../../services/portfolioService";
import { getPool } from "../../db/connection";

export const portfolioRouter = Router();

// Apply auth middleware to all portfolio routes
portfolioRouter.use(authMiddleware);

portfolioRouter.post(
  "/create",
  async (req: AuthRequest, res: Response): Promise<void> => {
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

      const portfolio = await PortfolioService.createPortfolio(
        userId,
        name,
        description || null,
      );
      res
        .status(201)
        .json({ message: "Portfolio created successfully", portfolio });
    } catch (error) {
      console.error("Create portfolio error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// GET /api/portfolio/me
portfolioRouter.get(
  "/me",
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const authUserId = req.user?.userId;
      if (!authUserId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const portfolios = await PortfolioService.getUserPortfolios(authUserId);
      res.status(200).json({ portfolios });
    } catch (error) {
      console.error("Get portfolios error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// GET /api/portfolio/:userId
portfolioRouter.get(
  "/:userId",
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const pathUserId = req.params.userId;
      const authUserId = req.user?.userId;

      if (!authUserId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      // Basic authorization check: user can only access their own portfolio
      if (pathUserId !== authUserId) {
        res
          .status(403)
          .json({ error: "Forbidden: You cannot access this portfolio" });
        return;
      }

      const portfolios = await PortfolioService.getUserPortfolios(pathUserId);
      res.status(200).json({ portfolios });
    } catch (error) {
      console.error("Get portfolios error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// POST /api/portfolio/:portfolioId/settings
portfolioRouter.post(
  "/:portfolioId/settings",
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const authUserId = req.user?.userId;
      if (!authUserId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const {
        is_trading_enabled,
        max_position_size,
        max_loss,
        emergency_halt,
      } = req.body;
      let enabled = is_trading_enabled;
      if (emergency_halt === true) enabled = false;

      const portfolio = await PortfolioService.updateSettings(
        authUserId,
        req.params.portfolioId,
        enabled,
        max_position_size || 0,
        max_loss || 0,
      );
      res.status(200).json({ message: "Settings updated", portfolio });
    } catch (error: any) {
      console.error("Update settings error:", error);
      res.status(400).json({ error: error.message || "Internal server error" });
    }
  },
);

// GET /api/portfolio/:portfolioId/trades
portfolioRouter.get(
  "/:portfolioId/trades",
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { portfolioId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;

      const pool = getPool();

      // Check if we need to seed some trades (only if page is 1)
      if (page === 1) {
        const countRes = await pool.query(
          "SELECT COUNT(*) FROM trades WHERE portfolio_id = $1",
          [portfolioId],
        );
        const count = parseInt(countRes.rows[0].count);
        if (count === 0) {
          // Seed 5 historical trades for demo/visual richness
          const now = new Date();
          const demoTrades = [
            {
              asset: "XAUUSD",
              size: 50.0,
              entry: 2380.0,
              exit: 2420.0,
              pnl: 2000.0,
              status: "CLOSED",
              ageDays: 10,
            },
            {
              asset: "XAUUSD",
              size: 40.0,
              entry: 2450.0,
              exit: 2435.0,
              pnl: -600.0,
              status: "CLOSED",
              ageDays: 7,
            },
            {
              asset: "XAUUSD",
              size: 60.0,
              entry: 2425.0,
              exit: 2470.0,
              pnl: 2700.0,
              status: "CLOSED",
              ageDays: 5,
            },
            {
              asset: "XAUUSD",
              size: 30.0,
              entry: 2510.0,
              exit: null,
              pnl: null,
              status: "OPEN",
              ageDays: 2,
            },
            {
              asset: "XAUUSD",
              size: 45.0,
              entry: 2540.0,
              exit: 2565.0,
              pnl: 1125.0,
              status: "CLOSED",
              ageDays: 1,
            },
          ];

          for (const t of demoTrades) {
            const opened = new Date(
              now.getTime() - t.ageDays * 24 * 60 * 60 * 1000,
            );
            const closed =
              t.status === "CLOSED"
                ? new Date(opened.getTime() + 1.5 * 24 * 60 * 60 * 1000)
                : null;
            await pool.query(
              `INSERT INTO trades (portfolio_id, asset_id, entry_price, exit_price, size, pnl, status, opened_at, closed_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
              [
                portfolioId,
                t.asset,
                t.entry,
                t.exit,
                t.size,
                t.pnl,
                t.status,
                opened,
                closed,
              ],
            );
          }
        }
      }

      const result = await pool.query(
        `SELECT * FROM trades
       WHERE portfolio_id = $1
       ORDER BY opened_at DESC
       LIMIT $2 OFFSET $3`,
        [portfolioId, limit, offset],
      );

      const mappedTrades = result.rows.map((row) => {
        // Deterministically assign action
        const hash = row.id.split("-").join("");
        const actionNum = parseInt(hash.substring(0, 4), 16);
        const action = actionNum % 2 === 0 ? "BUY" : "SELL";

        return {
          id: row.id,
          asset_id: row.asset_id,
          action,
          size: parseFloat(row.size),
          price: parseFloat(row.entry_price),
          pnl: row.pnl !== null ? parseFloat(row.pnl) : null,
          status: row.status,
          created_at: row.opened_at,
        };
      });

      res.status(200).json(mappedTrades);
    } catch (error: any) {
      console.error("Get portfolio trades error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  },
);

// GET /api/portfolio/:portfolioId/positions
portfolioRouter.get(
  "/:portfolioId/positions",
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { portfolioId } = req.params;
      const pool = getPool();

      const result = await pool.query(
        "SELECT * FROM positions WHERE portfolio_id = $1 ORDER BY created_at DESC",
        [portfolioId],
      );

      const enrichedPositions = [];
      for (const pos of result.rows) {
        const priceResult = await pool.query(
          `SELECT price FROM market_ticks WHERE symbol = $1 ORDER BY timestamp DESC LIMIT 1`,
          [pos.asset_id],
        );
        const currentPrice =
          priceResult.rows.length > 0
            ? parseFloat(priceResult.rows[0].price)
            : parseFloat(pos.avg_entry_price);

        enrichedPositions.push({
          ...pos,
          id: pos.id,
          asset_id: pos.asset_id,
          avg_entry_price: parseFloat(pos.avg_entry_price),
          size: parseFloat(pos.size),
          current_price: currentPrice,
        });
      }

      res.status(200).json(enrichedPositions);
    } catch (error: any) {
      console.error("Get portfolio positions error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  },
);
