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
  Crosshair,
  Layers,
} from "lucide-react";
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  CandlestickSeries,
  LineSeries,
  createSeriesMarkers,
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

  const [aiInsight, setAiInsight] = useState({
    title: "Trend Divergence",
    desc: "Bullish divergence forming on 4H OBV indicator. Institutional accumulation detected.",
    confidence: 92,
    theme: "green" as "green" | "cyan" | "orange",
    label: "Predictive State Active"
  });

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
        background: { type: ColorType.Solid, color: "transparent" },
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
          style: 3, // dashed
        },
        horzLine: {
          color: "#0ea5e9",
          labelBackgroundColor: "#0ea5e9",
          style: 3, // dashed
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

    // AI Prediction Series (Line)
    const predictionSeries = chart.addSeries(LineSeries, {
      color: '#00f0ff',
      lineWidth: 2,
      lineStyle: 3, // Dashed line for prediction
      crosshairMarkerVisible: false,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    // Support/Resistance Series (Line)
    const supportSeries = chart.addSeries(LineSeries, {
      color: '#39ff14',
      lineWidth: 1,
      lineType: 0,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });

    const resistanceSeries = chart.addSeries(LineSeries, {
      color: '#ff4500',
      lineWidth: 1,
      lineType: 0,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });

    // Generate initial dummy data
    const initialData = [];
    let currentTime = Math.floor(Date.now() / 1000) - 86400 * 100; // 100 days ago
    let lastClose = 50000;

    const markers: any[] = [];

    for (let i = 0; i < 100; i++) {
        // Build an uptrend then downtrend
      const open = lastClose;
      const trend = Math.sin(i / 15) * 500;
      const close = open + trend + (Math.random() - 0.5) * 1500;
      const high = Math.max(open, close) + Math.random() * 800;
      const low = Math.min(open, close) - Math.random() * 800;

      initialData.push({
        time: currentTime as any,
        open,
        high,
        low,
        close,
      });

      // Add AI Markers randomly
      if (i === 20) {
          markers.push({ time: currentTime, position: 'belowBar', color: '#00f0ff', shape: 'arrowUp', text: 'AI Accumulation Zone', size: 1.5 });
      } else if (i === 50) {
          markers.push({ time: currentTime, position: 'aboveBar', color: '#ff4500', shape: 'arrowDown', text: 'AI Distribution Detected', size: 1.5 });
      } else if (i === 80) {
          markers.push({ time: currentTime, position: 'belowBar', color: '#39ff14', shape: 'circle', text: 'Bullish Divergence', size: 1.5 });
      }

      lastClose = close;
      currentTime += 86400; // Next day
    }

    candlestickSeries.setData(initialData);
    
    // Add Markers to Candlestick Series
    const markerPlugin = createSeriesMarkers(candlestickSeries, markers);

    // Add Prediction line for the future
    const lastDataPoint = initialData[initialData.length - 1];
    let predictionData: any[] = [];
    let predTime = (lastDataPoint.time as number);
    let predVal = lastDataPoint.close;
    
    predictionData.push({ time: predTime as any, value: predVal });
    for(let j=1; j<=10; j++) {
        predTime += 86400;
        predVal += 200 + (Math.random() * 300); // Upward bias
        predictionData.push({ time: predTime as any, value: predVal});
    }
    predictionSeries.setData(predictionData);

    // Support and Resistance logic
    let supportData: any[] = [];
    let resistanceData: any[] = [];
    let minLow = Math.min(...initialData.map(d => d.low));
    let maxHigh = Math.max(...initialData.map(d => d.high));

    // Fill S/R lines across the timeframe
    for (const dp of initialData) {
        supportData.push({ time: dp.time, value: minLow + 1000 });
        resistanceData.push({ time: dp.time, value: maxHigh - 1000 });
    }
    
    const initialSupportData = [...supportData];
    const initialResistanceData = [...resistanceData];

    // Also extend to prediction
    for (let i = 1; i < predictionData.length; i++) {
        const dp = predictionData[i];
        initialSupportData.push({ time: dp.time, value: minLow + 1000 });
        initialResistanceData.push({ time: dp.time, value: maxHigh - 1000 });
    }
    supportSeries.setData(initialSupportData);
    resistanceSeries.setData(initialResistanceData);

    window.addEventListener("resize", handleResize);

    // REAL-TIME UPDATES (AI ADAPTIVE SIMULATION)
    let rtTime = currentTime;
    let rtClose = lastClose;
    let tickCount = 0;

    const insights = [
      {
        title: "Volatility Expansion",
        desc: "Bollinger Bands widening on 15m. Expecting sharp directional move within 4 hours.",
        confidence: 85,
        theme: "cyan" as const,
        label: "Pattern Detected"
      },
      {
        title: "Liquidity Sweep",
        desc: "Order book shows large bids pulling. Price action sweeps local lows, indicating potential reversal.",
        confidence: 94,
        theme: "green" as const,
        label: "AI Recommendation: LONG"
      },
      {
        title: "Bearish Order Block",
        desc: "Price approached crucial supply zone. Large volume node resistance at $65,100.",
        confidence: 76,
        theme: "orange" as const,
        label: "High Risk Area"
      },
      {
        title: "Multi-Timeframe Alignment",
        desc: "1D, 4H, and 1H all showing bullish confluence. Macro trend intact.",
        confidence: 98,
        theme: "green" as const,
        label: "Macro Bullish"
      }
    ];

    const interval = setInterval(() => {
        rtTime += 86400; // adding day for the sake of chart timeframe visibility, can be minute
        
        const open = rtClose;
        const trend = Math.sin(tickCount / 5) * 300 + (Math.random() - 0.4) * 400;
        rtClose = open + trend;
        const high = Math.max(open, rtClose) + Math.random() * 600;
        const low = Math.min(open, rtClose) - Math.random() * 600;

        const newDataPoint = { time: rtTime as any, open, high, low, close: rtClose };
        candlestickSeries.update(newDataPoint);

        // Update Markers Randomly based on AI patterns
        if (tickCount % 12 === 0) {
            markers.push({
                time: rtTime,
                position: tickCount % 24 === 0 ? 'aboveBar' : 'belowBar',
                color: tickCount % 24 === 0 ? '#ff4500' : '#39ff14',
                shape: tickCount % 24 === 0 ? 'arrowDown' : 'circle',
                text: tickCount % 24 === 0 ? 'Micro Resistance' : 'Micro Support',
                size: 1.0
            });
            // Keep array size manageable
            if (markers.length > 20) markers.shift();
            markerPlugin.setMarkers(markers);
            
            // Randomly update insight
            setAiInsight(insights[Math.floor(Math.random() * insights.length)]);
        }

        // Adaptive Prediction Line Recalculation
        predictionData = [{ time: rtTime as any, value: rtClose }];
        let pTime = rtTime;
        let pVal = rtClose;
        const aiOptimism = Math.random() > 0.5 ? 1 : -1;
        for (let j = 1; j <= 10; j++) {
            pTime += 86400;
            pVal += aiOptimism * 100 + (Math.random() * 200 - 50);
            predictionData.push({ time: pTime as any, value: pVal });
        }
        // Since prediction goes into the future, we need to completely replace data 
        predictionSeries.setData(predictionData);

        // Adaptive S/R calculation based on last 50 points
        // Simplified for simulation: just track overall min/max
        minLow = Math.min(minLow, low);
        maxHigh = Math.max(maxHigh, high);

        // We append the single S/R point and recreate the future projection
        supportData.push({ time: rtTime as any, value: minLow + 1000 });
        resistanceData.push({ time: rtTime as any, value: maxHigh - 1000 });

        // Build a fresh S/R dataset that includes history + new future prediction
        const newSupportData = [...supportData];
        const newResistanceData = [...resistanceData];

        for (let i = 1; i < predictionData.length; i++) {
            const dp = predictionData[i];
            newSupportData.push({ time: dp.time as any, value: minLow + 1000 });
            newResistanceData.push({ time: dp.time as any, value: maxHigh - 1000 });
        }

        supportSeries.setData(newSupportData);
        resistanceSeries.setData(newResistanceData);

        tickCount++;
    }, 2000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  return (
    <div className="relative w-full h-[407px] ml-0">
      <div ref={chartContainerRef} className="w-full h-full absolute inset-0" />
      {/* Legend / Overlay info */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none z-10 font-mono text-[9px] uppercase tracking-widest bg-black/40 p-2 backdrop-blur-sm rounded w-[170px] font-bold leading-[11px]">
         <div className="flex items-center gap-2 text-[#00f0ff]">
            <div className="w-4 border-b-2 border-dashed border-[#00f0ff]"></div>
            AI Trajectory Forecast
         </div>
         <div className="flex items-center gap-2 text-[#ff4500]">
            <div className="w-4 border-b-2 border-[#ff4500]"></div>
            AI Resistance Zone
         </div>
         <div className="flex items-center gap-2 text-[#39ff14]">
            <div className="w-4 border-b-2 border-[#39ff14]"></div>
            AI Support Zone
         </div>
      </div>

      {/* Floating Toolbars and AI Reasoning Panels (Glassmorphism) */}
      <div className="absolute top-4 right-4 flex flex-col gap-3 pointer-events-none z-20">
        <motion.div 
          key={aiInsight.title}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#050505]/60 backdrop-blur-xl border border-white/10 rounded-xl p-4 w-72 shadow-[0_10px_40px_rgba(0,0,0,0.8)] pointer-events-auto relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00f0ff]/5 blur-[30px] rounded-full pointer-events-none"></div>
          <div className="flex justify-between items-start mb-2 relative z-10">
            <h4 className={`flex items-center gap-2 font-mono font-bold text-[10px] uppercase ${aiInsight.theme === 'green' ? 'text-[#39ff14]' : aiInsight.theme === 'cyan' ? 'text-[#00f0ff]' : 'text-[#ff4500]'}`}>
              <ShieldAlert className="w-3.5 h-3.5" /> {aiInsight.title}
            </h4>
            <AIConfidenceRing confidence={aiInsight.confidence} size={32} theme={aiInsight.theme} />
          </div>
          <p className="text-gray-300 text-xs leading-relaxed font-sans mb-3 relative z-10">
            {aiInsight.desc}
          </p>
          <div className="flex items-center gap-2 relative z-10">
            <span className={`text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded border ${
              aiInsight.theme === 'green' ? 'bg-[#39ff14]/10 text-[#39ff14] border-[#39ff14]/20' : 
              aiInsight.theme === 'cyan' ? 'bg-[#00f0ff]/10 text-[#00f0ff] border-[#00f0ff]/20' : 
              'bg-[#ff4500]/10 text-[#ff4500] border-[#ff4500]/20'
            }`}>
              {aiInsight.label}
            </span>
          </div>
        </motion.div>
        
        <div className="bg-[#050505]/60 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-[0_10px_40px_rgba(0,0,0,0.8)] pointer-events-auto self-end flex gap-2">
           <button className="p-1.5 hover:bg-[#00f0ff]/20 rounded-lg text-gray-400 hover:text-[#00f0ff] transition-colors tooltip-trigger relative group">
             <Crosshair className="w-4 h-4" />
             <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-black/90 border border-white/10 rounded opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono whitespace-nowrap pointer-events-none text-white">
                Auto-target Sniping
             </div>
           </button>
           <button className="p-1.5 hover:bg-[#00f0ff]/20 rounded-lg text-gray-400 hover:text-[#00f0ff] transition-colors tooltip-trigger relative group">
             <Layers className="w-4 h-4" />
             <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-black/90 border border-white/10 rounded opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono whitespace-nowrap pointer-events-none text-white">
                Overlay Order Book
             </div>
           </button>
           <button className="p-1.5 hover:bg-[#00f0ff]/20 rounded-lg text-gray-400 hover:text-[#00f0ff] transition-colors tooltip-trigger relative group">
             <BarChart2 className="w-4 h-4" />
             <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-black/90 border border-white/10 rounded opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono whitespace-nowrap pointer-events-none text-white">
                Volume Profile
             </div>
           </button>
        </div>
      </div>
    </div>
  );
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
      className="flex flex-col min-h-full pb-10 w-full pt-[2.5px]"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 p-4 bg-[#050505]/40 backdrop-blur-xl border border-white/5 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#0ea5e9]/10 blur-[50px] rounded-full pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[#39ff14]/5 to-transparent pointer-events-none"></div>

        <div className="flex flex-col xl:flex-row xl:items-center gap-4 relative z-10 w-full md:w-auto">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-[#0ea5e9]/10 border border-[#0ea5e9]/30 flex items-center justify-center shadow-[0_0_15px_rgba(14,165,233,0.2)]">
                <Radio className="w-4 h-4 text-[#0ea5e9] animate-pulse" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Live Market Feed
              </h1>
            </div>
            <div className="flex items-center gap-2 pl-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#39ff14] animate-pulse shadow-[0_0_8px_#39ff14]"></div>
              <p className="text-gray-400 text-[10px] font-mono tracking-widest uppercase">
                AI-Driven High-Frequency Pipeline
              </p>
            </div>
          </div>
          
          <div className="hidden xl:block h-10 w-[1px] bg-gradient-to-b from-transparent via-white/15 to-transparent"></div>
          
          <div className="flex flex-col items-start xl:items-start xl:pl-2">
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-base font-bold text-white tracking-tight">
                BTC/USDT-PERP
              </h2>
              <span className="px-1.5 py-0.5 rounded bg-[#39ff14]/10 text-[#39ff14] border border-[#39ff14]/30 text-[9px] font-mono font-bold leading-none">
                LONG
              </span>
            </div>
            <div className="font-mono text-xl text-white font-medium flex items-center gap-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              <span className="text-gray-500 text-base">$</span>
              {dataStream[dataStream.length - 1].toFixed(1)}
              <span className="text-[#39ff14] text-xs flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" /> 2.14%
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap md:flex-nowrap items-center gap-3 md:gap-5 relative z-10 w-full md:w-auto bg-black/40 md:bg-transparent p-3 md:p-0 rounded-lg md:rounded-none border md:border-none border-white/5">
          <div className="flex flex-col items-start md:items-end flex-1 md:flex-auto">
            <span className="text-[8px] md:text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">
              Data Pipeline Info
            </span>
            <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 bg-[#facc15] rounded-full"></span>
                <span className="text-gray-300 font-mono text-[10px] md:text-xs leading-none">WebSockets</span>
            </div>
          </div>
          <div className="hidden md:block h-6 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
          <div className="flex flex-col items-start md:items-end flex-1 md:flex-auto">
            <span className="text-[8px] md:text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">
              Latency
            </span>
            <span className="text-[#39ff14] font-mono text-[10px] md:text-xs leading-none drop-shadow-[0_0_8px_rgba(57,255,20,0.5)]">2.4ms</span>
          </div>
          <div className="hidden md:block h-6 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
          <div className="flex flex-col items-start md:items-end flex-1 md:flex-auto">
            <span className="text-[8px] md:text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">
              Network
            </span>
            <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 bg-[#00f0ff] rounded-full shadow-[0_0_8px_#00f0ff]"></span>
                <span className="text-[#00f0ff] font-mono text-[10px] md:text-xs leading-none drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]">Connected</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Main Chart Area (Spans 7 cols) */}
        <div className="col-span-1 xl:col-span-7 flex flex-col gap-6">
          <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-5 flex flex-col">
            <div className="flex justify-between items-center w-full mb-6 relative z-10">
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
                <div className="hidden md:flex gap-4">
                  <div className="flex items-center gap-2 bg-[#111] px-3 py-1.5 rounded border border-[#222]">
                    <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">1H</span>
                    <span className="text-[#39ff14] text-xs font-bold">Bullish</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#111] px-3 py-1.5 rounded border border-[#222]">
                    <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">4H</span>
                    <span className="text-[#39ff14] text-xs font-bold">Bullish</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#111] px-3 py-1.5 rounded border border-[#222]">
                    <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">1D</span>
                    <span className="text-[#facc15] text-xs font-bold">Neutral</span>
                  </div>
                </div>
              </div>

            {/* TradingView / lightweight-charts Instance */}
            <div className="w-full border border-[#1a1a1a] rounded-sm bg-[#050505] relative flex flex-col pt-1">
              <MarketChart />
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
