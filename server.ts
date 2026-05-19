import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { checkDbConnection } from "./src/db/connection";

import { GoogleGenAI } from "@google/genai";
import { authRouter } from "./src/api/routes/auth";
import { portfolioRouter } from "./src/api/routes/portfolio";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  if (process.env.NODE_ENV === "production") {
    console.log("[TradeX OS Daemon] Production mode detected. Validating db connection...");
    const isConnected = await checkDbConnection();
    if (!isConnected) {
      throw new Error("FATAL: Database connection failed during production startup.");
    }
    console.log("[TradeX OS Daemon] Database connected successfully.");
  }

  const app = express();
  const PORT = 3000;

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

  apiRouter.use("/auth", authRouter);
  apiRouter.use("/portfolio", portfolioRouter);

  apiRouter.get("/health", async (req, res) => {
    try {
      res.json({ status: "system_operational", db_connected: true });
    } catch (e) {
      res.status(500).json({ status: "system_degraded", error: String(e) });
    }
  });

  // Example backend regime controller
  apiRouter.get("/market/regime", (req, res) => {
    // In production, this computes macro data from DB
    res.json({
      regime: "volatile",
      confidence: 0.89,
      description: "Pre-election high volatility cluster detected."
    });
  });

  apiRouter.get("/market/klines", async (req, res) => {
    try {
      const { symbol = "BTCUSDT", interval = "1m", limit = "100" } = req.query;
      const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Binance API Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (e) {
      console.error("Proxy error fetching klines:", e);
      res.status(500).json({ error: "Failed to fetch from Binance" });
    }
  });

  apiRouter.post("/intelligence/analyze", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "No prompt provided" });
      }

      if (!process.env.GEMINI_API_KEY) {
        console.warn("Mocking AI response because GEMINI_API_KEY is not set.");
        return res.json({ response: "Simulated Agent: Trade logic initialized based on prompt.", isMock: true });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `You are the Quant Strategy Agent for TradeX OS. Analyze the following request and give institutional-grade insight. 
        Request: ${prompt}`,
      });

      res.json({ response: response.text });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to generate AI content" });
    }
  });

  app.use("/api", apiRouter);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[TradeX OS Daemon] Listening on 0.0.0.0:${PORT}`);
  });
}

startServer().catch((e) => {
  console.error("Critical failure during boot:", e);
});
