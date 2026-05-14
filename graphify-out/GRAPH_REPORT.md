# 🕸️ Graphify Knowledge Report
**Project:** TradeX OS
**Date:** 2026-05-14
**Nodes Scanned:** 24
**Edges Mapped:** 42

## 🚀 Key Concepts Discovered
- **Terminal-Based Hybrid UI:** The application (TradeX OS) employs a highly futuristic, zero-friction glassmorphic & terminal-based UI for trading operations. Features an integrated `AIVoiceAssistant`.
- **Live Markets & Multi-Timeframe Logic:** The system uses `lightweight-charts` within `LiveMarketsTab.tsx` to handle synthetic and binance WebSocket streaming data. Deeply integrated with predictive AI projection paths (Most Likely, Alt Scenario, and High-Risk probabilities) using confidence cones.
- **Market Regime Context:** Driven by `MarketRegimeContext.tsx`, dynamically modifying the ambient glow and styling in `App.tsx` depending on whether the market is *bull*, *bear*, *neutral*, or *volatile*.
- **Agentic & Execution Framework:** Elements like `SimulationEngineTab`, `AutoTradingTab`, `AIAgentsTab`, and `WorkflowsTab` hint at a highly advanced agentic simulation logic loop, delegating tasks across different sub-agents.
- **State Management:** Zustand hooks (`intelligenceStore.ts`) likely manage global intelligence overlays seamlessly between charts, sidebar layouts, and system telemetry feeds.

## 🔗 Surprising Connections
- **Mobile vs Desktop Split:** `App.tsx` has parallel structural trees for desktop (`Sidebar`, `MainContent`, `TopIntelligenceBar`, `BottomSystemTerminal`) and mobile (`MobileApp.tsx`), ensuring absolute performance segmentation.
- **`AIVoiceAssistant` Global State:** Sitting entirely globally outside the main DOM tree structures `z-50`, ready to be summoned over any module.

## ❓ Suggested Queries for the Graph
* "Show me all nodes related to data visualization and chart overlays."
* "How is the WebSocket data propagated to the lightweight-charts references?"
* "What exactly triggers the `marketRegime` context state changes?"
* "How are 'Confidence Cones' painted on the Live Markets Tab?"

## 📊 Dependency Clusters
1. **Visualization Cluster:** `LiveMarketsTab.tsx`, `lightweight-charts`, `.setData()`, `coneUpperSeries`, `coneLowerSeries`.
2. **Context & Theme:** `App.tsx`, `Sidebar.tsx`, `MarketRegimeContext.tsx`, global tailwind.
3. **Execution & Automation:** `AutoTradingTab.tsx`, `SimulationEngineTab.tsx`, `AIAgentsTab.tsx`.

---
*Generated mathematically by Graphify AI.*
