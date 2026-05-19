import { EventListener, EventType, EventDispatcher } from "../events";
import { NewsOracle } from "../agents/newsOracle";

export class NewsWorker {
  static initialize() {
    EventListener.subscribe(EventType.NEWS_PROCESSING_REQUESTED, async (payload) => {
      console.log(`[NewsWorker] Received news processing request for portfolio ${payload.portfolioId}`);
      try {
        await NewsOracle.analyzeSentiment(payload.portfolioId, payload.userId, payload.correlationId);
      } catch (err) {
        console.error(`[NewsWorker] error:`, err);
        throw err;
      }
    });
  }
}
