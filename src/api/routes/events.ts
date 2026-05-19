import { Router, Request, Response } from "express";
import { getPool } from "../../db/connection";

export const eventsRouter = Router();

// GET /api/events/:correlationId
eventsRouter.get("/:correlationId", async (req: Request, res: Response): Promise<void> => {
  try {
    const { correlationId } = req.params;
    const pool = getPool();

    // 1. Fetch event_queue_logs for correlationId
    // correlationId is inside the payload JSONB
    const eventsQuery = `
      SELECT id, event_type, payload, status, retry_count, created_at, processed_at
      FROM event_queue_logs
      WHERE payload->>'correlationId' = $1
      ORDER BY created_at ASC
    `;
    const eventsResult = await pool.query(eventsQuery, [correlationId]);

    // 2. Fetch semantic_memory_logs for correlationId
    const memoriesQuery = `
      SELECT id, agent_name, timestamp, market_regime, ai_rationale, created_at
      FROM semantic_memory_logs
      WHERE correlation_id = $1
      ORDER BY created_at ASC
    `;
    const memoriesResult = await pool.query(memoriesQuery, [correlationId]);

    // 3. Fetch execution_logs for all agents
    // Since execution_logs does not have correlation_id, we can fetch
    // execution logs that have the portfolio_id derived from events or memories,
    // and which occurred around the time of the events chain.
    // Let's get portfolio_id from the events
    let portfolioId = null;
    let fallbackToAll = false;

    if (eventsResult.rows.length > 0) {
      portfolioId = eventsResult.rows[0].payload.portfolioId;
    } else if (memoriesResult.rows.length > 0) {
      // In semantic_memory_logs, we don't have portfolio_id returned in the query above, but it's in the DB.
      // Let's query it if needed.
    }

    let executionsResult = { rows: [] as any[] };
    
    if (portfolioId) {
      // Get execution logs for this portfolio id.
      // Alternatively, we limit to the recent ones related to this run to avoid fetching huge numbers.
      // If correlationId is fresh, we can limit it.
      const executionsQuery = `
        SELECT id, agent_name, start_timestamp, duration_ms, success, error_message, portfolio_id, fallback_used, created_at
        FROM execution_logs
        WHERE portfolio_id = $1
        ORDER BY start_timestamp DESC
        LIMIT 50
      `;
      executionsResult = await pool.query(executionsQuery, [portfolioId]);
    } else {
      // If we couldn't derive portfolioId, just get the most recent executions globally.
      const executionsQuery = `
        SELECT id, agent_name, start_timestamp, duration_ms, success, error_message, portfolio_id, fallback_used, created_at
        FROM execution_logs
        ORDER BY start_timestamp DESC
        LIMIT 50
      `;
      executionsResult = await pool.query(executionsQuery);
    }

    res.json({
      events: eventsResult.rows,
      memories: memoriesResult.rows,
      executions: executionsResult.rows
    });
  } catch (error: any) {
    console.error("Error fetching chain observability:", error);
    res.status(500).json({ error: error.message || "Failed to fetch event chain data" });
  }
});
