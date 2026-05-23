import { getPool } from "../db/connection";

export class SystemIntelligenceService {
  static async getGlobalSnapshot(portfolioId: string) {
    const pool = getPool();
    // Fetch latest agent decisions
    const query = `
      SELECT agent_name, market_regime, ai_rationale, timestamp, metadata
      FROM semantic_memory_logs
      WHERE portfolio_id = $1
      ORDER BY timestamp DESC
      LIMIT 20
    `;
    const result = await pool.query(query, [portfolioId]);
    
    let quant = null;
    let risk = null;
    let news = null;
    let coordinator = null;

    for (const row of result.rows) {
      if (!quant && row.agent_name === "QuantAgent") quant = row;
      if (!risk && row.agent_name === "RiskGuardian") risk = row;
      if (!news && row.agent_name === "NewsOracle") news = row;
      if (!coordinator && row.agent_name === "Coordinator") coordinator = row;
      if (quant && risk && news && coordinator) break;
    }

    // Determine system state
    // We could fetch Portfolio stats, Active Strategy, etc.
    const strategyQuery = `SELECT * FROM strategy_profiles WHERE portfolio_id = $1 AND is_active = true LIMIT 1`;
    const strategyResult = await pool.query(strategyQuery, [portfolioId]);
    
    // We fetch a basic snapshot of portfolio metrics
    const metricsQuery = `SELECT total_value, total_pnl, max_drawdown FROM portfolio_metrics_history WHERE portfolio_id = $1 ORDER BY timestamp DESC LIMIT 1`;
    const metricsResult = await pool.query(metricsQuery, [portfolioId]);

    return {
      quantAgent: quant,
      riskGuardian: risk,
      newsOracle: news,
      coordinator: coordinator,
      activeStrategy: strategyResult.rows[0] || null,
      portfolioMetrics: metricsResult.rows[0] || { total_value: 0, total_pnl: 0, max_drawdown: 0 },
      systemStatus: "Running"
    };
  }

  static async getDecisionTrace(correlationId: string) {
    const pool = getPool();
    
    // 1. Fetch semantic memory traces for this correlation ID
    const query = `
      SELECT id, timestamp, agent_name, market_regime, ai_rationale, metadata, strategy_id
      FROM semantic_memory_logs
      WHERE correlation_id = $1
      ORDER BY timestamp ASC
    `;
    const result = await pool.query(query, [correlationId]);

    const trace: any = {
      correlationId
    };

    result.rows.forEach(row => {
      if (row.agent_name === "QuantAgent") trace.quant = row;
      if (row.agent_name === "RiskGuardian") trace.risk = row;
      if (row.agent_name === "NewsOracle") trace.news = row;
      if (row.agent_name === "Coordinator") trace.coordinator = row;
      if (row.agent_name === "ExecutionAgent") trace.execution = row;
      if (row.agent_name === "EvaluationCoordinator") trace.evaluation = row;
    });

    // 2. Fetch execution logs
    const execQuery = `
      SELECT start_timestamp, duration_ms, success, error_message
      FROM execution_logs
      WHERE agent_name = 'ExecutionAgent' 
      ORDER BY start_timestamp DESC LIMIT 1
    `;
    const execResult = await pool.query(execQuery);
    trace.executionMeta = execResult.rows[0] || null;

    // 3. Fetch trade outcomes matching this correlation if we had one
    const tradeQuery = `
      SELECT * FROM trade_outcomes
      WHERE correlation_id = $1
    `;
    const tradeResult = await pool.query(tradeQuery, [correlationId]);
    trace.outcome = tradeResult.rows[0] || null;

    // 4. Fetch decision overrides
    const overrideQuery = `
      SELECT * FROM decision_overrides
      WHERE correlation_id = $1
    `;
    const overrideResult = await pool.query(overrideQuery, [correlationId]);
    trace.override = overrideResult.rows[0] || null;

    return trace;
  }
}
