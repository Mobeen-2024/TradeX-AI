import { EventQueueService } from "../services/eventQueueService";

export class EventRetryWorker {
  private static interval: NodeJS.Timeout | null = null;

  static initialize() {
    if (this.interval) return;
    console.log("[EventRetryWorker] Initializing...");

    // Scan every 30 seconds
    this.interval = setInterval(async () => {
      try {
        await EventQueueService.scanPendingEvents();
        await EventQueueService.scanFailedEvents();
      } catch (err) {
        console.error(`[EventRetryWorker] Scan error:`, err);
      }
    }, 30000);

    // Initial run
    setTimeout(() => {
      EventQueueService.scanPendingEvents().catch(err => console.error(`[EventRetryWorker] Initial scan error:`, err));
      EventQueueService.scanFailedEvents().catch(err => console.error(`[EventRetryWorker] Initial scan error:`, err));
    }, 5000);
  }

  static shutdown() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}
