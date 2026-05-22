import { PortfolioRepository, Portfolio } from "../db/repositories/portfolios";
import { PositionRepository, Position } from "../db/repositories/positions";
import { getPool } from "../db/connection";

export interface EnrichedPortfolio extends Portfolio {
  positions: Position[];
  cash: number;
  totalUnrealizedPnl: number;
  totalRealizedPnl: number;
  recentTrades?: any[];
  winRate?: number;
  sharpeRatio?: number;
  maxDrawdown?: number;
  profitFactor?: number;
  expectancy?: number;
}

export class PortfolioService {
  static async createPortfolio(userId: string, name: string, description: string | null): Promise<Portfolio> {
    const portfolio = await PortfolioRepository.create(userId, name, description);
    const pool = getPool();
    await pool.query(
      `INSERT INTO balances (portfolio_id, cash_balance) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [portfolio.id, 100000.0]
    );
    return portfolio;
  }

  static async updateSettings(userId: string, portfolioId: string, is_trading_enabled: boolean, max_position_size: number, max_loss: number): Promise<Portfolio> {
    const portfolio = await PortfolioRepository.findById(portfolioId);
    if (!portfolio || portfolio.user_id !== userId) {
      throw new Error("Portfolio not found or unauthorized");
    }
    return await PortfolioRepository.updateSettings(portfolioId, is_trading_enabled, max_position_size, max_loss);
  }

  static async getUserPortfolios(userId: string): Promise<EnrichedPortfolio[]> {
    const portfolios = await PortfolioRepository.findByUserId(userId);
    const enrichedPortfolios: EnrichedPortfolio[] = [];
    const pool = getPool();

    for (const portfolio of portfolios) {
      const positions = await PositionRepository.findByPortfolioId(portfolio.id);

      // Get cash
      const balanceResult = await pool.query(`SELECT cash_balance FROM balances WHERE portfolio_id = $1`, [portfolio.id]);
      const cash = balanceResult.rows.length > 0 ? Number(balanceResult.rows[0].cash_balance) : 100000.0;

      let totalUnrealizedPnl = 0;
      let totalRealizedPnl = 0;

      // Enrich positions with current market price and unrealized PnL
      const enrichedPositions = [];
      for (const pos of positions) {
        const pnl = Number(pos.pnl_realized);
        totalRealizedPnl += pnl;

        // Fetch current price
        const priceResult = await pool.query(
          `SELECT price FROM market_ticks WHERE symbol = $1 ORDER BY timestamp DESC LIMIT 1`,
          [pos.asset_id]
        );
        const currentPrice = priceResult.rows.length > 0 ? Number(priceResult.rows[0].price) : Number(pos.avg_entry_price);

        const size = Number(pos.size);
        const entryPrice = Number(pos.avg_entry_price);
        const unrealized = (currentPrice - entryPrice) * size;

        totalUnrealizedPnl += unrealized;

        enrichedPositions.push({
          ...pos,
          currentPrice,
          unrealizedPnl: unrealized
        });
      }

      // Get recent trades
      const tradesResult = await pool.query(
        `SELECT id, asset_id, entry_price, close_price, size, pnl, opened_at, closed_at, status 
         FROM trades WHERE portfolio_id = $1 ORDER BY opened_at DESC LIMIT 10`,
        [portfolio.id]
      );
      
      let winCount = 0;
      let lossCount = 0;
      let grossProfit = 0;
      let grossLoss = 0;
      let totalWinningPnl = 0;
      let totalLosingPnl = 0;
      const returns: number[] = [];

      let peakPnl = 0;
      let currentDrawdown = 0;
      let maxDrawdown = 0;
      let runningPnl = 0;

      const allHistoricTrades = await pool.query(`SELECT pnl FROM trades WHERE portfolio_id = $1 AND status = 'CLOSED' ORDER BY closed_at ASC`, [portfolio.id]);
      for (const t of allHistoricTrades.rows) {
          const pnl = Number(t.pnl);
          returns.push(pnl);
          runningPnl += pnl;

          if (runningPnl > peakPnl) {
            peakPnl = runningPnl;
          }
          currentDrawdown = peakPnl - runningPnl;
          if (currentDrawdown > maxDrawdown) {
            maxDrawdown = currentDrawdown;
          }

          if (pnl > 0) {
            winCount++;
            grossProfit += pnl;
            totalWinningPnl += pnl;
          }
          else if (pnl < 0) {
            lossCount++;
            grossLoss += Math.abs(pnl);
            totalLosingPnl += Math.abs(pnl);
          }
      }
      
      const totalTrades = winCount + lossCount;
      const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;
      const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? 999 : 0);
      
      const averageWin = winCount > 0 ? totalWinningPnl / winCount : 0;
      const averageLoss = lossCount > 0 ? totalLosingPnl / lossCount : 0;
      const winProbability = totalTrades > 0 ? winCount / totalTrades : 0;
      const lossProbability = totalTrades > 0 ? lossCount / totalTrades : 0;
      const expectancy = (winProbability * averageWin) - (lossProbability * averageLoss);

      // Simple Sharpe Ratio Approximation (Assuming risk-free rate = 0)
      let sharpeRatio = 0;
      if (returns.length > 1) {
          const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
          const variance = returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / (returns.length - 1);
          const stdev = Math.sqrt(variance);
          if (stdev > 0) {
              sharpeRatio = avgReturn / stdev;
          }
      }

      enrichedPortfolios.push({
        ...portfolio,
        positions: enrichedPositions as Position[],
        recentTrades: tradesResult.rows,
        winRate,
        sharpeRatio,
        maxDrawdown,
        profitFactor,
        expectancy,
        cash,
        totalUnrealizedPnl,
        totalRealizedPnl
      });
    }

    return enrichedPortfolios;
  }
}

