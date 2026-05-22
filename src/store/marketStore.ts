import { create } from 'zustand';

interface OrderBookLevel {
  price: number;
  size: number;
  total: number;
  depth: number;
}

interface MarketState {
  ticker: {
    price: number;
    changePercent: number;
    isPositive: boolean;
    dataStream: number[];
  };
  orderBook: {
    bids: OrderBookLevel[];
    asks: OrderBookLevel[];
    maxTotal: number;
  };
  recentTrades: { id: string; price: number; qty: number; isBuyerMaker: boolean; time: string }[];
  whaleAlerts: { id: string; timestamp: string; side: 'BUY' | 'SELL'; price: number; qty: number; usdValue: number }[];
  connectBinanceFeeds: () => void;
  disconnectBinanceFeeds: () => void;
  subscribeKline: (symbol: string, interval: string, callback: (kline: any) => void) => () => void;
}

let wsDepth: WebSocket | null = null;
let wsTrade: WebSocket | null = null;
let wsTicker: WebSocket | null = null;
let wsAggTrade: WebSocket | null = null;
let klineSubscriptions: Record<string, { ws: WebSocket, callbacks: Set<(data: any) => void> }> = {};

export const useMarketStore = create<MarketState>((set, get) => ({
  ticker: {
    price: 64200,
    changePercent: 0,
    isPositive: true,
    dataStream: Array(50).fill(64200)
  },
  orderBook: {
    bids: [],
    asks: [],
    maxTotal: 0
  },
  recentTrades: [],
  whaleAlerts: [
      { id: "init-1", timestamp: new Date().toISOString(), side: "BUY", price: 0, qty: 0, usdValue: 0 } // dummy
  ],

  connectBinanceFeeds: () => {
    if (wsDepth || wsTrade || wsTicker || wsAggTrade) return;

    // 1. Ticker Stream
    wsTicker = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@ticker");
    wsTicker.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.c) {
          const currentPrice = parseFloat(data.c);
          const changePercent = parseFloat(data.P);
          
          set((state) => {
            const nextStream = [...state.ticker.dataStream.slice(1), currentPrice];
            return {
              ticker: {
                price: currentPrice,
                changePercent: Math.abs(changePercent),
                isPositive: changePercent >= 0,
                dataStream: nextStream
              }
            };
          });
        }
      } catch (e) {}
    };

    // 2. Orderbook Stream
    wsDepth = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@depth10@100ms");
    wsDepth.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.bids && data.asks) {
           let maxTotal = 0;
           let runBids = 0;
           const bids = data.bids.map((b: string[]) => {
               const price = parseFloat(b[0]);
               const size = parseFloat(b[1]);
               runBids += size;
               return { price, size, total: runBids, depth: 0 };
           });
           let runAsks = 0;
           const asks = data.asks.map((a: string[]) => {
               const price = parseFloat(a[0]);
               const size = parseFloat(a[1]);
               runAsks += size;
               return { price, size, total: runAsks, depth: 0 };
           });
           
           maxTotal = Math.max(runBids, runAsks);
           
           bids.forEach((b: OrderBookLevel) => { b.depth = (b.total / maxTotal) * 100; });
           asks.forEach((a: OrderBookLevel) => { a.depth = (a.total / maxTotal) * 100; });

           set({ orderBook: { bids, asks, maxTotal } });
        }
      } catch (e) {}
    };

    // 3. Trade Stream
    wsTrade = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@trade");
    wsTrade.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.p && data.q) {
           const trade = {
               id: data.t.toString(),
               price: parseFloat(data.p),
               qty: parseFloat(data.q),
               isBuyerMaker: data.m,
               time: new Date(data.T).toLocaleTimeString([], { hour12: false })
           };
           set((state) => ({
               recentTrades: [trade, ...state.recentTrades].slice(0, 50)
           }));
        }
      } catch (e) {}
    };

    // 4. AggTrade Stream (Whale alerts)
    wsAggTrade = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@aggTrade");
    wsAggTrade.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data && data.e === 'aggTrade') {
                const price = parseFloat(data.p);
                const qty = parseFloat(data.q);
                const usdValue = price * qty;
                if (usdValue >= 50000) { // Large orders (trimmed to 50k for more actions)
                   set((state) => ({
                       whaleAlerts: [{
                           id: data.a.toString(),
                           timestamp: new Date(data.T).toISOString(),
                           side: (data.m ? "SELL" : "BUY") as "BUY" | "SELL",
                           price,
                           qty,
                           usdValue
                       }, ...state.whaleAlerts].slice(0, 50)
                   }));
                }
            }
        } catch (e) {}
    };
  },

  disconnectBinanceFeeds: () => {
     if (wsTicker) { wsTicker.close(); wsTicker = null; }
     if (wsDepth) { wsDepth.close(); wsDepth = null; }
     if (wsTrade) { wsTrade.close(); wsTrade = null; }
     if (wsAggTrade) { wsAggTrade.close(); wsAggTrade = null; }
  },

  subscribeKline: (symbol: string, interval: string, callback: (kline: any) => void) => {
     const key = `${symbol}_${interval}`;
     if (!klineSubscriptions[key]) {
         const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@kline_${interval}`);
         klineSubscriptions[key] = { ws, callbacks: new Set() };
         ws.onmessage = (event) => {
             try {
                 const data = JSON.parse(event.data);
                 if (data.k) {
                     klineSubscriptions[key].callbacks.forEach(cb => cb(data.k));
                 }
             } catch (e) {}
         };
     }
     
     klineSubscriptions[key].callbacks.add(callback);
     
     return () => {
         if (klineSubscriptions[key]) {
             klineSubscriptions[key].callbacks.delete(callback);
             if (klineSubscriptions[key].callbacks.size === 0) {
                 klineSubscriptions[key].ws.close();
                 delete klineSubscriptions[key];
             }
         }
     };
  }
}));
