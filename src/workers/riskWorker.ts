import { EventListener, EventType, EventDispatcher } from "../events";
import { RiskGuardian } from "../agents/riskGuardian";

export class RiskWorker {
  static initialize() {
    EventListener.subscribe(EventType.RISK_VALIDATION_REQUESTED, async (payload) => {
      console.log(`[RiskWorker] Received risk validation request for portfolio ${payload.portfolioId}`);
      try {
        await RiskGuardian.evaluateRisk(payload.portfolioId, payload.userId, payload.correlationId);
      } catch (err) {
        console.error(`[RiskWorker] error:`, err);
        throw err;
      }
    });
  }
}
