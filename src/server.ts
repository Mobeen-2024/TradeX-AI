import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { checkDbConnection } from "./db/connection";
import { EventListener } from "./events";
import { Coordinator } from "./agents/coordinator";
import { QuantWorker } from "./workers/quantWorker";
import { RiskWorker } from "./workers/riskWorker";
import { NewsWorker } from "./workers/newsWorker";
import { EventRetryWorker } from "./workers/eventRetryWorker";
import { MetricsWorker } from "./workers/metricsWorker";
import { StrategyEvolutionWorker } from "./workers/strategyEvolutionWorker";
import { ExecutionAgent } from "./agents/executionAgent";
import { TelemetryServer } from "./telemetry";

import { GoogleGenAI } from "@google/genai";
import { authRouter } from "./api/routes/auth";
import { portfolioRouter } from "./api/routes/portfolio";
import { memoryRouter } from "./api/routes/memory";
import { marketRouter } from "./api/routes/market";
import { intelligenceRouter } from "./api/routes/intelligence";
import { eventsRouter } from "./api/routes/events";
import { systemRouter } from "./api/routes/system";
import { overridesRouter } from "./api/routes/overrides";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  if (process.env.NODE_ENV === "production") {
    console.log(
      "[TradeX OS Daemon] Production mode detected. Validating environment...",
    );
    if (!process.env.GEMINI_API_KEY) {
      console.warn(
        "WARNING: GEMINI_API_KEY is missing during production startup.",
      );
    }
    if (!process.env.JWT_SECRET) {
      console.warn(
        "WARNING: JWT_SECRET is missing during production startup. Using default.",
      );
      process.env.JWT_SECRET = "default-secret-do-not-use-in-real-prod";
    }

    console.log("[TradeX OS Daemon] Validating db connection...");
    const isConnected = await checkDbConnection();
    if (!isConnected) {
      console.warn(
        "WARNING: Database connection failed during production startup. Continuing with mock DB.",
      );
    }
    console.log("[TradeX OS Daemon] Startup checks complete.");
  } else {
    // Also try to connect in dev to initialize EventListener correctly
    await checkDbConnection();
  }

  try {
    console.log("[TradeX OS Daemon] Initializing EventListener and Workers...");
    await EventListener.initialize();
    Coordinator.initialize();
    QuantWorker.initialize();
    RiskWorker.initialize();
    NewsWorker.initialize();
    ExecutionAgent.initialize();
    MetricsWorker.initialize();
    EventRetryWorker.initialize();
    StrategyEvolutionWorker.initialize();

    const { AllocationWorker } = require("./workers/allocationWorker");
    AllocationWorker.initialize();
  } catch (e) {
    console.error(
      "[TradeX OS Daemon] Failed to initialize EventListener/Workers:",
      e,
    );
  }

  const app = express();
  const PORT = 3000;
  const httpServer = require("http").createServer(app);

  app.use(express.json());

  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/health/db", async (req, res) => {
    try {
      const isConnected = await checkDbConnection();
      if (isConnected) {
        res.json({ status: "ok", db: "connected" });
      } else {
        res.status(500).json({ status: "error", db: "disconnected" });
      }
    } catch (e) {
      res.status(500).json({ status: "error", message: String(e) });
    }
  });

  // API Layer - Core Endpoints
  const apiRouter = express.Router();

  // Public APIs should be registered before routers that apply global auth middlewares
  apiRouter.get("/market/klines", async (req, res) => {
    try {
      const { symbol = "BTCUSDT", interval = "1m", limit = "100" } = req.query;
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
      );

      if (!response.ok) {
        throw new Error(
          `Binance API Error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      res.json(data);
    } catch (e) {
      console.error("Proxy error fetching klines:", e);
      res.status(500).json({ error: "Failed to fetch from Binance" });
    }
  });

  // Example backend regime controller
  apiRouter.get("/market/regime", (req, res) => {
    // In production, this computes macro data from DB
    res.json({
      regime: "volatile",
      confidence: 0.89,
      description: "Pre-election high volatility cluster detected.",
    });
  });

  apiRouter.use("/auth", authRouter);
  apiRouter.use("/portfolio", portfolioRouter);
  apiRouter.use("/memory", memoryRouter);
  apiRouter.use("/market", marketRouter);
  apiRouter.use("/intelligence", intelligenceRouter);
  apiRouter.use("/events", eventsRouter);
  apiRouter.use("/system", systemRouter);
  apiRouter.use("/overrides", overridesRouter);

  apiRouter.get("/health", async (req, res) => {
    try {
      res.json({ status: "system_operational", db_connected: true });
    } catch (e) {
      res.status(500).json({ status: "system_degraded", error: String(e) });
    }
  });

  app.use("/api", apiRouter);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { server: httpServer },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
    app.use(
      "/graphify-out",
      express.static(path.join(process.cwd(), "graphify-out")),
    );
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.use(
      "/graphify-out",
      express.static(path.join(process.cwd(), "graphify-out")),
    );
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.on("error", (e: any) => {
    if (e.code === "EADDRINUSE") {
      console.error(`[TradeX OS Daemon] Port ${PORT} is in use, retrying...`);
      setTimeout(() => {
        httpServer.close();
        httpServer.listen(PORT, "0.0.0.0");
      }, 1000);
    } else {
      console.error("[TradeX OS Daemon] HTTP Server Error", e);
    }
  });

  const server = httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`[TradeX OS Daemon] Listening on 0.0.0.0:${PORT}`);
  });

  // Initialize Telemetry Server
  try {
    TelemetryServer.initialize(server);
  } catch (e) {
    console.error("Failed to load telemetry server", e);
  }
}

startServer().catch((e) => {
  console.error("Critical failure during boot:", e);
});
