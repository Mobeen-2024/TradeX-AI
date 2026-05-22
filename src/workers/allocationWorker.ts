import { EventListener, EventType } from "../events";
import { CapitalAllocationService } from "../services/capitalAllocationService";
import { StrategyService } from "../services/strategyService";

export class AllocationWorker {
    static initialize() {
        let tradeCounter = 0;
        
        EventListener.subscribe(EventType.ORDER_EXECUTED, async (payload) => {
            tradeCounter++;
            // Rebalance every 5 trades
            if (tradeCounter >= 5) {
                tradeCounter = 0;
                try {
                    const portfolioIds = await StrategyService.getActivePortfolioIds();
                    for (const pid of portfolioIds) {
                        await CapitalAllocationService.rebalanceAllocations(pid);
                    }
                    console.log(`[AllocationWorker] Rebalanced allocations for all portfolios.`);
                } catch (err) {
                    console.error("[AllocationWorker] Error rebalancing:", err);
                }
            }
        });

        // Or periodically every 1 hour (simplified for now as just a hook)
        setInterval(async () => {
            try {
                const portfolioIds = await StrategyService.getActivePortfolioIds();
                for (const pid of portfolioIds) {
                    await CapitalAllocationService.rebalanceAllocations(pid);
                }
            } catch (err) {
                console.error("[AllocationWorker] Error in periodic rebalance:", err);
            }
        }, 1000 * 60 * 60);
    }
}
