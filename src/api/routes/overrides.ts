import express from "express";

export const overridesRouter = express.Router();

let currentOverridesMockDb: any[] = []; // simple mock memory storage, typically this goes to DB.

// POST /api/overrides/log
overridesRouter.post("/log", async (req, res) => {
  try {
    const payload = req.body;
    // Basic check for idempotency
    const exists = currentOverridesMockDb.find(
      (g) => g.correlationId === payload.correlationId && g.id === payload.id,
    );

    if (!exists) {
      currentOverridesMockDb.push(payload);
    }

    res.json({ success: true, message: "Logged to override persistence" });
  } catch (e) {
    res.status(500).json({ error: "Failed to persist override log" });
  }
});
