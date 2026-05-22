import { EventQueueLogsRepository } from "../db/repositories/eventQueueLogs";
import { EventDispatcher, EventType } from "../events";

export class EventQueueService {
  static async scanPendingEvents() {
    const rows = await EventQueueLogsRepository.markOrphanedPendingAsFailed();
    for (const row of rows) {
      console.log(`[EventRetryWorker] Marked orphaned PENDING event ${row.id} as FAILED`);
    }
  }

  static async scanFailedEvents() {
    const rows = await EventQueueLogsRepository.getFailedEventsForRetry();
    for (const row of rows) {
      if (row.retry_count >= 3) {
        console.log(`[EventRetryWorker] Max retries reached for event ${row.id}, marking as DEAD_LETTER`);
        await EventDispatcher.markDeadLetter(row.id);
      } else {
        console.log(`[EventRetryWorker] Retrying event ${row.id} (attempt ${row.retry_count + 1})`);
        await EventDispatcher.dispatchExisting(row.id, row.event_type as EventType, row.payload);
      }
    }
  }
}
