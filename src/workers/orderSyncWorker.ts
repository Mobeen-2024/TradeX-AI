import { ExecutionService } from "../services/executionService";
import { EventDispatcher, EventType } from "../events";

export class OrderSyncWorker {
    private isRunning = false;
    private timer: NodeJS.Timeout | null = null;

    start(intervalMs = 5000) {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log(`[OrderSyncWorker] Started polling every ${intervalMs}ms`);
        this.poll(intervalMs);
    }

    stop() {
        this.isRunning = false;
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    private async poll(intervalMs: number) {
        if (!this.isRunning) return;
        
        try {
            console.log(`[OrderSyncWorker] Tick - Syncing Open Orders...`);
            const pendingOrders = await ExecutionService.syncOpenOrders();
        } catch (error) {
            console.error(`[OrderSyncWorker] Error syncing orders:`, error);
        }

        if (this.isRunning) {
            this.timer = setTimeout(() => this.poll(intervalMs), intervalMs);
        }
    }
}
