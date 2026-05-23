import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { EventListener, EventType } from "../events";
import jwt from "jsonwebtoken";

export class TelemetryServer {
  private static wss: WebSocketServer | null = null;

  static initialize(server: Server) {
    this.wss = new WebSocketServer({ server, path: "/ws/agent-telemetry" });

    this.wss.on("connection", (ws, req) => {
      let token = "";
      const authHeader = req.headers["authorization"];
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      } else if (req.url) {
        try {
          const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
          token = url.searchParams.get("token") || "";
        } catch (e) {
          // Ignore
        }
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
        (ws as any).user = decoded;
      } catch {
        ws.close(4001, "Unauthorized");
        return;
      }

      // Extract optional correlationId filter from query params
      const url = new URL(req.url || "", `http://${req.headers.host}`);
      const correlationIdFilter = url.searchParams.get("correlationId");

      console.log(`[Telemetry] Client connected. Correlation Filter: ${correlationIdFilter || 'None'}`);

      // Optional: attach filter to the connection object
      (ws as any).correlationIdFilter = correlationIdFilter;

      ws.on("close", () => {
        console.log("[Telemetry] Client disconnected.");
      });
    });

    // Started Subscriptions
    EventListener.subscribe(EventType.QUANT_ANALYSIS_REQUESTED, (payload) => this.broadcast(EventType.QUANT_ANALYSIS_REQUESTED, "QuantAgent", payload, "started"));
    EventListener.subscribe(EventType.RISK_VALIDATION_REQUESTED, (payload) => this.broadcast(EventType.RISK_VALIDATION_REQUESTED, "RiskGuardian", payload, "started"));
    EventListener.subscribe(EventType.NEWS_PROCESSING_REQUESTED, (payload) => this.broadcast(EventType.NEWS_PROCESSING_REQUESTED, "NewsOracle", payload, "started"));
    EventListener.subscribe(EventType.COORDINATOR_DECISION_REQUESTED, (payload) => this.broadcast(EventType.COORDINATOR_DECISION_REQUESTED, "Coordinator", payload, "started"));

    // Completed Subscriptions
    EventListener.subscribe(EventType.QUANT_ANALYSIS_COMPLETED, (payload) => this.broadcast(EventType.QUANT_ANALYSIS_COMPLETED, "QuantAgent", payload, "completed"));
    EventListener.subscribe(EventType.RISK_VALIDATED, (payload) => this.broadcast(EventType.RISK_VALIDATED, "RiskGuardian", payload, "completed"));
    EventListener.subscribe(EventType.NEWS_PROCESSED, (payload) => this.broadcast(EventType.NEWS_PROCESSED, "NewsOracle", payload, "completed"));
    EventListener.subscribe(EventType.COORDINATOR_DECISION_COMPLETED, (payload) => this.broadcast(EventType.COORDINATOR_DECISION_COMPLETED, "Coordinator", payload, "completed"));
    EventListener.subscribe(EventType.ORDER_EXECUTED, (payload) => this.broadcast(EventType.ORDER_EXECUTED, "ExecutionAgent", payload, "completed"));

    console.log("[Telemetry] Telemetry WebSocket Server initialized at /ws/agent-telemetry");
  }

  private static broadcast(eventType: EventType, agentName: string, payload: any, status: "started" | "completed" | "failed" = "completed") {
    if (!this.wss) return;

    const correlationId = payload?.correlationId;

    // Extract rich telemetry metadata
    let reasoning = "";
    let confidence = 0;
    let metrics: any = {};

    if (payload?.rawOutput) {
      reasoning = payload.rawOutput.aiRationale || "";
      confidence = payload.rawOutput.confidenceScore || 0;
      metrics = {
        marketRegime: payload.rawOutput.marketRegime,
        volatilityLevel: payload.rawOutput.volatilityLevel,
        strategyTag: payload.rawOutput.strategyTag,
        riskLevel: payload.rawOutput.riskLevel,
        marginRisk: payload.rawOutput.marginRisk,
        position_size: payload.rawOutput.position_size,
        sentiment: payload.rawOutput.sentiment,
      };
    } else if (payload?.decision) {
      reasoning = payload.decision.rationale || "";
      confidence = payload.decision.confidenceScore || 0;
      metrics = {
        action: payload.decision.action,
        strategyTag: payload.decision.strategyTag,
      };
    } else if (payload?.action) {
      metrics = {
        action: payload.action,
        orderId: payload.orderId,
      };
    }

    // Create the message to broadcast
    const messageObj = {
      correlationId: correlationId || "unknown",
      agent_name: agentName,
      status: status,
      timestamp: new Date().toISOString(),
      eventType: eventType,
      summary: this.extractSummary(eventType, payload),
      reasoning: reasoning || payload?.message || "",
      confidence: confidence,
      metrics: metrics,
    };

    const messageString = JSON.stringify(messageObj);

    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        const filter = (client as any).correlationIdFilter;
        // If client has no filter, or filter matches, send the message
        if (!filter || filter === correlationId) {
          client.send(messageString);
        }
      }
    });
  }

  static getClientCount(): number {
    return this.wss ? this.wss.clients.size : 0;
  }

  static broadcastGlobal(message: any) {
    if (!this.wss) return;
    const msgString = JSON.stringify(message);
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msgString);
      }
    });
  }

  private static extractSummary(eventType: EventType, payload: any): string {
    switch (eventType) {
      case EventType.QUANT_ANALYSIS_REQUESTED:
        return "Quant analysis requested";
      case EventType.RISK_VALIDATION_REQUESTED:
        return "Risk validation requested";
      case EventType.NEWS_PROCESSING_REQUESTED:
        return "News processing requested";
      case EventType.COORDINATOR_DECISION_REQUESTED:
        return "Coordinator decision logic requested";
      case EventType.QUANT_ANALYSIS_COMPLETED:
        return payload?.marketRegime ? `Regime: ${payload.marketRegime}` : "Quant analysis completed";
      case EventType.RISK_VALIDATED:
        return payload?.riskLevel ? `Risk Level: ${payload.riskLevel}` : "Risk validation completed";
      case EventType.NEWS_PROCESSED:
        return payload?.sentiment ? `Sentiment: ${payload.sentiment}` : "News processed";
      case EventType.COORDINATOR_DECISION_COMPLETED:
        return payload?.decision?.action ? `Decision: ${payload.decision.action}` : "Coordinator decision logic executed";
      case EventType.ORDER_EXECUTED:
        return payload?.action ? `Executed ${payload.action} order (${payload.orderId})` : "Execution Agent handled order";
      default:
        return "Completed";
    }
  }
}
