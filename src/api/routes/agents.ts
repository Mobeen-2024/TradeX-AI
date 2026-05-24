import { Router } from "express";
import { MemoryService } from "../../services/memoryService";

export const agentsRouter = Router();

agentsRouter.get("/", async (req, res) => {
  try {
    // In a real scenario, this might check the memory DB for the latest logs per agent.
    // We'll return a sensible default baseline that the UI can use before WS data flows.
    res.json({
      agents: {
        Coordinator: { status: "idle", lastMessage: "Awaiting synchronization..." },
        QuantAgent: { status: "idle", lastMessage: "Data streams connected" },
        RiskGuardian: { status: "idle", lastMessage: "Constraints armed" },
        ExecutionAgent: { status: "idle", lastMessage: "Execution engine ready" },
        NewsOracle: { status: "idle", lastMessage: "Listening to global feeds" },
      }
    });
  } catch (err) {
    console.error("Error fetching agents status:", err);
    res.status(500).json({ error: "Failed to fetch agents status" });
  }
});
