import { Router, Response } from "express";
import { AuthRequest } from "../middlewares/auth";
import { aiService } from "../../services/aiService";
import { SystemService } from "../../services/systemService";
import { SystemIntelligenceService } from "../../services/systemIntelligenceService";

export const systemRouter = Router();

// GET /api/system/intelligence
systemRouter.get("/intelligence", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const portfolioId = req.query.portfolioId as string;
    if (!portfolioId) {
      res.status(400).json({ error: "portfolioId is required" });
      return;
    }
    const snapshot = await SystemIntelligenceService.getGlobalSnapshot(portfolioId);
    res.status(200).json(snapshot);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/system/trace/:correlationId
systemRouter.get("/trace/:correlationId", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { correlationId } = req.params;
    const trace = await SystemIntelligenceService.getDecisionTrace(correlationId);
    res.status(200).json(trace);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/system/status
systemRouter.get("/status", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const status = await aiService.getSystemControls();
    
    // Also include audit logs
    const auditLogs = await SystemService.getAuditLogs();
    
    res.status(200).json({ 
        controls: status,
        auditLogs
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/system/kill
systemRouter.post("/kill", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await SystemService.killSystem();
    // Emit some global event to websockets? If we had it.
    res.status(200).json({ message: "System killed globally." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/system/resume
systemRouter.post("/resume", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Reset circuit breaker and enable trading
    await SystemService.resumeSystem();
    res.status(200).json({ message: "System resumed." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
