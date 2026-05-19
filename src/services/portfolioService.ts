import { PortfolioRepository, Portfolio } from "../db/repositories/portfolios";
import { PositionRepository, Position } from "../db/repositories/positions";
import { getPool } from "../db/connection";

export interface EnrichedPortfolio extends Portfolio {
  positions: Position[];
  cash: number;
  totalUnrealizedPnl: number;
  totalRealizedPnl: number;
}

export class PortfolioService {
  static async createPortfolio(userId: string, name: string, description: string | null): Promise<Portfolio> {
    const portfolio = await PortfolioRepository.create(userId, name, description);
    const pool = getPool();
    await pool.query(
      `INSERT INTO balances (portfolio_id, cash) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [portfolio.id, 100000.0]
    );
    return portfolio;
  }

  static async getUserPortfolios(userId: string): Promise<EnrichedPortfolio[]> {
    const portfolios = await PortfolioRepository.findByUserId(userId);
    const enrichedPortfolios: EnrichedPortfolio[] = [];
    const pool = getPool();

    for (const portfolio of portfolios) {
      const positions = await PositionRepository.findByPortfolioId(portfolio.id);

      // Get cash
      const balanceResult = await pool.query(`SELECT cash FROM balances WHERE portfolio_id = $1`, [portfolio.id]);
      const cash = balanceResult.rows.length > 0 ? Number(balanceResult.rows[0].cash) : 100000.0;

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
        const currentPrice = priceResult.rows.length > 0 ? Number(priceResult.rows[0].price) : Number(pos.entry_price);

        const size = Number(pos.size);
        const entryPrice = Number(pos.entry_price);
        const unrealized = (currentPrice - entryPrice) * size;

        totalUnrealizedPnl += unrealized;

        enrichedPositions.push({
          ...pos,
          currentPrice,
          unrealizedPnl: unrealized
        });
      }

      enrichedPortfolios.push({
        ...portfolio,
        positions: enrichedPositions as Position[],
        cash,
        totalUnrealizedPnl,
        totalRealizedPnl
      });
    }

    return enrichedPortfolios;
  }
}

