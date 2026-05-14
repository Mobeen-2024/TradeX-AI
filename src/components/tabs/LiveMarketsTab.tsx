import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  ChevronDown,
  SearchCode,
  BookOpen,
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
  const [logs, setLogs] = useState<{timestamp: string, type: string, text: string, color: string, value?: number}[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ws = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@aggTrade");
    let isMounted = true;
    
    const initialLogs = [
      { timestamp: new Date().toISOString().split("T")[1].slice(0, -1), type: "SYSTEM", text: "INITIALIZING QUANT-V4 KERNEL...", color: "text-gray-400" },
      { timestamp: new Date().toISOString().split("T")[1].slice(0, -1), type: "RISK_ENGINE", text: "CHECKING MARGIN ALLOCATION. NORMAL.", color: "text-[#84cc16]" },
      { timestamp: new Date().toISOString().split("T")[1].slice(0, -1), type: "AGENT", text: "CONNECTING TO BINANCE WSS FEED...", color: "text-[#0ea5e9]" },
    ];
    setLogs(initialLogs);

    ws.onmessage = (event) => {
      if(!isMounted) return;
      
      const data = JSON.parse(event.data);
      if (data && data.e === 'aggTrade') {
        const price = parseFloat(data.p);
        const qty = parseFloat(data.q);
        const isBuyerMaker = data.m; // true means sell
        const usdValue = price * qty;
        
        if (usdValue > 100000) { // Large trade > 100k
          const side = isBuyerMaker ? "SELL" : "BUY";
          const color = side === "BUY" ? "text-[#39ff14]" : "text-[#ff4500]";
          
          setLogs(prev => {
            const newLog = {
              timestamp: new Date(data.T).toISOString().split("T")[1].slice(0, -1),
              type: "WHALE_TRACKER",
              text: `DETECTED ${usdValue >= 500000 ? "MASSIVE " : ""}${side}: ${qty.toFixed(2)} BTC @ $${price.toFixed(2)} ($${(usdValue/1000).toFixed(0)}k)`,
              color: color,
              value: usdValue
            };
            return [...prev, newLog].slice(-50);
          });
        }
      }
    };

    const interval = setInterval(() => {
       const msgs = [
         {text: "RECALIBRATING MICRO-TREND THRESHOLDS...", type: "SYSTEM", color: "text-gray-400"},
         {text: "ANALYZING ORDER FLOW IMBALANCE...", type: "AGENT", color: "text-[#0ea5e9]"},
         {text: "UPDATING LIQUIDITY HEATMAP GROUPS...", type: "SYSTEM", color: "text-gray-400"},
         {text: "SCANNING FOR FRONTRUN OPPORTUNITIES...", type: "AGENT", color: "text-[#0ea5e9]"},
       ];
       const r = msgs[Math.floor(Math.random() * msgs.length)];
       setLogs(prev => {
            const newLog = {
              timestamp: new Date().toISOString().split("T")[1].slice(0, -1),
              type: r.type,
              text: r.text,
              color: r.color
            };
            return [...prev, newLog].slice(-50);
       });
    }, 12000);

    return () => {
      isMounted = false;
      ws.close();
      clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
       scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-3 relative overflow-hidden flex flex-col font-mono text-[10px] leading-tight flex-1 min-h-[160px] max-h-[220px]">
      <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-r from-transparent to-[#0ea5e9]/5 pointer-events-none"></div>
      <h3 className="text-gray-500 font-bold uppercase tracking-widest mb-2 pb-2 flex items-center justify-between border-b border-[#1a1a1a] relative z-10 w-full">
        <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-[#0ea5e9]" />
            Execution Feed
        </div>
        <div className="flex gap-1.5 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#39ff14] animate-pulse"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse" style={{animationDelay: '100ms'}}></span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#facc15] animate-pulse" style={{animationDelay: '200ms'}}></span>
        </div>
      </h3>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-0.5 scroll-smooth relative z-10 break-words pr-1 mt-1"
      >
        {logs.map((log, i) => (
          <div key={i} className={`flex items-start gap-1 group cursor-pointer hover:bg-[#111] p-1 rounded transition-colors ${log.value && log.value >= 500000 ? 'bg-[#ff4500]/10 border border-[#ff4500]/30' : ''}`}>
            <span className="text-gray-600 shrink-0 select-none">
              [{log.timestamp}]
            </span>
            <span className={`uppercase break-words whitespace-normal leading-[1.3] ${log.color}`}>
              <span className={`font-bold mr-1 ${
                  log.type === 'AGENT' ? 'text-[#0ea5e9]' : 
                  log.type === 'SYSTEM' ? 'text-gray-500' : 
                  log.type === 'WHALE_TRACKER' && log.color.includes('39ff14') ? 'text-[#39ff14]' : 
                  log.type === 'WHALE_TRACKER' && log.color.includes('ff4500') ? 'text-[#ff4500]' : 
                  'text-white'
              }`}>[{log.type}]</span>
              {log.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIPatternScanner({ detectedPatterns }: { detectedPatterns: any[] }) {
  const [showDictionary, setShowDictionary] = useState(false);

  const patternDictionary = [
    { name: "Head and Shoulders", type: "Structural", bias: "BEARISH", color: "#ff4500" },
    { name: "Inverse Head and Shoulders", type: "Structural", bias: "BULLISH", color: "#39ff14" },
    { name: "Ascending Triangle", type: "Structural", bias: "BULLISH", color: "#39ff14" },
    { name: "Descending Triangle", type: "Structural", bias: "BEARISH", color: "#ff4500" },
    { name: "Bullish Flag", type: "Structural", bias: "BULLISH", color: "#39ff14" },
    { name: "Bearish Flag", type: "Structural", bias: "BEARISH", color: "#ff4500" },
    { name: "Bullish Pennant", type: "Structural", bias: "BULLISH", color: "#39ff14" },
    { name: "Bearish Pennant", type: "Structural", bias: "BEARISH", color: "#ff4500" },
    { name: "Ascending Channel", type: "Structural", bias: "BULLISH/RANGING", color: "#facc15" },
    { name: "Descending Channel", type: "Structural", bias: "BEARISH/RANGING", color: "#facc15" },
    { name: "Double Top", type: "Structural", bias: "BEARISH", color: "#ff4500" },
    { name: "Double Bottom", type: "Structural", bias: "BULLISH", color: "#39ff14" },
    { name: "Cup and Handle", type: "Structural", bias: "BULLISH", color: "#39ff14" },
    { name: "Rising Wedge", type: "Structural", bias: "BEARISH", color: "#ff4500" },
    { name: "Falling Wedge", type: "Structural", bias: "BULLISH", color: "#39ff14" },
    { name: "Doji", type: "Candlestick", bias: "NEUTRAL/REVERSAL", color: "#facc15" },
    { name: "Bullish Engulfing", type: "Candlestick", bias: "BULLISH", color: "#39ff14" },
    { name: "Bearish Engulfing", type: "Candlestick", bias: "BEARISH", color: "#ff4500" },
    { name: "Hammer", type: "Candlestick", bias: "BULLISH", color: "#39ff14" },
    { name: "Shooting Star", type: "Candlestick", bias: "BEARISH", color: "#ff4500" }
  ];

  return (
    <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-4 relative overflow-hidden flex flex-col font-mono text-[10px] leading-tight flex-1 min-h-[220px]">
      <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-r from-transparent to-[#facc15]/5 pointer-events-none"></div>
      <h3 className="text-gray-500 font-bold uppercase tracking-widest mb-3 flex items-center justify-between border-b border-[#1a1a1a] pb-2 relative z-10">
        <div className="flex items-center gap-2">
          <SearchCode className="w-3.5 h-3.5 text-[#facc15]" />
          Auto-Pattern Scan
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-gray-400 font-normal">
             <span className="w-1.5 h-1.5 rounded-full bg-[#39ff14] animate-pulse"></span>
             Scanning
          </span>
          <button 
             onClick={() => setShowDictionary(!showDictionary)}
             className={`p-1 rounded transition-colors ${showDictionary ? 'bg-[#facc15]/20 text-[#facc15]' : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'}`}
             title="View Scanned Patterns Library"
          >
             <BookOpen className="w-4 h-4" />
          </button>
        </div>
      </h3>
      
      {showDictionary ? (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-1.5 relative z-10 pr-1 mt-1"
        >
           <div className="text-[#facc15] mb-2 font-bold flex justify-between">
              <span>PATTERN LIBRARY</span>
              <span className="text-gray-500 font-normal">20 ACTIVE</span>
           </div>
           {patternDictionary.map((pat, i) => (
             <div key={i} className="flex justify-between items-center bg-[#0a0a0a] p-2 border border-[#111] rounded shadow-sm hover:border-[#222] transition-colors">
               <div className="flex flex-col gap-1">
                 <span className="font-bold text-gray-200">{pat.name}</span>
                 <span className="text-[9px] text-gray-500 uppercase tracking-widest">{pat.type}</span>
               </div>
               <span className="text-[9px] px-1.5 py-[1px] rounded font-bold" style={{ backgroundColor: `${pat.color}15`, color: pat.color }}>
                  {pat.bias}
               </span>
             </div>
           ))}
        </motion.div>
      ) : (
        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-2 relative z-10">
          <div className="text-gray-600 mb-1">Scanning 34 candlestick & structural patterns...</div>
          {!detectedPatterns || detectedPatterns.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-4 h-full text-gray-600 text-center gap-2">
              <SearchCode className="w-8 h-8 opacity-20" />
              <span>Waiting for structural or candlestick formation signatures...</span>
            </div>
          ) : (
            [...detectedPatterns].reverse().slice(0, 15).map((p, i) => (
              <div key={i} className="flex justify-between items-center bg-[#0a0a0a] p-2 border border-[#111] rounded shadow-sm hover:border-white/10 transition-colors cursor-pointer group">
                <div className="flex flex-col gap-0.5 max-w-[70%]">
                  <span className="font-bold flex items-center gap-1.5" style={{ color: p.color }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color, boxShadow: `0 0 5px ${p.color}` }}></span>
                    {p.text}
                  </span>
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest">{p.type} Pattern</span>
                </div>
                <div className="text-right flex flex-col gap-0.5">
                   <span className="text-gray-400 font-bold">{new Date((p.time as number) * 1000).toISOString().split("T")[1].slice(0, -5)}</span>
                   <span className={`text-[9px] px-1.5 py-[1px] rounded ${p.position === 'belowBar' ? 'bg-[#39ff14]/10 text-[#39ff14]' : p.position === 'aboveBar' ? 'bg-[#ff4500]/10 text-[#ff4500]' : 'bg-[#facc15]/10 text-[#facc15]'}`}>
                      {p.position === 'belowBar' ? 'BULL' : p.position === 'aboveBar' ? 'BEAR' : 'NEUTRAL'}
                   </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function MarketChart({ 
  activeTimeframe = "1m",
  onPatternsDetected,
  showPatterns = true
}: { 
  activeTimeframe?: string,
  onPatternsDetected?: (patterns: any[]) => void,
  showPatterns?: boolean
}) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const markersRef = useRef<any[]>([]);
  const markerPluginRef = useRef<any>(null);

  const [activeTooltip, setActiveTooltip] = useState({ visible: false, x: 0, y: 0, title: "", strength: "", retests: 0, prob: "", color: "" });
  const activeLinesRef = useRef({ support: 0, resistance: 0, liquidity: 0, breakout: 0, trendlineStartPrice: 0, trendlineEndPrice: 0, timeStart: 0, timeEnd: 0 });

  const [aiInsight, setAiInsight] = useState({
    pattern: "Bullish Engulfing",
    confidence: 87,
    risk: "Moderate",
    outlook: "Continuation likely",
    theme: "green" as "green" | "red" | "purple"
  });

  const [toggles, setToggles] = useState({
    sniping: false,
    orderbook: false,
    volume: true
  });

  const getBinanceInterval = (tf: string) => {
    if (tf.endsWith('H')) return tf.replace('H', 'h');
    if (tf.endsWith('D')) return tf.replace('D', 'd');
    if (tf.endsWith('W')) return tf.replace('W', 'w');
    return tf; // 1m, 3m, 5m, 15m, 30m, 1M
  };

  const getTimeframeSeconds = (tf: string) => {
    const value = parseInt(tf);
    const unit = tf.slice(-1);
    if (unit === 'm') return value * 60;
    if (unit === 'H' || unit === 'h') return value * 3600;
    if (unit === 'D' || unit === 'd') return value * 86400;
    if (unit === 'W' || unit === 'w') return value * 86400 * 7;
    if (unit === 'M') return value * 86400 * 30;
    return 60;
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    });

    resizeObserver.observe(chartContainerRef.current);

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

    const coneUpperSeries = chart.addSeries(LineSeries, {
      color: 'rgba(0, 240, 255, 0.2)',
      lineWidth: 1,
      lineStyle: 2,
      crosshairMarkerVisible: false,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    const coneLowerSeries = chart.addSeries(LineSeries, {
      color: 'rgba(0, 240, 255, 0.2)',
      lineWidth: 1,
      lineStyle: 2,
      crosshairMarkerVisible: false,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    const altTargetSeries = chart.addSeries(LineSeries, {
      color: '#a855f7',
      lineWidth: 1,
      lineStyle: 3,
      crosshairMarkerVisible: false,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    const highRiskSeries = chart.addSeries(LineSeries, {
      color: '#ff4500',
      lineWidth: 1,
      lineStyle: 3,
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

    const trendlineSeries = chart.addSeries(LineSeries, {
      color: '#facc15',
      lineWidth: 2,
      lineStyle: 1,
      crosshairMarkerVisible: false,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    const liquiditySeries = chart.addSeries(LineSeries, {
      color: '#a855f7',
      lineWidth: 4,
      lineStyle: 2,
      crosshairMarkerVisible: false,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    const breakoutSeries = chart.addSeries(LineSeries, {
      color: '#0ea5e9',
      lineWidth: 1,
      lineStyle: 0,
      crosshairMarkerVisible: false,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    chart.subscribeCrosshairMove((param) => {
      if (!param.point || !param.time || param.point.x < 0 || param.point.y < 0) {
        setActiveTooltip(prev => prev.visible ? { ...prev, visible: false } : prev);
        return;
      }
      
      const y = param.point.y;
      const x = param.point.x;
      const l = activeLinesRef.current;
      
      if (!candlestickSeriesRef.current) return;
      const series = candlestickSeriesRef.current;
      
      const tryMatch = (price: number, threshold = 8) => {
         const py = series.priceToCoordinate(price);
         if (py === null) return false;
         return Math.abs(y - py) < threshold;
      };

      let trendlinePrice = 0;
      const pTime = Number(param.time);
      if (pTime >= l.timeStart && pTime <= l.timeEnd && l.timeEnd > l.timeStart) {
          const ratio = (pTime - l.timeStart) / (l.timeEnd - l.timeStart);
          trendlinePrice = l.trendlineStartPrice + (l.trendlineEndPrice - l.trendlineStartPrice) * ratio;
      }

      let m = false, t = "", s = "", r = 0, p = "", c = "";

      if (tryMatch(l.resistance)) {
          m = true; t = "AI Resistance Zone"; s = "High"; r = 4; p = "38%"; c = "#ff4500";
      } else if (tryMatch(l.support)) {
          m = true; t = "AI Support Zone"; s = "Strong"; r = 3; p = "22%"; c = "#39ff14";
      } else if (tryMatch(l.breakout)) {
          m = true; t = "Breakout Level"; s = "Moderate"; r = 2; p = "64%"; c = "#0ea5e9";
      } else if (tryMatch(l.liquidity)) {
          m = true; t = "Liquidity Area"; s = "High"; r = 6; p = "81%"; c = "#a855f7";
      } else if (trendlinePrice && tryMatch(trendlinePrice)) {
          m = true; t = "Dynamic Trendline"; s = "Moderate"; r = 3; p = "45%"; c = "#facc15";
      }

      if (m) {
          setActiveTooltip({ visible: true, x, y, title: t, strength: s, retests: r, prob: p, color: c });
      } else {
          setActiveTooltip(prev => prev.visible ? { ...prev, visible: false } : prev);
      }
    });

    const binanceInterval = getBinanceInterval(activeTimeframe);
    const intervalSeconds = getTimeframeSeconds(activeTimeframe);
    let aborted = false;
    let activeWs: WebSocket | null = null;

    const detectPatterns = (data: any[]) => {
        const detected: any[] = [];
        for (let i = 3; i < data.length; i++) {
            const current = data[i];
            const prev = data[i-1];
            const isBullish = current.close > current.open;
            const bodySize = Math.abs(current.open - current.close);
            const candleSize = current.high - current.low;
            
            // clear colors
            delete current.color;
            delete current.borderColor;
            delete current.wickColor;

            let bias = '';
            let confidence = 0;
            let patText = '';

            if (bodySize <= candleSize * 0.1 && candleSize > 0) {
                 patText = 'Doji'; bias = 'Neutral'; confidence = 65;
                 detected.push({ time: current.time, position: isBullish ? 'belowBar' : 'aboveBar', color: '#a855f7', shape: 'circle', text: patText, size: 1, type: 'Candlestick', bias, confidence, historicalRate: 51 });
                 current.color = '#a855f7'; current.borderColor = '#a855f7'; current.wickColor = '#a855f7';
            }
            else if (prev.close < prev.open && current.close > current.open && current.open <= prev.close && current.close >= prev.open) {
                 patText = 'Bullish Engulfing'; bias = 'Bullish'; confidence = 87;
                 detected.push({ time: current.time, position: 'belowBar', color: '#39ff14', shape: 'arrowUp', text: patText, size: 1.5, type: 'Candlestick', bias, confidence, historicalRate: 72 });
                 current.color = '#39ff14'; current.borderColor = '#00f0ff'; current.wickColor = '#00f0ff';
            }
            else if (prev.close > prev.open && current.close < current.open && current.open >= prev.close && current.close <= prev.open) {
                 patText = 'Bearish Engulfing'; bias = 'Bearish'; confidence = 82;
                 detected.push({ time: current.time, position: 'aboveBar', color: '#ff4500', shape: 'arrowDown', text: patText, size: 1.5, type: 'Candlestick', bias, confidence, historicalRate: 68 });
                 current.color = '#ff4500'; current.borderColor = '#ff4500'; current.wickColor = '#ff4500';
            }
            else {
                const lowerShadow = Math.min(current.open, current.close) - current.low;
                const upperShadow = current.high - Math.max(current.open, current.close);
                if (lowerShadow > bodySize * 2 && upperShadow < bodySize * 0.2 && bodySize > 0) {
                     patText = 'Hammer'; bias = 'Bullish'; confidence = 74;
                     detected.push({ time: current.time, position: 'belowBar', color: '#00f0ff', shape: 'arrowUp', text: patText, size: 1.2, type: 'Candlestick', bias, confidence, historicalRate: 64 });
                     current.color = '#00f0ff'; current.borderColor = '#00f0ff'; current.wickColor = '#00f0ff';
                }
                else if (upperShadow > bodySize * 2 && lowerShadow < bodySize * 0.2 && bodySize > 0) {
                    patText = 'Shooting Star'; bias = 'Bearish'; confidence = 71;
                    detected.push({ time: current.time, position: 'aboveBar', color: '#ff4500', shape: 'arrowDown', text: patText, size: 1.2, type: 'Candlestick', bias, confidence, historicalRate: 61 });
                    current.color = '#ff4500'; current.borderColor = '#ff4500'; current.wickColor = '#ff4500';
                }
            }
        }
        if (data.length > 50) {
          const types = [
            {text: 'Double Top Detected', position: 'aboveBar', color: '#ff4500', shape: 'arrowDown', bias: 'Bearish'},
            {text: 'Double Bottom', position: 'belowBar', color: '#39ff14', shape: 'arrowUp', bias: 'Bullish'},
            {text: 'Inv Head & Shoulders', position: 'belowBar', color: '#39ff14', shape: 'arrowUp', bias: 'Bullish'},
            {text: 'Head & Shoulders', position: 'aboveBar', color: '#ff4500', shape: 'arrowDown', bias: 'Bearish'},
            {text: 'Ascending Triangle', position: 'belowBar', color: '#39ff14', shape: 'circle', bias: 'Bullish'},
            {text: 'Descending Triangle', position: 'aboveBar', color: '#ff4500', shape: 'circle', bias: 'Bearish'},
            {text: 'Bullish Flag', position: 'belowBar', color: '#39ff14', shape: 'arrowUp', bias: 'Bullish'},
            {text: 'Bearish Flag', position: 'aboveBar', color: '#ff4500', shape: 'arrowDown', bias: 'Bearish'},
            {text: 'Bullish Pennant', position: 'belowBar', color: '#39ff14', shape: 'arrowUp', bias: 'Bullish'},
            {text: 'Bearish Pennant', position: 'aboveBar', color: '#ff4500', shape: 'arrowDown', bias: 'Bearish'},
            {text: 'Ascending Channel', position: 'belowBar', color: '#a855f7', shape: 'arrowUp', bias: 'Neutral'},
            {text: 'Descending Channel', position: 'aboveBar', color: '#a855f7', shape: 'arrowDown', bias: 'Neutral'},
            {text: 'Cup and Handle', position: 'belowBar', color: '#39ff14', shape: 'circle', bias: 'Bullish'},
            {text: 'Rising Wedge', position: 'aboveBar', color: '#ff4500', shape: 'arrowDown', bias: 'Bearish'},
            {text: 'Falling Wedge', position: 'belowBar', color: '#39ff14', shape: 'arrowUp', bias: 'Bullish'},
          ];

          for (let j=0; j<3; j++) {
            const pat = types[Math.floor(Math.random() * types.length)];
            const historicalDataPointIndex = Math.floor(Math.random() * (data.length - 10) + 5);
            const dataPoint = data[historicalDataPointIndex];
            
            detected.push({ 
              time: dataPoint.time, 
              position: pat.position, 
              color: pat.color, 
              shape: pat.shape, 
              text: pat.text, 
              size: 1.8, 
              type: 'Structural',
              bias: pat.bias,
              confidence: Math.floor(Math.random() * 30) + 60,
              historicalRate: Math.floor(Math.random() * 25) + 55
            });
            
            // Highlight the structural candle
            dataPoint.color = pat.color;
            dataPoint.borderColor = pat.color;
            dataPoint.wickColor = pat.color;
          }
        }
        detected.sort((a,b) => a.time - b.time);
        return detected;
    };

    // Load Real Historical Data
    fetch(`https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${binanceInterval}&limit=100`)
      .then(res => res.json())
      .then(data => {
        if (aborted) return;
        if (!candlestickSeriesRef.current || !chartRef.current) return;
        
        const historicalData = data.map((d: any) => ({
          time: (d[0] / 1000),
          open: parseFloat(d[1]),
          high: parseFloat(d[2]),
          low: parseFloat(d[3]),
          close: parseFloat(d[4]),
        }));
        
        candlestickSeriesRef.current.setData(historicalData as any);

        const detectedPatterns = detectPatterns(historicalData);
        markersRef.current = detectedPatterns;
        
        if (!markerPluginRef.current && candlestickSeriesRef.current) {
            markerPluginRef.current = createSeriesMarkers(candlestickSeriesRef.current, []);
        }

        if (showPatterns && markerPluginRef.current) {
            try {
                markerPluginRef.current.setMarkers(detectedPatterns);
            } catch(e) {}
        }
        
        if (onPatternsDetected) {
            onPatternsDetected(detectedPatterns);
        }
        
        let tickCount = 0;
        
        const insights = [
          { pattern: "Bull Flag", confidence: 81, risk: "Moderate", outlook: "Continuation likely", theme: "green" as const },
          { pattern: "Bullish Engulfing", confidence: 87, risk: "Low", outlook: "Reversal strong", theme: "green" as const },
          { pattern: "Bearish Engulfing", confidence: 82, risk: "Moderate", outlook: "Reversal likely", theme: "red" as const },
          { pattern: "Hammer", confidence: 74, risk: "High", outlook: "Possible bottom", theme: "green" as const },
          { pattern: "Shooting Star", confidence: 71, risk: "High", outlook: "Possible top", theme: "red" as const },
          { pattern: "Double Bottom", confidence: 89, risk: "Low", outlook: "Trend reversal", theme: "green" as const },
          { pattern: "Head & Shoulders", confidence: 91, risk: "Low", outlook: "Trend reversal", theme: "red" as const },
          { pattern: "Ascending Channel", confidence: 65, risk: "Moderate", outlook: "Price discovery", theme: "purple" as const },
          { pattern: "Doji", confidence: 65, risk: "High", outlook: "Indecision", theme: "purple" as const },
        ];

        let lastKnownTime = historicalData.length > 0 ? historicalData[historicalData.length - 1].time : 0;

        // Connect to Real-Time WebSocket
        activeWs = new WebSocket(`wss://stream.binance.com:9443/ws/btcusdt@kline_${binanceInterval}`);
        
        activeWs.onmessage = (event) => {
          if (aborted) return;
          if (!candlestickSeriesRef.current) return;
          try {
            const message = JSON.parse(event.data);
            if (!message.k) return;
            const kline = message.k;
            const rtTime = Math.floor(kline.t / 1000);
            
            if (rtTime < lastKnownTime) return;
            lastKnownTime = rtTime;

            const rtClose = parseFloat(kline.c);
            const rtHigh = parseFloat(kline.h);
            const rtLow = parseFloat(kline.l);
            
            candlestickSeriesRef.current.update({
              time: rtTime as any,
              open: parseFloat(kline.o),
              high: rtHigh,
              low: rtLow,
              close: rtClose,
            });

            // Occasional AI simulated actions
            if (tickCount > 0 && tickCount % 15 === 0) {
              setAiInsight(insights[Math.floor(Math.random() * insights.length)]);
              
              if (showPatterns) {
                  const currentMarkers = markersRef.current;
                  currentMarkers.push({
                      time: rtTime as any,
                      position: tickCount % 30 === 0 ? 'aboveBar' : 'belowBar',
                      color: tickCount % 30 === 0 ? '#ff4500' : '#39ff14',
                      shape: tickCount % 30 === 0 ? 'arrowDown' : 'arrowUp',
                      text: tickCount % 30 === 0 ? 'Micro Resistance' : 'Micro Support',
                      size: 1.0,
                      type: 'Candlestick'
                  });
                  if (markerPluginRef.current) {
                      try {
                          markerPluginRef.current.setMarkers(currentMarkers);
                      } catch(e) {}
                  }
              }
            }

            // Adaptive Support/Resistance bounds
            const recentData = historicalData.slice(-50);
            if(recentData.length > 0) {
                const minLow = Math.min(...recentData.map((d: any) => d.low), rtLow);
                const maxHigh = Math.max(...recentData.map((d: any) => d.high), rtHigh);
                
                const srTimeStart = recentData[0].time as number;
                const srTimeEnd = rtTime + (intervalSeconds * 10); // project into future
                
                supportSeries.setData([
                    { time: srTimeStart as any, value: minLow },
                    { time: srTimeEnd as any, value: minLow }
                ]);
                resistanceSeries.setData([
                    { time: srTimeStart as any, value: maxHigh },
                    { time: srTimeEnd as any, value: maxHigh }
                ]);

                const firstData = recentData[0];
                const midData = recentData[Math.floor(recentData.length / 2)];
                const lastData = recentData[recentData.length - 1];

                const isUptrend = lastData.close > firstData.close;
                const trendStartPrice = isUptrend ? minLow : maxHigh;
                const trendEndPrice = isUptrend ? minLow + (rtLow - minLow) * 0.8 : maxHigh - (maxHigh - rtHigh) * 0.8;
                
                trendlineSeries.setData([
                    { time: srTimeStart as any, value: trendStartPrice },
                    { time: srTimeEnd as any, value: trendEndPrice + (trendEndPrice - trendStartPrice)*0.2 }
                ]);

                const liquidityZone = minLow + (maxHigh - minLow) * (isUptrend ? 0.3 : 0.7);
                liquiditySeries.setData([
                    { time: midData.time as any, value: liquidityZone },
                    { time: srTimeEnd as any, value: liquidityZone }
                ]);
                
                const breakoutLvl = isUptrend ? maxHigh - (maxHigh - minLow) * 0.1 : minLow + (maxHigh - minLow) * 0.1;
                breakoutSeries.setData([
                    { time: srTimeStart as any, value: breakoutLvl },
                    { time: srTimeEnd as any, value: breakoutLvl }
                ]);

                activeLinesRef.current = {
                    support: minLow,
                    resistance: maxHigh,
                    liquidity: liquidityZone,
                    breakout: breakoutLvl,
                    trendlineStartPrice: trendStartPrice,
                    trendlineEndPrice: trendEndPrice,
                    timeStart: srTimeStart,
                    timeEnd: srTimeEnd
                };
            }
            
            
            // Adaptive Prediction Line Recalculation
            let pBaseTime = rtTime;
            
            let mostLikelyData = [{ time: rtTime as any, value: rtClose }];
            let coneUpperData = [{ time: rtTime as any, value: rtClose }];
            let coneLowerData = [{ time: rtTime as any, value: rtClose }];
            let mlVal = rtClose;
            
            let altData = [{ time: rtTime as any, value: rtClose }];
            let altVal = rtClose;
            
            let riskData = [{ time: rtTime as any, value: rtClose }];
            let riskVal = rtClose;
            
            const aiOptimism = Math.random() > 0.5 ? 1 : -1;
            
            for (let j = 1; j <= 15; j++) {
                pBaseTime += intervalSeconds;
                
                // Most likely (stable trend)
                mlVal += aiOptimism * 8 + (Math.random() * 15 - 7.5);
                mostLikelyData.push({ time: pBaseTime as any, value: mlVal });
                
                // Confidence cone expands over time
                const coneWidth = j * 2 + Math.random() * 5;
                coneUpperData.push({ time: pBaseTime as any, value: mlVal + coneWidth });
                coneLowerData.push({ time: pBaseTime as any, value: mlVal - coneWidth });
                
                // Alternative (counter trend or sideways)
                altVal += (-aiOptimism * 5) + (Math.random() * 25 - 12.5);
                altData.push({ time: pBaseTime as any, value: altVal });
                
                // High risk (extreme volatility)
                riskVal += (-aiOptimism * 20) + (Math.random() * 60 - 30);
                riskData.push({ time: pBaseTime as any, value: riskVal });
            }
            
            predictionSeries.setData(mostLikelyData);
            coneUpperSeries.setData(coneUpperData);
            coneLowerSeries.setData(coneLowerData);
            altTargetSeries.setData(altData);
            highRiskSeries.setData(riskData);

            tickCount++;
          } catch(e) {
             console.error("Kline ws error", e);
          }
        };
      })
      .catch((err: any) => {
          console.error("Error fetching binance klines, falling back to synthetic data", err);
          if (aborted || !candlestickSeriesRef.current || !chartRef.current) return;
          
          let lastClose = 64000;
          let currentTime = Math.floor(Date.now() / 1000) - 100 * intervalSeconds;
          
          const syntheticData = Array(100).fill(0).map((_, i) => {
              const open = lastClose + (Math.random() * 20 - 10);
              const close = open + (Math.random() * 100 - 50);
              const high = Math.max(open, close) + Math.random() * 50;
              const low = Math.min(open, close) - Math.random() * 50;
              lastClose = close;
              const t = currentTime;
              currentTime += intervalSeconds;
              return { time: t as any, open, high, low, close };
          });
          
          candlestickSeriesRef.current.setData(syntheticData as any);
          
          if (syntheticData.length > 0) {
              const recentData = syntheticData.slice(-50);
              const minLow = Math.min(...recentData.map((d: any) => d.low));
              const maxHigh = Math.max(...recentData.map((d: any) => d.high));
              
              const srTimeStart = recentData[0].time as number;
              const srTimeEnd = recentData[recentData.length - 1].time as number + (intervalSeconds * 10);
              const rtLow = recentData[recentData.length - 1].low;
              const rtHigh = recentData[recentData.length - 1].high;
              
              supportSeries.setData([
                  { time: srTimeStart as any, value: minLow },
                  { time: srTimeEnd as any, value: minLow }
              ]);
              resistanceSeries.setData([
                  { time: srTimeStart as any, value: maxHigh },
                  { time: srTimeEnd as any, value: maxHigh }
              ]);

              const firstData = recentData[0];
              const midData = recentData[Math.floor(recentData.length / 2)];
              const lastData = recentData[recentData.length - 1];

              const isUptrend = lastData.close > firstData.close;
              const trendStartPrice = isUptrend ? minLow : maxHigh;
              const trendEndPrice = isUptrend ? minLow + (rtLow - minLow) * 0.8 : maxHigh - (maxHigh - rtHigh) * 0.8;
              
              trendlineSeries.setData([
                  { time: srTimeStart as any, value: trendStartPrice },
                  { time: srTimeEnd as any, value: trendEndPrice + (trendEndPrice - trendStartPrice)*0.2 }
              ]);

              const liquidityZone = minLow + (maxHigh - minLow) * (isUptrend ? 0.3 : 0.7);
              liquiditySeries.setData([
                  { time: midData.time as any, value: liquidityZone },
                  { time: srTimeEnd as any, value: liquidityZone }
              ]);
              
              const breakoutLvl = isUptrend ? maxHigh - (maxHigh - minLow) * 0.1 : minLow + (maxHigh - minLow) * 0.1;
              breakoutSeries.setData([
                  { time: srTimeStart as any, value: breakoutLvl },
                  { time: srTimeEnd as any, value: breakoutLvl }
              ]);

              activeLinesRef.current = {
                  support: minLow,
                  resistance: maxHigh,
                  liquidity: liquidityZone,
                  breakout: breakoutLvl,
                  trendlineStartPrice: trendStartPrice,
                  trendlineEndPrice: trendEndPrice,
                  timeStart: srTimeStart,
                  timeEnd: srTimeEnd
              };
              
              let pBaseTime = recentData[recentData.length - 1].time as number;
              let mlVal = recentData[recentData.length - 1].close;
              let altVal = mlVal;
              let riskVal = mlVal;
              let mostLikelyData = [{ time: pBaseTime as any, value: mlVal }];
              let coneUpperData = [{ time: pBaseTime as any, value: mlVal }];
              let coneLowerData = [{ time: pBaseTime as any, value: mlVal }];
              let altData = [{ time: pBaseTime as any, value: mlVal }];
              let riskData = [{ time: pBaseTime as any, value: mlVal }];
              const aiOptimism = Math.random() > 0.5 ? 1 : -1;
              
              for (let j = 1; j <= 15; j++) {
                  pBaseTime += intervalSeconds;
                  mlVal += aiOptimism * 8 + (Math.random() * 15 - 7.5);
                  mostLikelyData.push({ time: pBaseTime as any, value: mlVal });
                  
                  const coneWidth = j * 2 + Math.random() * 5;
                  coneUpperData.push({ time: pBaseTime as any, value: mlVal + coneWidth });
                  coneLowerData.push({ time: pBaseTime as any, value: mlVal - coneWidth });
                  
                  altVal += (-aiOptimism * 5) + (Math.random() * 25 - 12.5);
                  altData.push({ time: pBaseTime as any, value: altVal });
                  
                  riskVal += (-aiOptimism * 20) + (Math.random() * 60 - 30);
                  riskData.push({ time: pBaseTime as any, value: riskVal });
              }
              
              predictionSeries.setData(mostLikelyData);
              coneUpperSeries.setData(coneUpperData);
              coneLowerSeries.setData(coneLowerData);
              altTargetSeries.setData(altData);
              highRiskSeries.setData(riskData);
          }

          const detectedPatterns = detectPatterns(syntheticData);
          markersRef.current = detectedPatterns;
          
          if (!markerPluginRef.current && candlestickSeriesRef.current) {
              markerPluginRef.current = createSeriesMarkers(candlestickSeriesRef.current, []);
          }

          if (showPatterns && markerPluginRef.current) {
              try {
                  markerPluginRef.current.setMarkers(detectedPatterns);
              } catch(e) {}
          }
          
          if (onPatternsDetected) {
              onPatternsDetected(detectedPatterns);
          }
      });

    return () => {
      aborted = true;
      if(activeWs) {
          activeWs.close();
      }
      resizeObserver.disconnect();
      try {
        chart.remove();
      } catch (e) {}
      chartRef.current = null;
      candlestickSeriesRef.current = null;
      markerPluginRef.current = null;
    };
  }, [activeTimeframe]);

  useEffect(() => {
    if (markerPluginRef.current && candlestickSeriesRef.current) {
        try {
            if (showPatterns) {
                markerPluginRef.current.setMarkers(markersRef.current);
            } else {
                markerPluginRef.current.setMarkers([]);
            }
        } catch (e) {
             console.error("Marker plugin update failed (possibly disposed)", e);
        }
    }
  }, [showPatterns]);

  return (
    <div className="relative w-full h-[407px] ml-0">
      <div ref={chartContainerRef} className="w-full h-full absolute inset-0" />
      
      {activeTooltip.visible && (
         <div 
           className="absolute z-30 bg-[#050505]/90 backdrop-blur-md border border-white/10 rounded-lg p-3 shadow-2xl pointer-events-none transform -translate-x-1/2 -translate-y-[120%]"
           style={{ left: activeTooltip.x, top: activeTooltip.y }}
         >
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: activeTooltip.color, boxShadow: `0 0 8px ${activeTooltip.color}` }}></span>
                <span className="font-bold font-mono text-[11px] text-white uppercase tracking-widest">{activeTooltip.title}</span>
            </div>
            <div className="flex flex-col gap-1 font-mono text-[9px]">
               <div className="flex justify-between gap-6">
                 <span className="text-gray-400">Strength:</span>
                 <span className="font-bold" style={{ color: activeTooltip.color }}>{activeTooltip.strength}</span>
               </div>
               <div className="flex justify-between gap-6">
                 <span className="text-gray-400">Retests:</span>
                 <span className="text-white font-bold">{activeTooltip.retests}</span>
               </div>
               <div className="flex justify-between gap-6">
                 <span className="text-gray-400">Break Prob:</span>
                 <span className="text-white font-bold">{activeTooltip.prob}</span>
               </div>
            </div>
         </div>
      )}

      {/* Legend / Overlay info */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none z-10 font-mono text-[9px] uppercase tracking-widest bg-black/40 p-2 backdrop-blur-sm rounded w-[180px] font-bold leading-[11px]">
         <div className="flex items-center gap-2 text-[#00f0ff]">
            <div className="w-4 border-b-2 border-dashed border-[#00f0ff]"></div>
            Most Likely Path
         </div>
         <div className="flex items-center gap-2 text-[#a855f7]">
            <div className="w-4 border-b border-dashed border-[#a855f7]"></div>
            Alt Scenario
         </div>
         <div className="flex items-center gap-2 text-[#ff4500]">
            <div className="w-4 border-b border-dashed border-[#ff4500]"></div>
            High-Risk Scenario
         </div>
         <div className="flex items-center gap-2 text-[#ff4500]">
            <div className="w-4 border-b-2 border-[#ff4500]"></div>
            Resistance Zone
         </div>
         <div className="flex items-center gap-2 text-[#39ff14]">
            <div className="w-4 border-b-2 border-[#39ff14]"></div>
            Support Zone
         </div>
         <div className="flex items-center gap-2 text-[#facc15]">
            <div className="w-4 border-b-2 border-dotted border-[#facc15]"></div>
            Dynamic Trendline
         </div>
         <div className="flex items-center gap-2 text-[#a855f7]">
            <div className="w-4 border-b-[3px] border-dashed border-[#a855f7]"></div>
            Liquidity Area
         </div>
         <div className="flex items-center gap-2 text-[#0ea5e9]">
            <div className="w-4 border-b-2 border-[#0ea5e9]"></div>
            Breakout Level
         </div>
      </div>

      {/* Floating Toolbars and AI Reasoning Panels (Glassmorphism) */}
      <div className="absolute top-4 right-4 flex flex-col gap-3 pointer-events-none z-20">
        <motion.div 
          key={aiInsight.pattern}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#050505]/70 backdrop-blur-xl border border-white/10 rounded overflow-hidden w-64 shadow-[0_10px_40px_rgba(0,0,0,0.8)] pointer-events-auto"
        >
          <div className="bg-[#111] px-3 py-1.5 flex justify-between items-center border-b border-white/5">
             <span className="text-[9px] font-mono font-bold tracking-widest text-[#0ea5e9] flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-[#0ea5e9] animate-pulse"></span>
                 [ AI DETECTED ]
             </span>
             <span className="text-[9px] font-mono text-gray-500">{activeTimeframe}</span>
          </div>
          <div className="p-3">
             <h4 className={`font-bold font-mono text-[14px] uppercase mb-3 ${
                 aiInsight.theme === 'green' ? 'text-[#39ff14]' : 
                 aiInsight.theme === 'red' ? 'text-[#ff4500]' : 
                 'text-[#a855f7]'
             }`}>
                {aiInsight.pattern}
             </h4>
             
             <div className="flex flex-col gap-2 font-mono text-[10px]">
                <div className="flex justify-between items-center">
                   <span className="text-gray-400">Confidence:</span>
                   <span className="text-white font-bold">{aiInsight.confidence}%</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-gray-400">Risk:</span>
                   <span className={`font-bold ${aiInsight.risk === 'Low' ? 'text-[#39ff14]' : aiInsight.risk === 'High' ? 'text-[#ff4500]' : 'text-[#facc15]'}`}>{aiInsight.risk}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-gray-400">AI Outlook:</span>
                   <span className="text-white font-bold text-right max-w-[120px]">{aiInsight.outlook}</span>
                </div>
             </div>
          </div>
          <div 
             className="w-full h-[2px]" 
             style={{ 
                 background: aiInsight.theme === 'green' ? 'linear-gradient(90deg, #39ff14, transparent)' :
                             aiInsight.theme === 'red' ? 'linear-gradient(90deg, #ff4500, transparent)' :
                             'linear-gradient(90deg, #a855f7, transparent)'
             }}
          />
        </motion.div>
        
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#050505]/70 backdrop-blur-xl border border-white/10 rounded overflow-hidden w-64 shadow-[0_10px_40px_rgba(0,0,0,0.8)] pointer-events-auto mb-auto"
          >
            <div className="bg-[#111] px-3 py-1.5 flex justify-between items-center border-b border-white/5">
               <span className="text-[9px] font-mono font-bold tracking-widest text-[#00f0ff] flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse"></span>
                   MULTI-TF INTELLIGENCE
               </span>
            </div>
            {/* Context Insights */}
            <div className="p-3 border-b border-white/5 bg-[#050505]">
               <div className="flex flex-col gap-2 font-mono text-[9px] uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                     <span className="text-[#a855f7] font-bold w-6">[1H]</span>
                     <span className="text-gray-400">Momentum Weakening</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="text-[#facc15] font-bold w-6">[4H]</span>
                     <span className="text-gray-400">Resistance Above</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="text-[#00f0ff] font-bold w-6">[1D]</span>
                     <span className="text-gray-400">Bull Trend Active</span>
                  </div>
               </div>
            </div>

            {/* Smart Alignment */}
            <div className="p-3 bg-gradient-to-b from-[#111]/80 to-transparent">
                <div className="flex justify-between items-end mb-3 border-b border-white/5 pb-2">
                   <div className="text-[9px] font-mono font-bold text-gray-500 uppercase">Alignment Score</div>
                   <div className="text-[18px] font-mono font-bold text-[#39ff14] shadow-[0_0_10px_#39ff14] leading-none">92%</div>
                </div>
                
                <div className="flex flex-col gap-2 font-mono text-[10px]">
                   <div className="flex justify-between items-center">
                      <span className="text-[#3b82f6] font-bold px-1.5 py-0.5 bg-[#3b82f6]/10 rounded border border-[#3b82f6]/20">5m</span>
                      <span className="text-[#39ff14] font-bold pr-1">Bullish</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[#a855f7] font-bold px-1.5 py-0.5 bg-[#a855f7]/10 rounded border border-[#a855f7]/20">1H</span>
                      <span className="text-[#39ff14] font-bold pr-1">Bullish</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[#facc15] font-bold px-1.5 py-0.5 bg-[#facc15]/10 rounded border border-[#facc15]/20">4H</span>
                      <span className="text-[#39ff14] font-bold pr-1">Bullish</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[#00f0ff] font-bold px-1.5 py-0.5 bg-[#00f0ff]/10 rounded border border-[#00f0ff]/20">1D</span>
                      <span className="text-[#39ff14] font-bold pr-1">Bullish</span>
                   </div>
                </div>
            </div>
          </motion.div>

        <div className="bg-[#050505]/60 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-[0_10px_40px_rgba(0,0,0,0.8)] pointer-events-auto self-end flex gap-2">
           <button 
             onClick={() => setToggles(p => ({ ...p, sniping: !p.sniping }))}
             className={`p-1.5 rounded-lg transition-colors tooltip-trigger relative group ${toggles.sniping ? 'bg-[#00f0ff]/20 text-[#00f0ff]' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
           >
             <Crosshair className="w-4 h-4" />
             <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-black/90 border border-white/10 rounded opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono whitespace-nowrap pointer-events-none text-white">
                Auto-target Sniping
             </div>
           </button>
           <button 
             onClick={() => setToggles(p => ({ ...p, orderbook: !p.orderbook }))}
             className={`p-1.5 rounded-lg transition-colors tooltip-trigger relative group ${toggles.orderbook ? 'bg-[#00f0ff]/20 text-[#00f0ff]' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
           >
             <Layers className="w-4 h-4" />
             <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-black/90 border border-white/10 rounded opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono whitespace-nowrap pointer-events-none text-white">
                Overlay Order Book
             </div>
           </button>
           <button 
             onClick={() => setToggles(p => ({ ...p, volume: !p.volume }))}
             className={`p-1.5 rounded-lg transition-colors tooltip-trigger relative group ${toggles.volume ? 'bg-[#00f0ff]/20 text-[#00f0ff]' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
           >
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

function TradeExecutionPanel({ currentPrice }: { currentPrice?: number }) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [orderType, setOrderType] = useState<"limit" | "market" | "stop">("limit");
  const [size, setSize] = useState("1.5");
  const [price, setPrice] = useState("64200.5");
  const [tp, setTp] = useState("");
  const [sl, setSl] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<string | null>(null);

  const maxPosition = 4.25;
  const displayPrice = orderType === "market" && currentPrice ? currentPrice.toFixed(2) : price;

  useEffect(() => {
    if (orderType === "market" && currentPrice) {
      setPrice(currentPrice.toFixed(2));
    }
  }, [currentPrice, orderType]);

  const handleSizePercent = (pct: number) => {
    setSize(((maxPosition * pct) / 100).toFixed(4));
  };

  const handleOrderType = (t: "limit" | "market" | "stop") => {
    setOrderType(t);
    if (t === "market" && currentPrice) {
      setPrice(currentPrice.toFixed(2));
    }
  };

  const handleExecute = () => {
    const numSize = parseFloat(size);
    const numPrice = parseFloat(price);
    
    if (!size || isNaN(numSize) || numSize <= 0) {
      setExecutionResult("Invalid Size");
      setTimeout(() => setExecutionResult(null), 2000);
      return;
    }
    
    if (orderType !== "market" && (!price || isNaN(numPrice) || numPrice <= 0)) {
      setExecutionResult("Invalid Price");
      setTimeout(() => setExecutionResult(null), 2000);
      return;
    }

    setIsExecuting(true);
    setExecutionResult(null);
    setTimeout(() => {
      setIsExecuting(false);
      const executePrice = orderType === 'market' ? (currentPrice ? currentPrice.toFixed(2) : 'Market') : price;
      setExecutionResult(`[SUCCESS] ${side.toUpperCase()} ${size} BTC @ ${executePrice}`);
      setSize("");
      setTp("");
      setSl("");
      setTimeout(() => setExecutionResult(null), 3500);
    }, 1500);
  };

  const requiredMargin = (parseFloat(size || "0") * parseFloat(displayPrice || "0") * 0.1).toFixed(2);
  const estFee = (parseFloat(size || "0") * parseFloat(displayPrice || "0") * 0.0002).toFixed(2);

  return (
    <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-4 flex flex-col h-full font-sans shadow-2xl relative overflow-hidden max-h-[900px]">
      {/* Decorative background glow */}
      <div
        className={`absolute -top-20 -right-20 w-40 h-40 blur-[80px] rounded-full pointer-events-none opacity-20 ${side === "buy" ? "bg-[#39ff14]" : "bg-[#ff4500]"}`}
      ></div>

      <div className="bg-[#111] border border-[#222] rounded p-3 mb-5 sticky z-10 shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#00f0ff] uppercase flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" /> AI Market Probability
          </span>
        </div>
        
        <div className="space-y-3 font-mono text-[10px]">
           <div>
              <div className="flex justify-between mb-1">
                 <span className="text-gray-400">Bullish Continuation</span>
                 <span className="text-[#39ff14] font-bold">68%</span>
              </div>
              <div className="w-full h-1.5 bg-[#050505] rounded overflow-hidden">
                 <div className="w-[68%] h-full bg-[#39ff14] shadow-[0_0_8px_#39ff14]"></div>
              </div>
           </div>
           <div>
              <div className="flex justify-between mb-1">
                 <span className="text-gray-400">Pullback Risk</span>
                 <span className="text-[#ff4500] font-bold">24%</span>
              </div>
              <div className="w-full h-1.5 bg-[#050505] rounded overflow-hidden">
                 <div className="w-[24%] h-full bg-[#ff4500]"></div>
              </div>
           </div>
           <div>
              <div className="flex justify-between mb-1">
                 <span className="text-gray-400">Fakeout Probability</span>
                 <span className="text-[#a855f7] font-bold">8%</span>
              </div>
              <div className="w-full h-1.5 bg-[#050505] rounded overflow-hidden flex items-center">
                 <div className="w-[8%] h-full bg-[#a855f7]"></div>
              </div>
           </div>
        </div>
      </div>
      
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setSide("buy")}
          className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all rounded-sm border ${side === "buy" ? "bg-[#39ff14]/10 text-[#39ff14] border-[#39ff14]/30" : "bg-transparent text-gray-500 border-[#222] hover:bg-white/5"}`}
        >
          Long
        </button>
        <button
          onClick={() => setSide("sell")}
          className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all rounded-sm border ${side === "sell" ? "bg-[#ff4500]/10 text-[#ff4500] border-[#ff4500]/30" : "bg-transparent text-gray-500 border-[#222] hover:bg-white/5"}`}
        >
          Short
        </button>
      </div>

      <div className="flex gap-2 mb-5">
        {(["limit", "market", "stop"] as const).map((t) => (
          <button
            key={t}
            onClick={() => handleOrderType(t)}
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
              <span className="text-gray-300">~ ${displayPrice}</span>
            </div>
            <div className="relative group">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={`w-full bg-[#0a0a0a] border border-[#222] rounded-sm py-2 px-3 text-white font-mono text-sm focus:outline-none focus:border-[#0ea5e9]/50 transition-colors ${orderType === "market" ? 'text-gray-500' : ''}`}
                disabled={orderType === "market" || isExecuting}
              />
              {orderType === "market" && (
                <div className="absolute inset-0 bg-transparent flex items-center px-3 text-sm text-gray-400 font-mono pointer-events-none">
                  Market Price
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-gray-500">Position Size (BTC)</span>
              <span className="text-gray-300 flex items-center gap-1">
                Max: {maxPosition.toFixed(2)}
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#222] rounded-sm py-2 px-3 text-white font-mono text-sm focus:outline-none focus:border-[#0ea5e9]/50 transition-colors"
                disabled={isExecuting}
              />
            </div>
            <div className="flex gap-1 mt-2">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  onClick={() => handleSizePercent(pct)}
                  disabled={isExecuting}
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
              type="number"
              value={tp}
              onChange={(e) => setTp(e.target.value)}
              placeholder="Optional"
              disabled={isExecuting}
              className="w-full bg-[#0a0a0a] border border-[#222] rounded-sm py-1.5 px-2 text-white font-mono text-xs focus:outline-none focus:border-[#39ff14]/50"
            />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-1.5">
              Stop Loss
            </div>
            <input
              type="number"
              value={sl}
              onChange={(e) => setSl(e.target.value)}
              placeholder="Optional"
              disabled={isExecuting}
              className="w-full bg-[#0a0a0a] border border-[#222] rounded-sm py-1.5 px-2 text-white font-mono text-xs focus:outline-none focus:border-[#ff4500]/50"
            />
          </div>
        </div>

        {/* Summary */}
        <div className="bg-[#111] p-3 rounded-sm border border-[#222] space-y-2 mt-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-transparent to-[#1a1a1a] pointer-events-none"></div>
          <div className="flex justify-between text-[10px] font-mono text-gray-400 relative z-10">
            <span>Required Margin</span>
            <span className="text-white font-bold">~ ${isNaN(Number(requiredMargin)) ? "0.00" : requiredMargin}</span>
          </div>
          <div className="flex justify-between text-[10px] font-mono text-gray-400 relative z-10">
            <span>Estimated Fee</span>
            <span className="text-white font-bold">~ ${isNaN(Number(estFee)) ? "0.00" : estFee}</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleExecute}
        disabled={isExecuting}
        className={`w-full py-3.5 rounded-sm font-bold tracking-widest uppercase text-sm mt-4 transition-all flex items-center justify-center gap-2 relative overflow-hidden group shrink-0 ${isExecuting ? "bg-gray-600 text-gray-300" : side === "buy" ? "bg-[#39ff14] text-black shadow-[0_0_15px_rgba(57,255,20,0.15)] hover:brightness-110" : "bg-[#ff4500] text-white shadow-[0_0_15px_rgba(255,69,0,0.15)] hover:brightness-110"}`}
      >
        {!isExecuting && (
          <div className="absolute inset-0 w-[150%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
        )}
        {executionResult ? (
          <span className="text-xs">{executionResult}</span>
        ) : isExecuting ? (
          <div className="flex items-center gap-2">
            <span className="block w-4 h-4 rounded-full border-2 border-t-transparent border-current animate-spin"></span>
            Executing...
          </div>
        ) : side === "buy" ? "Execute Long" : "Execute Short"}
      </button>
    </div>
  );
}

function L2OrderBook() {
  const [bids, setBids] = useState<[string, string][]>([]);
  const [asks, setAsks] = useState<[string, string][]>([]);
  const [spread, setSpread] = useState<string>("0.0");
  const [midPrice, setMidPrice] = useState<string>("0.0");
  const [maxVolume, setMaxVolume] = useState<number>(1);

  useEffect(() => {
    let ws = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@depth10@100ms");
    let isMounted = true;
    
    ws.onmessage = (event) => {
      if(!isMounted) return;
      const data = JSON.parse(event.data);
      if (data && data.bids && data.asks) {
        setBids(data.bids.slice(0, 7));
        setAsks(data.asks.slice(0, 7).reverse());
        
        let localMax = 0;
        data.bids.slice(0, 7).forEach((b: any) => localMax = Math.max(localMax, parseFloat(b[1])));
        data.asks.slice(0, 7).forEach((a: any) => localMax = Math.max(localMax, parseFloat(a[1])));
        setMaxVolume(localMax * 1.2 || 1);

        if (data.bids[0] && data.asks[0]) {
           const bestBid = parseFloat(data.bids[0][0]);
           const bestAsk = parseFloat(data.asks[0][0]);
           setSpread((bestAsk - bestBid).toFixed(2));
           setMidPrice(((bestAsk + bestBid) / 2).toFixed(2));
        }
      }
    };
    
    return () => {
      isMounted = false;
      ws.close();
    }
  }, []);

  return (
    <div className="flex-1 bg-[#050505] border border-[#1a1a1a] rounded-sm p-3 flex flex-col relative overflow-hidden shadow-none max-h-[350px] shrink-0">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#1a1a1a]">
        <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
          <Eye className="w-4 h-4 text-[#00f0ff]" />
          L2 Order Book
        </h3>
        <div className="text-[9px] font-mono text-[#0ea5e9]/50 animate-pulse flex items-center gap-1">
           <div className="w-1.5 h-1.5 rounded-full bg-[#00f0ff]"></div>
           LIVE BTCDOM
        </div>
      </div>

      {/* Asks (Red) */}
      <div className="flex-1 flex flex-col justify-end gap-[1px] font-mono text-[10px] overflow-hidden">
        {asks.length > 0 ? asks.map((ask, i) => {
          const price = parseFloat(ask[0]).toFixed(1);
          const size = parseFloat(ask[1]).toFixed(3);
          const sum = (parseFloat(ask[1]) * parseFloat(ask[0]) / 1000).toFixed(1) + "k";
          const depth = Math.min((parseFloat(ask[1]) / maxVolume) * 100, 100);
          return (
            <div key={`ask-${i}`} className="flex justify-between relative py-0.5 px-1 group cursor-pointer hover:bg-white/5 overflow-hidden">
              <div className="absolute top-0 right-0 h-full bg-[#ff4500]/15 transition-all duration-300" style={{ width: `${depth}%` }}></div>
              <span className="text-[#ff4500] relative z-10 font-bold">{price}</span>
              <span className="text-gray-400 relative z-10">{size}</span>
              <span className="text-gray-600 relative z-10">{sum}</span>
            </div>
          );
        }) : [...Array(7)].map((_, i) => (
           <div key={`ask-skel-${i}`} className="flex justify-between py-0.5 px-1 text-gray-700 animate-pulse">
             <span>---.-</span><span>-.---</span><span>--.-k</span>
           </div>
        ))}
      </div>

      {/* Spread Display */}
      <div className="py-1.5 border-y border-[#222] my-1 flex justify-between items-center text-[11px] font-bold font-mono px-2 bg-[#0ea5e9]/5 rounded border border-[#0ea5e9]/20 shadow-[0_0_10px_rgba(14,165,233,0.1)] shrink-0">
        <span className="text-[#39ff14] flex items-center">
          <ArrowUpRight className="w-3.5 h-3.5 mr-1" /> {midPrice !== "0.0" ? midPrice : "..."}
        </span>
        <span className="text-[#00f0ff] text-[9px] flex items-center gap-1">
          <Layers className="w-3 h-3 opacity-50" />
          SPREAD {spread !== "0.0" ? spread : "..."}
        </span>
      </div>

      {/* Bids (Green/Teal) */}
      <div className="flex-1 flex flex-col gap-[1px] font-mono text-[10px] overflow-hidden">
        {bids.length > 0 ? bids.map((bid, i) => {
          const price = parseFloat(bid[0]).toFixed(1);
          const size = parseFloat(bid[1]).toFixed(3);
          const sum = (parseFloat(bid[1]) * parseFloat(bid[0]) / 1000).toFixed(1) + "k";
          const depth = Math.min((parseFloat(bid[1]) / maxVolume) * 100, 100);
          return (
            <div key={`bid-${i}`} className="flex justify-between relative py-0.5 px-1 group cursor-pointer hover:bg-white/5 overflow-hidden">
              <div className="absolute top-0 right-0 h-full bg-[#00f0ff]/10 transition-all duration-300" style={{ width: `${depth}%` }}></div>
              <span className="text-[#0ea5e9] relative z-10 font-bold">{price}</span>
              <span className="text-gray-400 relative z-10">{size}</span>
              <span className="text-gray-600 relative z-10">{sum}</span>
            </div>
          );
        }) : [...Array(7)].map((_, i) => (
           <div key={`bid-skel-${i}`} className="flex justify-between py-0.5 px-1 text-gray-700 animate-pulse">
             <span>---.-</span><span>-.---</span><span>--.-k</span>
           </div>
        ))}
      </div>
    </div>
  );
}

function RecentTrades() {
  const [trades, setTrades] = useState<{ price: string; quantity: string; time: string; isBuyerMaker: boolean }[]>([]);

  useEffect(() => {
    let ws = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@trade");
    let isMounted = true;

    ws.onmessage = (event) => {
      if (!isMounted) return;
      const data = JSON.parse(event.data);
      if (data && data.e === 'trade') {
        const t = new Date(data.T);
        const timeStr = `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}:${t.getSeconds().toString().padStart(2, '0')}`;
        
        setTrades(prev => {
          const newTrade = {
            price: parseFloat(data.p).toFixed(1),
            quantity: parseFloat(data.q).toFixed(4),
            time: timeStr,
            isBuyerMaker: data.m // true = sell, false = buy
          };
          return [newTrade, ...prev].slice(0, 20); // Keep last 20 trades
        });
      }
    };

    return () => {
      isMounted = false;
      ws.close();
    };
  }, []);

  return (
    <div className="bg-[#050505] border border-[#1a1a1a] rounded-sm p-3 flex flex-col relative overflow-hidden shadow-none max-h-[220px] shrink-0">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#1a1a1a]">
        <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#0ea5e9]" />
          Recent Trades
        </h3>
        <div className="text-[9px] font-mono text-[#00f0ff]/50 animate-pulse flex items-center gap-1">
           <div className="w-1.5 h-1.5 rounded-full bg-[#00f0ff]"></div>
           LIVE
        </div>
      </div>
      <div className="flex justify-between text-[9px] font-mono font-bold text-gray-500 px-1 pb-1 mb-1 border-b border-[#111]">
        <span>PRICE [USDT]</span>
        <span>AMOUNT [BTC]</span>
        <span>TIME</span>
      </div>
      <div className="flex-1 flex flex-col gap-[1px] font-mono text-[10px] overflow-y-auto no-scrollbar">
        {trades.length > 0 ? trades.map((trade, i) => (
          <div key={i} className="flex justify-between py-0.5 px-1 hover:bg-white/5 cursor-pointer">
            <span className={trade.isBuyerMaker ? "text-[#ff4500] font-bold" : "text-[#39ff14] font-bold"}>{trade.price}</span>
            <span className="text-gray-300">{trade.quantity}</span>
            <span className="text-gray-600">{trade.time}</span>
          </div>
        )) : [...Array(10)].map((_, i) => (
           <div key={`skel-${i}`} className="flex justify-between py-0.5 px-1 text-gray-700 animate-pulse">
             <span>---.-</span><span>-.----</span><span>--:--:--</span>
           </div>
        ))}
      </div>
    </div>
  );
}

export function LiveMarketsTab() {
  const [dataStream, setDataStream] = useState<number[]>(Array(50).fill(64200));
  const [priceStats, setPriceStats] = useState({ changePercent: 2.14, isPositive: true });
  const [activeTimeframe, setActiveTimeframe] = useState("1D");
  const [isTimeframeDropdownOpen, setIsTimeframeDropdownOpen] = useState(false);
  const [ivRank, setIvRank] = useState(78.4);
  const [detectedPatterns, setDetectedPatterns] = useState<any[]>([]);
  const [toggles, setToggles] = useState({ patterns: true });
  const [heatmapBlocks, setHeatmapBlocks] = useState<number[][]>(() => 
    Array(6).fill(0).map(() => Array(10).fill(0).map(() => Math.random()))
  );

  useEffect(() => {
    const ws = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@ticker");

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.c) {
          const currentPrice = parseFloat(data.c);
          const changePercent = parseFloat(data.P);
          
          setDataStream((prev) => {
            return [...prev.slice(1).length ? prev.slice(1) : Array(49).fill(currentPrice), currentPrice];
          });
          setPriceStats({
            changePercent: Math.abs(changePercent),
            isPositive: changePercent >= 0
          });
        }
      } catch (e) {
        console.error("Error parsing WebSocket data:", e);
      }
    };

    const ivInterval = setInterval(() => {
      setIvRank((prev) => {
        const newValue = prev + (Math.random() - 0.5) * 5;
        return Math.max(0, Math.min(100, newValue));
      });
      setHeatmapBlocks((prev) => 
        prev.map(row => row.map(val => {
          const change = (Math.random() - 0.5) * 0.3;
          return Math.max(0, Math.min(1, val + change));
        }))
      );
    }, 2000);

    return () => {
      ws.close();
      clearInterval(ivInterval);
    };
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
              {dataStream[dataStream.length - 1].toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              <span className={`text-xs flex items-center ${priceStats.isPositive ? 'text-[#39ff14]' : 'text-[#ff4500]'}`}>
                {priceStats.isPositive ? <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" /> : <ArrowUpRight className="w-3.5 h-3.5 stroke-[3] rotate-90" />}
                {priceStats.changePercent.toFixed(2)}%
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

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 relative z-10">
        {/* Main Chart Area (Spans 9 cols) */}
        <div className="col-span-1 xl:col-span-9 flex flex-col gap-6">
          <div className="bg-[#020202] border border-white/10 rounded-2xl p-6 flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-xl relative overflow-hidden group">
            {/* Glassmorphic/Cyberpunk decorative glow */}
            <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-[#0ea5e9]/5 blur-[80px] rounded-full pointer-events-none transition-opacity duration-1000 opacity-40 group-hover:opacity-80"></div>
            <div className="absolute -bottom-[20%] -left-[10%] w-[40%] h-[40%] bg-[#39ff14]/5 blur-[80px] rounded-full pointer-events-none transition-opacity duration-1000 opacity-40 group-hover:opacity-80"></div>
            
            <div className="flex justify-between items-center w-full mb-6 relative z-10">
                <div className="flex gap-2 bg-[#0a0a0a]/50 p-1.5 border border-white/5 rounded-lg backdrop-blur-md relative">
                  {["15m", "1H", "1D"].map((time) => (
                    <button
                      key={time}
                      onClick={() => setActiveTimeframe(time)}
                      className={`px-4 py-1.5 rounded-md text-xs font-bold cursor-pointer transition-all duration-300 ${activeTimeframe === time ? "bg-[#0ea5e9]/20 text-[#0ea5e9] shadow-[0_0_15px_rgba(14,165,233,0.3)] ring-1 ring-[#0ea5e9]/50" : "bg-transparent text-gray-500 hover:text-gray-200 hover:bg-white/5"}`}
                    >
                      {time}
                    </button>
                  ))}
                  <button
                    onClick={() => setIsTimeframeDropdownOpen(!isTimeframeDropdownOpen)}
                    className="flex items-center justify-center px-2 py-1.5 rounded-md text-gray-500 hover:text-gray-200 hover:bg-white/5 transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  <AnimatePresence>
                    {isTimeframeDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 mt-2 w-[180px] bg-[#0a0a0a]/90 backdrop-blur-xl border border-[#222] rounded-lg shadow-xl overflow-hidden z-50 grid grid-cols-3 gap-1 p-2"
                      >
                        {["1m", "3m", "5m", "30m", "2H", "4H", "12H", "1W", "1M"].map((time) => (
                          <button
                            key={time}
                            onClick={() => {
                              setActiveTimeframe(time);
                              setIsTimeframeDropdownOpen(false);
                            }}
                            className={`px-2 py-1.5 rounded text-xs font-bold transition-colors ${activeTimeframe === time ? "bg-[#0ea5e9]/20 text-[#0ea5e9]" : "text-gray-500 hover:text-gray-200 hover:bg-white/5"}`}
                          >
                            {time}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="hidden md:flex gap-3">
                  <div className="flex items-center gap-2 bg-[#0a0a0a]/50 px-3.5 py-2 rounded-lg border border-white/5 backdrop-blur-md shadow-inner transition-colors hover:border-white/10">
                    <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">1H</span>
                    <span className="text-[#39ff14] text-xs font-bold drop-shadow-[0_0_5px_#39ff14]">Bullish</span>
                  </div>
                  <button 
                    onClick={() => setToggles(p => ({ ...p, patterns: !p.patterns }))}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border border-white/5 backdrop-blur-md shadow-inner transition-colors hover:border-white/10 ${toggles.patterns ? 'bg-[#0ea5e9]/20 font-bold text-[#0ea5e9]' : 'bg-[#0a0a0a]/50 text-gray-500'}`}
                    title="Toggle AI Pattern Scanner"
                  >
                    <SearchCode className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-widest">Patterns</span>
                  </button>
                  <div className="flex items-center gap-2 bg-[#0a0a0a]/50 px-3.5 py-2 rounded-lg border border-white/5 backdrop-blur-md shadow-inner transition-colors hover:border-white/10">
                    <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">4H</span>
                    <span className="text-[#39ff14] text-xs font-bold drop-shadow-[0_0_5px_#39ff14]">Bullish</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#0a0a0a]/50 px-3.5 py-2 rounded-lg border border-white/5 backdrop-blur-md shadow-inner transition-colors hover:border-white/10">
                    <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">1D</span>
                    <span className="text-[#facc15] text-xs font-bold drop-shadow-[0_0_5px_#facc15]">Neutral</span>
                  </div>
                </div>
              </div>

            {/* TradingView / lightweight-charts Instance */}
            <div className="w-full border border-white/5 rounded-xl bg-[#030303]/80 relative flex flex-col pt-1 shadow-inner overflow-hidden flex-1">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0ea5e9]/[0.02] pointer-events-none"></div>
              <MarketChart 
                activeTimeframe={activeTimeframe} 
                onPatternsDetected={setDetectedPatterns}
                showPatterns={toggles.patterns}
              />
            </div>
          </div>


          <div className="grid grid-cols-2 gap-6">
            {/* Liquidity Heatmap */}
            <div className="bg-[#020202] border border-white/10 rounded-2xl p-5 flex flex-col h-[200px] shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-[#a855f7]/5 blur-[60px] rounded-full pointer-events-none transition-opacity duration-1000 opacity-40 group-hover:opacity-80"></div>
              <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
                <Activity className="w-4 h-4 text-[#a855f7]" />
                Liquidity Heatmap
              </h3>
              <div className="flex-1 w-full flex flex-col gap-1 relative overflow-hidden rounded-lg z-10">
                {/* Simulated Heatmap Blocks */}
                {heatmapBlocks.map((row, r) => (
                  <div key={r} className="flex gap-1 flex-1">
                    {row.map((intensity, c) => {
                      let color = "bg-[#111] shadow-none";
                      if (intensity > 0.8) color = "bg-[#ff4500] shadow-[0_0_8px_rgba(255,69,0,0.5)]";
                      else if (intensity > 0.6) color = "bg-[#facc15] shadow-[0_0_8px_rgba(250,204,21,0.3)]";
                      else if (intensity > 0.4) color = "bg-[#00f0ff] shadow-[0_0_8px_rgba(0,240,255,0.3)]";
                      return (
                        <div
                          key={c}
                          className={`flex-1 rounded-[2px] opacity-90 transition-colors duration-500 hover:opacity-100 ${color}`}
                        ></div>
                      );
                    })}
                  </div>
                ))}
                {/* Overlay Text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="bg-[#050505]/80 px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest font-bold text-white border border-white/10 rounded-md shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-md">
                    Concentration at $64,800
                  </span>
                </div>
              </div>
            </div>

            {/* Volatility Meter */}
            <div className="bg-[#020202] border border-white/10 rounded-2xl p-5 flex flex-col h-[200px] shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-[#ff00f0]/5 blur-[60px] rounded-full pointer-events-none transition-opacity duration-1000 opacity-40 group-hover:opacity-80"></div>
              <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
                <Cpu className="w-4 h-4 text-[#ff00f0]" />
                Implied Volatility
              </h3>
              <div className="flex-1 flex flex-col justify-center items-center relative z-10">
                <div className="flex items-center gap-4 w-full px-6">
                  <div className="text-gray-500 font-mono text-[10px] uppercase tracking-widest font-bold">Low</div>
                  <div className="flex-1 h-2.5 bg-[#0a0a0a] rounded-full overflow-hidden relative shadow-inner border border-white/5">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#00f0ff] via-[#facc15] to-[#ff4500] rounded-full shadow-[0_0_10px_rgba(255,69,0,0.5)] transition-all duration-1000 ease-out"
                      style={{ width: `${ivRank}%` }}
                    ></div>
                  </div>
                  <div className="text-gray-500 font-mono text-[10px] uppercase tracking-widest font-bold">High</div>
                </div>
                <div className="mt-5 text-center flex flex-col items-center">
                  <span className="text-4xl font-bold font-sans text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 tracking-tight drop-shadow-sm transition-all duration-500">
                    {ivRank.toFixed(1)}
                  </span>
                  <span className="text-[#ff00f0] font-mono text-[9px] uppercase tracking-widest mt-1 border border-[#ff00f0]/30 bg-[#ff00f0]/10 px-2 py-0.5 rounded shadow-[0_0_8px_rgba(255,0,240,0.2)]">
                    IV Rank
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Trade Execution, Order Book & Log (Spans 3 cols) */}
        <div className="col-span-1 xl:col-span-3 flex flex-col gap-6">
          <TradeExecutionPanel currentPrice={dataStream[dataStream.length - 1]} />

          <L2OrderBook />

          <ExecutionLog />
          <AIPatternScanner detectedPatterns={detectedPatterns} />
          <RecentTrades />
        </div>
      </div>
    </motion.div>
  );
}
