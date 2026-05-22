import { getPool } from "../connection";

export class AgentDecisionsRepository {
  static async insertDecision(
    agentName: string,
    portfolioId: string,
    assetId: string,
    direction: string,
    entryPrice: number,
    rationale: string
  ) {
    const pool = getPool();
    await pool.query(
      `INSERT INTO agent_decisions 
       (agent_name, portfolio_id, asset_id, direction, entry_price, rationale, evaluation) 
       VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')`,
      [agentName, portfolioId, assetId, direction, entryPrice, rationale]
    );
  }
}
