import { getPool } from "../db/connection";

export interface GlobalCapitalState {
  totalCapital: number;
  totalExposure: number;
  netExposure: number; // positive = LONG, negative = SHORT
  globalDrawdown: number;
  correlationRisk: number;
  volatilitySpike: boolean;
}

export class GlobalPortfolioService {
  static async getGlobalState(): Promise<GlobalCapitalState> {
    const pool = getPool();
    const client = await pool.connect();

    try {
      // LAYER 1: GLOBAL CAPITAL VIEW
      // 1. Get all balances
      const balances = await client.query(`SELECT cash_balance FROM balances`);
      let totalCash = balances.rows.reduce(
        (sum, r) => sum + Number(r.cash_balance),
        0,
      );

      // 2. Get all active positions
      const positions =
        await client.query(`SELECT asset_id, size, avg_entry_price, side FROM (
                SELECT p.asset_id, p.size, p.avg_entry_price, COALESCE(t.action, 'LONG') as side
                FROM positions p
                LEFT JOIN trades t ON p.portfolio_id = t.portfolio_id AND p.asset_id = t.asset_id AND t.status = 'OPEN'
            ) AS active_pos`);

      let totalExposure = 0;
      let netExposure = 0;
      let unrealizedPnl = 0;

      const assets = [...new Set(positions.rows.map((r) => r.asset_id))];
      const currentPrices: Record<string, number> = {};

      for (const asset of assets) {
        const tick = await client.query(
          `SELECT price FROM market_ticks WHERE symbol = $1 ORDER BY timestamp DESC LIMIT 1`,
          [asset],
        );
        if (tick.rows.length > 0) {
          currentPrices[asset] = Number(tick.rows[0].price);
        }
      }

      for (const pos of positions.rows) {
        const currPrice =
          currentPrices[pos.asset_id] || Number(pos.avg_entry_price);
        const posValue = currPrice * Number(pos.size);

        totalExposure += posValue;
        if (pos.side === "LONG" || pos.side === "BUY") {
          netExposure += posValue;
          unrealizedPnl +=
            (currPrice - Number(pos.avg_entry_price)) * Number(pos.size);
        } else {
          netExposure -= posValue;
          unrealizedPnl +=
            (Number(pos.avg_entry_price) - currPrice) * Number(pos.size);
        }
      }

      const totalCapital = totalCash + unrealizedPnl;

      // Global Drawdown approximation across all portfolios
      const allTrades = await client.query(
        `SELECT pnl FROM trades WHERE status = 'CLOSED' ORDER BY closed_at ASC`,
      );
      let runningBalance = balances.rows.length * 100000; // Simulated starting capital per portfolio
      if (runningBalance === 0) runningBalance = 100000;

      let peakValue = runningBalance;
      for (const t of allTrades.rows) {
        runningBalance += Number(t.pnl);
        if (runningBalance > peakValue) peakValue = runningBalance;
      }

      const trueCurrentValue = runningBalance + unrealizedPnl;
      if (trueCurrentValue > peakValue) peakValue = trueCurrentValue;

      const globalDrawdown =
        peakValue > 0
          ? Math.max(0, (peakValue - trueCurrentValue) / peakValue)
          : 0;

      // LAYER 3: CROSS-PORTFOLIO RISK
      let volSpikeCount = 0;
      for (const asset of assets) {
        const recentTicks = await client.query(
          `SELECT price FROM market_ticks WHERE symbol = $1 ORDER BY timestamp DESC LIMIT 20`,
          [asset],
        );
        if (recentTicks.rows.length > 5) {
          const prices = recentTicks.rows.map((r) => Number(r.price));
          const maxP = Math.max(...prices);
          const minP = Math.min(...prices);
          const volatility = minP > 0 ? (maxP - minP) / minP : 0;
          if (volatility > 0.03) volSpikeCount++;
        }
      }

      const volatilitySpike = volSpikeCount > 0;
      // Correlation detected if volatility spikes across multiple assets in different portfolios
      const correlationRisk =
        assets.length > 1 && volSpikeCount >= assets.length / 2 ? 0.8 : 0.0;

      return {
        totalCapital,
        totalExposure,
        netExposure,
        globalDrawdown,
        correlationRisk,
        volatilitySpike,
      };
    } finally {
      client.release();
    }
  }

  static async getPortfolioWeight(portfolioId: string): Promise<number> {
    const pool = getPool();
    const client = await pool.connect();

    try {
      const state = await this.getGlobalState();
      let globalPenalty = 0;

      // LAYER 6: SAFETY SYSTEM

      // 1. Enforce global drawdown cap
      if (state.globalDrawdown > 0.1) {
        globalPenalty += (state.globalDrawdown - 0.1) * 5; // e.g. 0.15 DD -> 0.25 penalty
      }

      // 2. Correlation risk reduction (if highly correlated, degrade)
      if (state.correlationRisk > 0.5) {
        globalPenalty += 0.2;
      }

      // 3. Volatility reduction globally
      if (state.volatilitySpike) {
        globalPenalty += 0.15;
      }

      // 4. Prevent over-allocation globally
      if (
        state.totalCapital > 0 &&
        state.totalExposure > state.totalCapital * 3
      ) {
        globalPenalty += 0.3; // Reduce by 30% if global leverage exceeds 3x
      }

      // LAYER 4: HEDGING LOGIC
      // If net exposure is heavily LONG (> 70% of total exposure)
      if (
        state.totalExposure > 0 &&
        state.netExposure / state.totalExposure > 0.7
      ) {
        // For simplified hedging via sizing, if this portfolio performs well in short it could be boosted,
        // but as a general defensive measure, we just shrink global directional risk.
        globalPenalty += 0.1;
      }

      // LAYER 2 & 5: CAPITAL REALLOCATION (Dynamic rebalancing based on strategy intelligence)
      const pnlRes = await client.query(
        `SELECT sum(pnl) as tpnl FROM trades WHERE portfolio_id = $1 AND status = 'CLOSED'`,
        [portfolioId],
      );
      const pPnl = Number(pnlRes.rows[0]?.tpnl || 0);

      // Contextual performance
      let contextualPerf = 1.0;
      if (pPnl > 5000) {
        contextualPerf = 1.1; // Boost allocations to winning ports
      } else if (pPnl < -5000) {
        contextualPerf = 0.8; // Penalize losing ports
      }

      // Phase 11: Implement Strategy Intelligence Layer
      const {
        StrategyIntelligenceService,
      } = require("./strategyIntelligenceService");

      // Determine current regime (fetch latest classification)
      const regimeRes = await client.query(
        `SELECT market_regime FROM agent_decisions ORDER BY created_at DESC LIMIT 1`,
      );
      const currentRegime =
        regimeRes.rows.length > 0 ? regimeRes.rows[0].market_regime : "UNKNOWN";

      // Profile Strategy
      const intel = await StrategyIntelligenceService.getStrategyScore(
        portfolioId,
        currentRegime,
      );

      // Calculate refined strategy score ensuring it starts around 1.0
      // Because baseScore defaults ~0.5, we scale it dynamically
      let strategyScore =
        intel.baseScore * 2 * intel.regimeScore * (1 - intel.edgeDecayPenalty);

      // Prevent scores from zeroing out entirely for new strategies
      if (strategyScore === 0) strategyScore = 1.0;

      // Combine weights and penalties
      // final_weight = strategy_score * risk_state_inverse * contextual performance
      let finalWeight =
        strategyScore * Math.max(0, 1 - globalPenalty) * contextualPerf;

      // Bound safety system constraint
      return Math.max(0.1, Math.min(1.5, finalWeight));
    } finally {
      client.release();
    }
  }
}
