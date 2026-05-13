# ⚡ TradeX Terminal

<div align="center">
  <p><strong>An intelligent financial command center and adaptive hedge-fund operating system powered by multi-agent AI.</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google Gemini API" />
  </p>
</div>

![TradeX Terminal Banner](https://via.placeholder.com/1200x400/050505/00f0ff?text=TradeX+Terminal+%7C+AI-Powered+Hedge-Fund+OS)

## 📌 Architectural Overview

TradeX Terminal is not merely a trading dashboard—it is a **next-generation, autonomous financial operating system**. Engineered for institutional-grade market analysis and strategy execution, it melds low-latency market infrastructure with the cognitive reasoning capabilities of Google's Gemini models.

Built with a focus on maximum performance, rigorous type safety, and futuristic, cyberpunk-inspired UI/UX aesthetics, TradeX provides a highly integrated environment for quantitative analysts and technical asset managers.

---

## 🔥 Key Institutional Features

### 1. Multi-Agent AI Framework
The system is underpinned by specialized orchestrating agents:
- **Quant Strategy Agent:** Deploys deep historical models to continuously generate alphas.
- **Risk-Guardian Agent:** A dedicated firewall agent validating risk limits, margin capacity, and max drawdowns before execution.
- **News/Sentiment Oracle:** Ingests macro headlines and maps linguistic sentiment to real-time asset volatility vectors.

### 2. The Agent Memory Vault
TradeX's standout capability is **Semantic Experience Logging**. 
- **Pattern Retrieval:** By mapping complex market conditions into vector space, the AI engine can recall identical past environments.
- **Backpropagation & Self-Correction:** Each trade outcome—especially mistakes—is logged with a semantic loss-attribution vector, actively mutating the system’s execution thresholds to ensure historical failures are never repeated.

### 3. Hyper-Visual Live Market Deck
Our bespoke charting interface utilizes `lightweight-charts` to provide highly optimized Canvas rendering:
- Real-time Orderbook streaming overlays.
- Simulated Liquidity Heatmaps dynamically uncovering hidden bid/ask walls.
- Integrated AI Predictive paths overlaid onto traditional candlesticks.

### 4. Dynamic Market Regimes
The UI acts as a living reflection of market states. Depending on macro momentum (Bullish, Bearish, Sideways, High-Vol), the entire UI applies specialized color palettes and structural focuses (e.g., heightened risk warnings during volatility spikes) via adaptive state contexts.

### 5. Interactive Voice Command Pipeline
Trade hands-free via our experimental Voice Agent wrapper. Using the power of LLMs, users can request structural insights or execute simulated bracket orders purely via natural language.

---

## 🛠 Advanced Tech Stack

Engineered to handle intensive real-time loads and continuous DOM mutations without compromising latency:

- **Core Engine**: React 19 combined with Vite for exceptional Hot-Module-Replacement and lightweight bundling.
- **Typing Framework**: Strict TypeScript configurations preventing runtime execution errors.
- **Aesthetic System**: Tailwind CSS v4 paired with Framer Motion to craft purposeful UI micro-interactions and glassmorphism bounds.
- **Charting Engine**: TradingView's Lightweight Charts ensuring 60fps chart repainting even under heavy data loads.
- **Intelligence Layer**: `@google/genai` (Google Gemini SDK) injected directly into analytical pipelines.

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

## 📂 System Architecture Directory

```text
src/
├── components/           # The structural building blocks
│   ├── tabs/             # Heavyweight view controllers (Live Markets, Memory, Risk)
│   ├── auth/             # Biometric-simulated entry points
│   └── ui/               # Granular atomic components (AI Confidence rings, panels)
├── contexts/             # Global states (Market Regime, Agent Protocol)
├── services/             # Extraneous API layers and LLM integration stubs
├── utils/                # Mathematical helpers and calculation constraints
├── App.tsx               # Primary layout grid and routing shell
└── index.css             # Tailwind baseline and custom WebKit scrollbars
```

---

## 🤝 Open Source Contribution

TradeX is built for the community. If you are a Quant or Frontend Engineer looking to implement complex financial interfaces, we welcome PRs:

1. Fork the project.
2. Initialize your feature branch (`git checkout -b impl/quant-layer`).
3. Commit systematically (`git commit -m 'feat: Add orderflow imbalance calculations'`).
4. Push to remote (`git push origin impl/quant-layer`).
5. Open a well-documented Pull Request.

---

## 📜 Legal Matrix

This software operates under the Apache-2.0 License. See the `LICENSE` file for distribution rights.
*Notice: TradeX Terminal currently operates on simulated execution loops and should not be attached to live capital without extensive proprietary modification.*
