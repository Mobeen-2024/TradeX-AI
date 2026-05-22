import { EventListener, EventType } from "../events";
import { MetricsService } from "../services/metricsService";

export class MetricsWorker {
    static initialize() {
        EventListener.subscribe(EventType.ORDER_EXECUTED, async (payload) => {
            try {
                if (payload.portfolioId) {
                    await MetricsService.calculateAndStoreMetrics(payload.portfolioId);
                }
            } catch (err) {
                console.error("[MetricsWorker] Error tracking metrics on ORDER_EXECUTED:", err);
            }
        });

        // Throttle market tick to avoid DB saturation
        let lastTickUpdate = 0;
        EventListener.subscribe(EventType.MARKET_TICK_RECEIVED, async () => {
            try {
                const now = Date.now();
                if (now - lastTickUpdate > 60000) { // e.g. every 60s
                    lastTickUpdate = now;
                    await MetricsService.calculateForAllPortfolios();
                }
            } catch (err) {
                console.error("[MetricsWorker] Error tracking metrics on MARKET_TICK:", err);
            }
        });
    }
}

