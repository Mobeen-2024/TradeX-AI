import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  Radio,
  ArrowUpRight,
  ShieldAlert,
  Activity,
  Cpu,
  Eye,
  BarChart2,
} from "lucide-react";
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  CandlestickSeries,
} from "lightweight-charts";
import { AIConfidenceRing } from "../ui/AIConfidenceRing";

function ExecutionLog() {
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const messages = [
      "SYSTEM: INITIALIZING QUANT-V4 KERNEL...",
      "AGENT: ANALYZING ORDER FLOW IMBALANCE AT $64,300...",
      "RISK_ENGINE: CHECKING MARGIN ALLOCATION. NORMAL.",
      "AGENT: DETECTED SPOOFING ALGORITHM ON L2 ASK MATRIX.",
      "SYSTEM: RECALIBRATING MICRO-TREND THRESHOLDS...",
    ];
    let i = 0;
    const interval = setInterval(() => {
      setLogs((prev) => [...prev.slice(-4), messages[i % messages.length]]);
      i++;
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-4 relative overflow-hidden flex flex-col font-mono text-[10px] leading-tight">
      <h3 className="text-gray-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-[#1a1a1a] pb-2">
        <Activity className="w-3.5 h-3.5 text-[#00f0ff]" />
        Execution Feed
      </h3>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-1.5 scroll-smooth"
      >
        {logs.map((log, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-gray-600">
              [{new Date().toISOString().split("T")[1].slice(0, -1)}]
            </span>
            <span
              className={
                log.startsWith("AGENT:")
                  ? "text-[#0ea5e9]"
                  : log.startsWith("RISK_ENGINE:")
                    ? "text-[#84cc16]"
                    : "text-gray-400"
              }
            >
              {log}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MarketChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#050505" },
        textColor: "#666",
      },
      grid: {
        vertLines: { color: "#111" },
        horzLines: { color: "#111" },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: "#1a1a1a",
      },
      rightPriceScale: {
        borderColor: "#1a1a1a",
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: "#0ea5e9",
          labelBackgroundColor: "#0ea5e9",
        },
        horzLine: {
          color: "#0ea5e9",
          labelBackgroundColor: "#0ea5e9",
        },
      },
    });

    chartRef.current = chart;

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#39ff14",
      downColor: "#ff4500",
      borderVisible: false,
      wickUpColor: "#39ff14",
      wickDownColor: "#ff4500",
    });

    candlestickSeriesRef.current = candlestickSeries;

    // Generate initial dummy data
    const initialData = [];
    let currentTime = Math.floor(Date.now() / 1000) - 86400 * 30; // 30 days ago
    let lastClose = 60000;

    for (let i = 0; i < 100; i++) {
      const open = lastClose;
      const close = open + (Math.random() - 0.5) * 1000;
      const high = Math.max(open, close) + Math.random() * 500;
      const low = Math.min(open, close) - Math.random() * 500;

      initialData.push({
        time: currentTime as any,
        open,
        high,
        low,
        close,
      });

      lastClose = close;
      currentTime += 86400; // Next day
    }

    candlestickSeries.setData(initialData);

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  return <div ref={chartContainerRef} className="w-full h-[400px]" />;
}

function TradeExecutionPanel() {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [orderType, setOrderType] = useState("limit");
  const [size, setSize] = useState("1.5");
  const [price, setPrice] = useState("64200.5");

  return (
    <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-4 flex flex-col h-full font-sans shadow-2xl relative overflow-hidden max-h-[900px]">
      {/* Decorative background glow */}
      <div
        className={`absolute -top-20 -right-20 w-40 h-40 blur-[80px] rounded-full pointer-events-none opacity-20 ${side === "buy" ? "bg-[#39ff14]" : "bg-[#ff4500]"}`}
      ></div>

      <div className="flex border border-[#222] rounded-sm overflow-hidden mb-5 sticky z-10 shrink-0 bg-[#0a0a0a]">
        <button
          onClick={() => setSide("buy")}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all border-r border-[#222] ${side === "buy" ? "bg-[#39ff14]/10 text-[#39ff14] shadow-[inset_0_-2px_0_#39ff14]" : "text-gray-500 hover:bg-white/5"}`}
        >
          Buy / Long
        </button>
        <button
          onClick={() => setSide("sell")}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all ${side === "sell" ? "bg-[#ff4500]/10 text-[#ff4500] shadow-[inset_0_-2px_0_#ff4500]" : "text-gray-500 hover:bg-white/5"}`}
        >
          Sell / Short
        </button>
      </div>

      <div className="flex gap-2 mb-5">
        {["limit", "market", "stop"].map((t) => (
          <button
            key={t}
            onClick={() => setOrderType(t)}
            className={`px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all shadow-none ${orderType === t ? "bg-[#1a1a1a] text-white border border-[#333]" : "bg-transparent text-gray-500 border border-transparent hover:bg-[#111]"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar pr-1 pb-4">
        {/* Price & Size */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-gray-500">Order Price (USDT)</span>
              <span className="text-gray-300">~ $64,200.50</span>
            </div>
            <div className="relative group">
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#222] rounded-sm py-2 px-3 text-white font-mono text-sm focus:outline-none focus:border-[#0ea5e9]/50 transition-colors"
                disabled={orderType === "market"}
              />
              {orderType === "market" && (
                <div className="absolute inset-0 bg-[#000]/50 flex items-center px-3 text-sm text-gray-500 font-mono">
                  Market Price
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-gray-500">Position Size (BTC)</span>
              <span className="text-gray-300 flex items-center gap-1">
                Max: 4.25
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#222] rounded-sm py-2 px-3 text-white font-mono text-sm focus:outline-none focus:border-[#0ea5e9]/50 transition-colors"
              />
            </div>
            <div className="flex gap-1 mt-2">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  className="flex-1 bg-[#111] hover:bg-[#1a1a1a] text-gray-400 py-1 text-[10px] font-mono rounded-sm border border-[#222] transition-colors"
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="h-px bg-[#1a1a1a] my-4"></div>

        {/* AI & Risk Metrics */}
        <div className="space-y-4">
          <div className="flex justify-between items-center group bg-[#050505] border border-[#1a1a1a] p-3 rounded-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#00f0ff]/5 blur-[20px]"></div>
            <div className="flex flex-col gap-1 relative z-10">
              <span className="text-[10px] uppercase tracking-widest text-[#00f0ff] font-bold flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" /> AI Confidence
              </span>
              <span className="text-[9px] text-gray-500 font-mono">
                Neural network analysis
              </span>
            </div>
            <AIConfidenceRing confidence={88} size={40} theme="cyan" />
          </div>

          <div className="flex justify-between items-center bg-[#facc15]/5 border border-[#facc15]/10 p-2 rounded-sm">
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#facc15]" /> Risk Score
            </span>
            <span className="text-[#facc15] font-mono text-xs font-bold border border-[#facc15]/20 bg-[#facc15]/10 px-1.5 py-0.5 rounded-sm">
              MED (4.2)
            </span>
          </div>
        </div>

        <div className="h-px bg-[#1a1a1a] my-4"></div>

        {/* TP / SL */}
        <div className="grid grid-cols-2 gap-3 mb-2">
          <div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-1.5">
              Take Profit
            </div>
            <input
              type="text"
              placeholder="Optional"
              className="w-full bg-[#0a0a0a] border border-[#222] rounded-sm py-1.5 px-2 text-white font-mono text-xs focus:outline-none focus:border-[#39ff14]/50"
            />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-1.5">
              Stop Loss
            </div>
            <input
              type="text"
              placeholder="Optional"
              className="w-full bg-[#0a0a0a] border border-[#222] rounded-sm py-1.5 px-2 text-white font-mono text-xs focus:outline-none focus:border-[#ff4500]/50"
            />
          </div>
        </div>

        {/* Summary */}
        <div className="bg-[#111] p-3 rounded-sm border border-[#222] space-y-2 mt-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-transparent to-[#1a1a1a] pointer-events-none"></div>
          <div className="flex justify-between text-[10px] font-mono text-gray-400 relative z-10">
            <span>Required Margin</span>
            <span className="text-white font-bold">~ $9,630.07</span>
          </div>
          <div className="flex justify-between text-[10px] font-mono text-gray-400 relative z-10">
            <span>Estimated Fee</span>
            <span className="text-white font-bold">~ $1.92</span>
          </div>
        </div>
      </div>

      <button
        className={`w-full py-3.5 rounded-sm font-bold tracking-widest uppercase text-sm mt-4 hover:brightness-110 transition-all flex items-center justify-center gap-2 relative overflow-hidden group shrink-0 ${side === "buy" ? "bg-[#39ff14] text-black shadow-[0_0_15px_rgba(57,255,20,0.15)]" : "bg-[#ff4500] text-white shadow-[0_0_15px_rgba(255,69,0,0.15)]"}`}
      >
        <div className="absolute inset-0 w-[150%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
        {side === "buy" ? "Execute Long" : "Execute Short"}
      </button>
    </div>
  );
}

export function LiveMarketsTab() {
  const [dataStream, setDataStream] = useState<number[]>(Array(50).fill(64200));

  useEffect(() => {
    // Simulate high-frequency data stream for small updates
    const interval = setInterval(() => {
      setDataStream((prev) => {
        const last = prev[prev.length - 1];
        const change = (Math.random() - 0.5) * 50;
        return [...prev.slice(1), last + change];
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      key="live-markets-v2"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col min-h-full pb-10 w-full"
    >
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#1a1a1a]">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1 flex items-center gap-3">
            <Radio className="w-6 h-6 text-[#0ea5e9]" />
            Live Market Feed
          </h1>
          <p className="text-gray-400 text-sm font-mono tracking-wide">
            AI-DRIVEN HIGH-FREQUENCY PIPELINE
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
              Latency
            </span>
            <span className="text-[#39ff14] font-mono text-sm">2.4ms</span>
          </div>
          <div className="h-8 w-[1px] bg-[#1a1a1a]"></div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
              Network
            </span>
            <span className="text-[#00f0ff] font-mono text-sm">Connected</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Main Chart Area (Spans 7 cols) */}
        <div className="col-span-1 xl:col-span-7 flex flex-col gap-6">
          <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-5 flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    BTC/USDT-PERP
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-[#39ff14]/10 text-[#39ff14] border border-[#39ff14]/30 text-xs font-mono font-bold">
                    LONG
                  </span>
                </div>
                <div className="font-mono text-4xl text-white font-medium flex items-center gap-2">
                  <span className="text-gray-500 text-2xl">$</span>
                  {dataStream[dataStream.length - 1].toFixed(1)}
                  <span className="text-[#39ff14] text-lg flex items-center mb-1">
                    <ArrowUpRight className="w-5 h-5 stroke-[3]" /> 2.14%
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {["1m", "5m", "15m", "1H", "4H", "1D"].map((time) => (
                  <button
                    key={time}
                    className={`px-4 py-1.5 rounded-sm text-xs font-bold cursor-pointer transition-all ${time === "1D" ? "bg-[#0ea5e9]/10 text-[#0ea5e9] border border-[#0ea5e9]/30" : "bg-[#0a0a0a] text-gray-500 hover:text-gray-300 border border-[#222]"}`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* TradingView / lightweight-charts Instance */}
            <div className="w-full border border-[#1a1a1a] rounded-sm bg-[#050505] relative flex flex-col pt-1">
              <MarketChart />

              {/* AI Trend Detection Overlay (Floating) */}
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-[#39ff14]/30 rounded-lg p-3 w-64 shadow-xl z-20">
                <h4 className="flex items-center gap-2 text-[#39ff14] font-mono font-bold text-[10px] uppercase mb-2">
                  <ShieldAlert className="w-3.5 h-3.5" /> Trend Divergence
                </h4>
                <p className="text-gray-300 text-xs leading-relaxed font-sans">
                  Bullish divergence forming on 4H OBV indicator. Institutional
                  accumulation detected.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Liquidity Heatmap */}
            <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-4 flex flex-col h-[200px]">
              <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#a855f7]" />
                Liquidity Heatmap
              </h3>
              <div className="flex-1 w-full flex flex-col gap-1 relative overflow-hidden">
                {/* Simulated Heatmap Blocks */}
                {[...Array(6)].map((_, r) => (
                  <div key={r} className="flex gap-1 flex-1">
                    {[...Array(12)].map((_, c) => {
                      const intensity = Math.random();
                      let color = "bg-[#111]";
                      if (intensity > 0.8) color = "bg-[#ff4500]";
                      else if (intensity > 0.6) color = "bg-[#facc15]";
                      else if (intensity > 0.4) color = "bg-[#00f0ff]";
                      return (
                        <div
                          key={c}
                          className={`flex-1 rounded-sm opacity-80 ${color}`}
                        ></div>
                      );
                    })}
                  </div>
                ))}
                {/* Overlay Text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="bg-black/80 px-3 py-1 font-mono text-xs text-white border border-[#222] rounded shadow-lg backdrop-blur">
                    Concentration at $64,800
                  </span>
                </div>
              </div>
            </div>

            {/* Volatility Meter */}
            <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-4 flex flex-col h-[200px]">
              <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#ff00f0]" />
                Implied Volatility
              </h3>
              <div className="flex-1 flex flex-col justify-center items-center relative">
                <div className="flex items-center gap-4 w-full px-6">
                  <div className="text-gray-500 font-mono text-xs">Low</div>
                  <div className="flex-1 h-3 bg-[#111] rounded-full overflow-hidden relative shadow-inner">
                    <div className="absolute top-0 left-0 h-full w-[78%] bg-gradient-to-r from-[#00f0ff] via-[#facc15] to-[#ff4500] rounded-full"></div>
                  </div>
                  <div className="text-gray-500 font-mono text-xs">High</div>
                </div>
                <div className="mt-4 text-center">
                  <span className="text-3xl font-bold font-sans text-white tracking-tight">
                    78.4
                  </span>
                  <span className="text-gray-500 font-mono text-[10px] ml-1">
                    IV Rank
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Book & Execution Log (Spans 2 cols) */}
        <div className="col-span-1 xl:col-span-2 flex flex-col gap-6">
          <div className="flex-1 bg-[#050505] border border-[#1a1a1a] rounded-sm p-4 flex flex-col relative overflow-hidden shadow-none max-h-[600px]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1a1a1a]">
              <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#00f0ff]" />
                L2 Order Book
              </h3>
            </div>

            {/* Asks (Red) */}
            <div className="flex-1 flex flex-col-reverse justify-end gap-[1px] font-mono text-[10px] overflow-hidden">
              {[...Array(18)].map((_, i) => {
                const price = (64200 + i * 1.5).toFixed(1);
                const size = (Math.random() * 5).toFixed(3);
                const sum = (Math.random() * 100).toFixed(1);
                const depth = Math.random() * 100;
                return (
                  <div
                    key={`ask-${i}`}
                    className="flex justify-between relative py-0.5 px-1 group cursor-pointer hover:bg-white/5"
                  >
                    <div
                      className="absolute top-0 right-0 h-full bg-[#ff4500]/15"
                      style={{ width: `${depth}%` }}
                    ></div>
                    <span className="text-[#ff4500] relative z-10 font-bold">
                      {price}
                    </span>
                    <span className="text-gray-400 relative z-10">{size}</span>
                    <span className="text-gray-600 relative z-10">{sum}</span>
                  </div>
                );
              })}
            </div>

            {/* Spread Display */}
            <div className="py-2 border-y border-[#222] my-1 flex justify-between items-center text-xs font-bold font-mono px-2 bg-[#0ea5e9]/5 rounded border border-[#0ea5e9]/20 shadow-[0_0_10px_rgba(14,165,233,0.1)] shrink-0">
              <span className="text-[#39ff14] flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5 mr-1" /> 64,198.5
              </span>
              <span className="text-[#00f0ff] text-[10px]">Spread: 1.5</span>
            </div>

            {/* Bids (Green/Teal) */}
            <div className="flex-1 flex flex-col gap-[1px] font-mono text-[10px] overflow-hidden">
              {[...Array(18)].map((_, i) => {
                const price = (64197 - i * 1.5).toFixed(1);
                const size = (Math.random() * 5).toFixed(3);
                const sum = (Math.random() * 100).toFixed(1);
                const depth = Math.random() * 100;
                return (
                  <div
                    key={`bid-${i}`}
                    className="flex justify-between relative py-0.5 px-1 group cursor-pointer hover:bg-white/5"
                  >
                    <div
                      className="absolute top-0 right-0 h-full bg-[#00f0ff]/10"
                      style={{ width: `${depth}%` }}
                    ></div>
                    <span className="text-[#0ea5e9] relative z-10 font-bold">
                      {price}
                    </span>
                    <span className="text-gray-400 relative z-10">{size}</span>
                    <span className="text-gray-600 relative z-10">{sum}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <ExecutionLog />
        </div>

        {/* Trade Execution Panel (Spans 3 cols) */}
        <div className="col-span-1 xl:col-span-3">
          <TradeExecutionPanel />
        </div>
      </div>
    </motion.div>
  );
}
