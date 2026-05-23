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

// GET /api/system/health
systemRouter.get("/health", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const health = await SystemService.getSystemHealth();
    res.status(200).json(health);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/system/audit
systemRouter.get("/audit", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const limit = parseInt((req.query.limit as string) || "50");
    const severity = req.query.severity as string;
    const logs = await SystemService.getAuditLogs(limit, severity);
    res.status(200).json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/system/snapshot
systemRouter.post("/snapshot", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { portfolioId, label, data } = req.body;
    const snapshot = await SystemService.saveSnapshot(portfolioId, label, data, req.user?.userId);
    await SystemService.logAuditEvent('SNAPSHOT_CREATED', { label }, 'INFO', 'USER', req.user?.userId, portfolioId);
    res.status(201).json(snapshot);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/system/snapshots
systemRouter.get("/snapshots", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const portfolioId = req.query.portfolioId as string;
    if (!portfolioId) {
      res.status(400).json({ error: "portfolioId is required" });
      return;
    }
    const snapshots = await SystemService.listSnapshots(portfolioId);
    res.status(200).json(snapshots);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/system/snapshots/:id
systemRouter.get("/snapshots/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const snapshot = await SystemService.loadSnapshot(req.params.id);
    res.status(200).json(snapshot);
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
