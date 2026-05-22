import { StrategyProfileRepository } from "../db/repositories/strategyProfiles";

export class StrategyService {
  static async getActive(portfolioId: string) {
    const strategy = await StrategyProfileRepository.getActiveStrategy(portfolioId);
    if (!strategy) {
      return {
        parameters: {
          confidence_threshold: 0.6,
          max_risk: 0.05,
          preferred_regime: "ANY"
        }
      };
    }
    return strategy;
  }

  static async getBestStrategy(portfolioId: string) {
      const activeStats = await StrategyProfileRepository.getActiveStrategy(portfolioId);
      if (!activeStats) {
          await this.createDefaultStrategy(portfolioId);
          return await StrategyProfileRepository.getActiveStrategy(portfolioId);
      }
      
      const pool = require('../db/connection').getPool();
      const res = await pool.query(
          "SELECT * FROM strategy_profiles WHERE portfolio_id = $1 ORDER BY performance_score DESC LIMIT 1",
          [portfolioId]
      );
      return res.rows[0];
  }

  static async getActivePortfolioIds() {
      return await StrategyProfileRepository.getActivePortfolioIds();
  }

  static async getRecentTrades(portfolioId: string) {
      return await StrategyProfileRepository.getRecentTrades(portfolioId);
  }

  static async createDefaultStrategy(portfolioId: string) {
      await StrategyProfileRepository.createProfile(
          portfolioId,
          "Baseline v1",
          {
              confidence_threshold: 0.6,
              max_risk: 0.05,
              preferred_regime: "ANY",
              momentum_factor: 1.0,
              mean_reversion_factor: 1.0
          },
          true
      );
  }

  static async getPerformance(strategyId: string) {
      return await StrategyProfileRepository.getStrategyPerformance(strategyId);
  }

  static async mutateStrategy(portfolioId: string, mutatedStrategy: any) {
      await StrategyProfileRepository.createProfile(
          portfolioId,
          mutatedStrategy.name,
          mutatedStrategy.parameters,
          true
      );
  }

  static async getTopStrategies(portfolioId: string, limit: number = 2) {
      const pool = require('../db/connection').getPool();
      const res = await pool.query(
          "SELECT * FROM strategy_profiles WHERE portfolio_id = $1 ORDER BY performance_score DESC LIMIT $2",
          [portfolioId, limit]
      );
      return res.rows;
  }

  static async getWorstStrategies(portfolioId: string, limit: number = 2) {
      const pool = require('../db/connection').getPool();
      const res = await pool.query(
          "SELECT * FROM strategy_profiles WHERE portfolio_id = $1 AND name != 'Baseline v1' ORDER BY performance_score ASC LIMIT $2",
          [portfolioId, limit]
      );
      return res.rows;
  }

  static async enforceStrategyLimit(portfolioId: string, maxLimit: number = 10) {
      const pool = require('../db/connection').getPool();
      const countRes = await pool.query("SELECT count(*) as total FROM strategy_profiles WHERE portfolio_id = $1", [portfolioId]);
      if (countRes.rows[0].total > maxLimit) {
          const excess = countRes.rows[0].total - maxLimit;
          await pool.query(`
              DELETE FROM strategy_profiles 
              WHERE id IN (
                  SELECT id FROM strategy_profiles 
                  WHERE portfolio_id = $1 AND name != 'Baseline v1'
                  ORDER BY performance_score ASC LIMIT $2
              )
          `, [portfolioId, excess]);
      }
  }
}
