# TradeX Terminal

<div align="center">
  <p><strong>An intelligent financial command center and adaptive hedge-fund operating system.</strong></p>
</div>

![TradeX Terminal Banner](https://via.placeholder.com/1200x400/050505/00f0ff?text=TradeX+Terminal+%7C+AI-Powered+Hedge-Fund+OS)

## 📌 Overview

TradeX Terminal is a next-generation, AI-driven financial operating system designed for institutional-grade market analysis, autonomous execution, and strategy generation. With a focus on performance, type safety, and futuristic UI/UX aesthetics, TradeX provides a comprehensive suite of tools ranging from real-time market data visualization to multi-agent artificial intelligence protocols.

The platform serves as a modern command center for quantitative analysts and technical traders, featuring real-time insights, semantic pattern recognition, deep historical backtesting, and a centralized agent memory vault.

---

## ⚡ Key Features

- **Command Center & Dashboard**: High-level telemetry covering major asset classes, macro trends, and core portfolio metrics.
- **AI-Powered Voice Assistant**: Context-aware voice interactions utilizing Google GenAI for seamless execution and querying.
- **Real-Time Market Intelligence**: High-performance, real-time charting using Lightweight Charts, providing deep liquidity heatmap analysis, predictive tracking, and volume profiles.
- **Multi-Agent Protocol**: Orchestrates specialized AI agents (Quant, Sentiment, Risk, execution) collaborating to achieve optimal trading outcomes.
- **Agent Memory Vault**: Semantic logging of the AI experience. The system records decisions, trades, and mistakes, utilizing vector similarity to recover past patterns and improve execution precision over time.
- **Risk Management System**: Deep risk bounds setting, exposure tracking, and automatic dynamic hedging recommendations.
- **Adaptive Market Regimes**: The UI dynamically responds to market states (Bull, Bear, Volatile, Neutral), altering aesthetics and visualizations to match the underlying market sentiment.

---

## 🛠 Tech Stack

TradeX Terminal is built with a modern, high-performance web architecture:

- **Framework**: React 19 / Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, Framer Motion (for polished, purposeful animations)
- **State Management**: Zustand
- **Charting & Data Viz**: Lightweight Charts, Recharts
- **AI Integration**: `@google/genai` (Google Gemini models)
- **Icons**: Lucide React

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:
- **Node.js** (v20+ recommended)
- **npm** or **yarn**

### Installation

1. **Clone the repository** (if applicable):
   ```bash
   git clone https://github.com/your-username/tradex-terminal.git
   cd tradex-terminal
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file based on `.env.example` in the root of your project and configure any necessary API keys (like Google Gemini API Key or Binance API for live feeds).
   ```bash
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   The application will start on `http://localhost:3000`.

---

## 📂 Project Structure

```text
src/
├── components/          # Reusable UI elements and complex widgets
│   ├── tabs/            # Main application tab views (Live Markets, Risk, Memory, etc.)
│   ├── auth/            # Authentication flows
│   └── ui/              # Base UI components (buttons, confidence rings, modals)
├── contexts/            # React context providers (e.g., Market Regime)
├── App.tsx              # Main application entry point and layout shell
├── index.css            # Global CSS and Tailwind directives
└── main.tsx             # React bootstrap
```

---

## 🧠 The Agent Memory Vault

A standout feature of TradeX Terminal is the **Agent Memory Vault**. It serves as a semantic log where the AI engine records its life-cycle events—both successes and failures. 
- **Pattern Recovery**: By evaluating vector distance and similarity search, the engine can recall past identical market conditions.
- **Self-Correction**: Mistakes are logged with a loss attribution vector, automatically updating neural weights via simulated backpropagation.
- **UI Experience**: Designed with a futuristic interface featuring interactive timeline event picking, animated glow effects, and extensive telemetry data points for an institutional feel.

---

## 🤝 Contributing

We welcome contributions to TradeX Terminal! To contribute:

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📜 License

This project is licensed under the Apache-2.0 License. See the `LICENSE` file for more details.
