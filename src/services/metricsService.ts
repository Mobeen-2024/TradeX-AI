import { MetricsRepository } from "../db/repositories/metrics";

export class MetricsService {
    static async calculateAndStoreMetrics(portfolioId: string) {
        try {
            const { cash, unrealizedPnl } = await MetricsRepository.getPortfolioValueStats(portfolioId);
            const portfolioValue = cash + unrealizedPnl;

            const trades = await MetricsRepository.getTradesStats(portfolioId);
            let winRate = 0;
            let totalRealized = 0;
            if (trades.length > 0) {
                const wins = trades.filter((r: any) => Number(r.pnl) > 0).length;
                winRate = (wins / trades.length) * 100;
                totalRealized = trades.reduce((sum: number, r: any) => sum + Number(r.pnl), 0);
            }

            const dailyReturn = portfolioValue > 0 ? (totalRealized + unrealizedPnl) / 100000 : 0;

            const prevMetrics = await MetricsRepository.getPrevMetrics(portfolioId);
            let peakValue = portfolioValue;
            if (prevMetrics.length > 0) {
                const maxHistory = Math.max(...prevMetrics.map((r: any) => Number(r.portfolio_value)));
                if (maxHistory > peakValue) peakValue = maxHistory;
            }
            const drawdown = peakValue > 0 ? ((peakValue - portfolioValue) / peakValue) * 100 : 0;
            const sharpe = dailyReturn / (drawdown > 0 ? (drawdown / 100) : 0.01);

            await MetricsRepository.saveMetricsHistory(portfolioId, portfolioValue, dailyReturn, sharpe, drawdown, winRate);

            const activeStats = await MetricsRepository.getActiveStrategyStats(portfolioId);
            if (activeStats) {
                const { strategy, trades: sTrades } = activeStats;
                const totalTrades = sTrades.length;
                if (totalTrades > 0) {
                    const sWins = sTrades.filter((r: any) => Number(r.pnl) > 0).length;
                    const sWinRate = sWins / totalTrades;
                    const sAvgPnl = sTrades.reduce((sum: number, r: any) => sum + Number(r.pnl), 0) / totalTrades;
                    const sSharpe = sAvgPnl / (0.01 + Math.abs(drawdown/100)); 
                    const sDrawdown = drawdown; 

                    await MetricsRepository.updateStrategyPerformance(totalTrades, sWinRate, sAvgPnl, sSharpe, sDrawdown, strategy.id);
                }
            }
        } catch (error) {
            throw error;
        }
    }

    static async calculateForAllPortfolios() {
        try {
            const portfolioIds = await MetricsRepository.getAllPortfolioIds();
            for (const pid of portfolioIds) {
                await this.calculateAndStoreMetrics(pid);
            }
        } catch (error) {
            console.error("[MetricsService] calculateForAllPortfolios error:", error);
        }
    }
}

