# ⚡ TradeX OS - Advanced Quantitative System

<div align="center">
  <p><strong>An institutional-grade, multi-agent trading operating system powered by semantic memory, strategy evolution, and context-aware capital allocation.</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/PostgreSQL-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google Gemini API" />
  </p>
</div>

![TradeX OS Architecture Banner](https://via.placeholder.com/1200x400/050505/00f0ff?text=TradeX+OS+%7C+Autonomous+Hedge-Fund+Intelligence)

## 📌 Executive Summary

TradeX OS is a state-of-the-art, full-stack quantitative trading platform engineered around a highly cooperative multi-agent AI framework. Designed for the modern era of algorithmic finance, TradeX bridges high-fidelity execution realism, strict algorithmic risk controls, dynamic capital allocation, and evolutionary genetic strategies under a highly available node event-driven architecture. 

It is constructed not merely as a dashboard, but as a headless autonomous financial daemon paired with a real-time reactive interface.

---

## 🔥 Key Architectural Pillars

### 1. 🧠 Multi-Agent AI Orchestration
The system abandons monolithic trading setups in favor of a specialized intelligence network:
- **QuantAgent**: Conducts structural pattern recognition, identifying underlying market regimes (Bull, Bear, Choppy) and systemic volatility bands.
- **RiskGuardian**: A mandatory compliance firewall. It pre-validates every trade intention against margin constraints, systemic drawdowns, and historic performance.
- **Coordinator (CIO)**: Synthesizes multi-dimensional outputs from internal agents and external NewsOracles to manifest highly convicted, correctly sized execution orders.
- **ExecutionAgent**: Intercepts the Coordinator's mandate, adjusting adaptive sizing logic and streaming commands to simulated or live Testnet environments.

### 2. 🧬 Context-Aware Strategy Evolution
TradeX actively manages a portfolio of systemic strategies:
- **Genetic Strategy Mutation**: Actively prunes bottom-percentile strategies and utilizes LLM genetics to dynamically mutate parameters of winning strategies to discover untouched market edges.
- **Context-Aware Capital Allocation**: Evaluates expected values, Sharpe scores, and win rates dynamically mapped to the *current Market Regime and Volatility profile*. Rather than static distributions, capital flows toward the strategies proving highly adapted to absolute present conditions.

### 3. 💾 Semantic Experience Logging (Vector Memory)
- Leverages PostgreSQL & `pgvector` to persist complex market state contexts into multi-dimensional memory maps.
- Rather than ignoring past mistakes, trade outcomes (both alphas and losses) are backpropagated into the `semantic_memory_logs`. Multi-agents independently query these logs prior to executing decisions to prevent repeated historic failures.

### 4. ⚡ Event-Driven Engine & Telemetry
- De-coupled architecture relying on an abstracted `EventDispatcher` layer.
- Enables sub-millisecond asynchronous messaging between market data aggregators, intelligence agents, database risk-loggers, and UI telemetry websockets without blocking the primary event loop.

---

## 🛠 Advanced Tech Stack

**The Headless Daemon (Backend):**
- **Runtime**: Node.js & TypeScript
- **Database**: PostgreSQL configured with `pgvector` for AI similarity checks.
- **AI Integration**: Google Gemini Models (`@google/genai`) for complex synthesis, genetic generation, and semantic comprehension.
- **Exchange Integration**: Configurable standard Binance API connectors.
- **Design Pattern**: Domain-Driven Design (Workers, Services, Event Bus, Agents).

**The Terminal (Frontend):**
- **Core Engine**: React 18 & Vite ensuring modular Hot-Module-Replacement.
- **Aesthetic System**: Fully tokenized Tailwind CSS v4.
- **System Monitoring**: WebSockets mapped seamlessly to systemic back-end telemetry.

---

## 📈 Recent Improvements

- **Robust Event Bus:** Implemented a PostgreSQL-backed event bus with automatic mock-DB fallback and an event retry worker.
- **Enhanced Configuration:** Injected a fetch override script and updated the document title to "TradeX AI".
- **Performance Optimizations:** Optimized the `LiveMarketsTab` to stabilize mock data generation using `useMemo`.
- **Accessibility & UX Enhancements:** Added comprehensive ARIA labels and improved focus states across components such as `AuthFlow`, `TopIntelligenceBar`, and `AIVoiceAssistant` to ensure a more accessible and user-friendly experience.

---

## 🚀 Deployment & Installation

### Prerequisites

Ensure you have a modern Node.js environment:
- **Node.js** v20.x or higher
- **npm** or **yarn** or **pnpm**

### Step-by-Step Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/tradex-terminal.git
   cd tradex-terminal
   ```

2. **Hydrate dependencies**:
   ```bash
   npm install
   ```

3. **Secure Environment Variables**:
   Replicate the `.env.example` structure. The engine fundamentally requires a Google Gemini Key to activate the AI pipelines.
   ```bash
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Launch the Operating System**:
   ```bash
   npm run dev
   ```
   The terminal will boot locally on `http://localhost:3000`.

---

## 📂 System Topology Matrix

```text
src/
├── agents/             # Micro-Agents (Coordinator, Quant, Risk, Execution)
├── db/                 # Persistence Layer (Migrations, pgvector schemas, Repositories)
├── events/             # System-wide decoupled Event Dispatcher (Pub/Sub)
├── services/           # Algorithmic Services (Capital Allocation, Eval, Memory, Execution)
├── workers/            # Daemon Background Processes (Metrics Worker, Strategy Evolver)
├── telemetry/          # WebSocket broadcasters for UI live-feed visual mappings
├── server.ts           # Primary Daemon bootstrapper & API gateway
└── components/         # Frontend intelligence interfaces
```

---

## 🚀 Node & Daemon Initialization

### 1. Prerequisites
Ensure you have a modern stack:
- **Node.js** v20.x+
- **PostgreSQL Database** with the `pgvector` extension natively installed.

### 2. Hydration
```bash
git clone https://github.com/organization/tradex-os.git
cd tradex-os
npm install
```

### 3. Secure Environmental Payload
Populate your runtime configurations. The terminal requires a Google Gemini Key (for the core Multi-Agent framework), and a standard Postgres DB hook for internal event tracing.
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/tradex
GEMINI_API_KEY=your_gemini_platform_key

# Optional
BINANCE_API_KEY=your_testnet_key
BINANCE_SECRET_KEY=your_testnet_secret
```

### 4. Ignite the Runtime
The boot sequence automatically resolves DB migrations, spins up Event Listeners, ignites Background Workers, and exposes the User Terminal.
```bash
npm run build
npm start
```
The operations interface will boot autonomously on `http://localhost:3000`.

---

## 🛑 Strict Protocol Notices
*This software is primarily structured as an advanced technological demonstration of applied AI agents in time-series deterministic environments. TradeX OS acts upon testnet environments safely but involves advanced risk algorithms that should never operate unregulated real-world capital without severe comprehensive proprietary audits.*
