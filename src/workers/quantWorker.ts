import { EventListener, EventType, EventDispatcher } from "../events";
import { QuantAgent } from "../agents/quantAgent";

export class QuantWorker {
  static initialize() {
    EventListener.subscribe(EventType.QUANT_ANALYSIS_REQUESTED, async (payload) => {
      console.log(`[QuantWorker] Received request for portfolio ${payload.portfolioId}`);
      try {
        await QuantAgent.analyzeMarket(payload.portfolioId, payload.userId, payload.correlationId);
      } catch (err) {
        console.error(`[QuantWorker] error:`, err);
        throw err;
      }
    });
  }
}

