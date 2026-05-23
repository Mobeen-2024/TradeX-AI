import express from "express";
import { OverrideService } from "../../services/overrideService";
import { PortfolioRepository } from "../../db/repositories/portfolios";
import { SystemService } from "../../services/systemService";

export const overridesRouter = express.Router();

// GET /api/overrides/pending?portfolioId=...
overridesRouter.get("/pending", async (req, res) => {
  try {
    const portfolioId = req.query.portfolioId as string;
    if (!portfolioId) {
      return res.status(400).json({ error: "Missing portfolioId query parameter" });
    }
    const pending = await OverrideService.getPending(portfolioId);
    res.json(pending);
  } catch (e: any) {
    console.error("Failed to fetch pending overrides:", e);
    res.status(500).json({ error: e.message || "Failed to fetch pending overrides" });
  }
});

// POST /api/overrides/:id/execute
overridesRouter.post("/:id/execute", async (req, res) => {
  try {
    const overrideId = req.params.id;
    const { action, size } = req.body;

    if (!action || !["BUY", "SELL", "DISCARD"].includes(action)) {
      return res.status(400).json({ error: "Invalid action. Must be BUY, SELL, or DISCARD." });
    }

    if (action !== "DISCARD" && (typeof size !== "number" || size <= 0)) {
      return res.status(400).json({ error: "Size must be a positive number for BUY or SELL actions." });
    }

    const result = await OverrideService.execute(overrideId, action, size || 0);
    res.json(result);
  } catch (e: any) {
    console.error("Failed to execute override:", e);
    res.status(500).json({ error: e.message || "Failed to execute override" });
  }
});

// PUT /api/overrides/portfolio/:id/mode
overridesRouter.put("/portfolio/:id/mode", async (req, res) => {
  try {
    const portfolioId = req.params.id;
    const { mode } = req.body;

    if (!mode || !["AUTO", "SEMI_AUTO", "SIMULATION"].includes(mode)) {
      return res.status(400).json({ error: "Invalid mode. Must be AUTO, SEMI_AUTO, or SIMULATION." });
    }

    const portfolio = await PortfolioRepository.findById(portfolioId);
    if (!portfolio) {
      return res.status(404).json({ error: "Portfolio not found" });
    }
    const previousMode = portfolio.execution_mode;

    const updated = await PortfolioRepository.updateExecutionMode(portfolioId, mode);
    
    await SystemService.logAuditEvent('EXECUTION_MODE_CHANGED', { 
      from: previousMode, 
      to: mode, 
      portfolioId 
    }, 'WARNING', 'USER', portfolio.user_id, portfolioId);

    res.json({
      success: true,
      message: `Successfully updated execution mode to ${mode}`,
      portfolio: updated
    });
  } catch (e: any) {
    console.error("Failed to update execution mode:", e);
    res.status(500).json({ error: e.message || "Failed to update execution mode" });
  }
});
