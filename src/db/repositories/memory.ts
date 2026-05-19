import { getPool } from "../connection";

export interface SemanticMemoryLog {
  id: string;
  user_id: string | null;
  portfolio_id: string | null;
  timestamp: Date;
  market_regime: string | null;
  ai_rationale: string | null;
  created_at: Date;
}

export class MemoryRepository {
  static async create(
    marketRegime: string | null,
    aiRationale: string | null,
    vectorEmbedding: number[],
    userId?: string | null,
    portfolioId?: string | null,
    correlationId?: string | null,
    agentName?: string | null
  ): Promise<SemanticMemoryLog> {
    const pool = getPool();
    // pgvector expects embeddings in the format '[1,2,3]'
    const embeddingString = `[${vectorEmbedding.join(",")}]`;

    // Attempt idempotency if correlationId and agentName are specified
    if (correlationId && agentName) {
      const existing = await pool.query(
        `SELECT id, user_id, portfolio_id, timestamp, market_regime, ai_rationale, created_at 
         FROM semantic_memory_logs 
         WHERE correlation_id = $1 AND agent_name = $2`,
        [correlationId, agentName]
      );
      if (existing.rows.length > 0) {
        return existing.rows[0] as SemanticMemoryLog;
      }
    }

    try {
      const result = await pool.query(
        `INSERT INTO semantic_memory_logs (user_id, portfolio_id, market_regime, ai_rationale, vector_embedding, correlation_id, agent_name) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, user_id, portfolio_id, timestamp, market_regime, ai_rationale, created_at`,
        [userId || null, portfolioId || null, marketRegime, aiRationale, embeddingString, correlationId || null, agentName || null]
      );
      return result.rows[0] as SemanticMemoryLog;
    } catch (error: any) {
      if (error.code === '23505' && correlationId && agentName) { // unique violation
        const existing = await pool.query(
          `SELECT id, user_id, portfolio_id, timestamp, market_regime, ai_rationale, created_at 
           FROM semantic_memory_logs 
           WHERE correlation_id = $1 AND agent_name = $2`,
          [correlationId, agentName]
        );
        if (existing.rows.length > 0) {
          return existing.rows[0] as SemanticMemoryLog;
        }
      }
      throw error;
    }
  }

  static async searchSimilarity(
    vector: number[],
    limit: number = 5,
    userId?: string,
    portfolioId?: string
  ): Promise<SemanticMemoryLog[]> {
    const pool = getPool();
    const embeddingString = `[${vector.join(",")}]`;

    let query = `SELECT id, user_id, portfolio_id, timestamp, market_regime, ai_rationale, created_at
                 FROM semantic_memory_logs`;
    const params: any[] = [embeddingString, limit];
    let whereClauses: string[] = [];

    if (userId) {
      whereClauses.push(`user_id = $${params.length + 1}`);
      params.push(userId);
    }

    if (portfolioId) {
      whereClauses.push(`portfolio_id = $${params.length + 1}`);
      params.push(portfolioId);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ` + whereClauses.join(" AND ");
    }

    query += ` ORDER BY vector_embedding <=> $1 LIMIT $2`;

    const result = await pool.query(query, params);
    return result.rows as SemanticMemoryLog[];
  }

  static async getRecent(
    limit: number = 5,
    portfolioId?: string,
    userId?: string
  ): Promise<SemanticMemoryLog[]> {
    const pool = getPool();
    let query = `SELECT id, user_id, portfolio_id, timestamp, market_regime, ai_rationale, created_at
                 FROM semantic_memory_logs`;
    const params: any[] = [limit];
    let whereClauses: string[] = [];

    if (portfolioId) {
      whereClauses.push(`portfolio_id = $${params.length + 1}`);
      params.push(portfolioId);
    }

    if (userId) {
      whereClauses.push(`user_id = $${params.length + 1}`);
      params.push(userId);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ` + whereClauses.join(" AND ");
    }

    query += ` ORDER BY timestamp DESC LIMIT $1`;

    const result = await pool.query(query, params);
    return result.rows as SemanticMemoryLog[];
  }
}
