import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSystemStore } from "../../store/systemStore";
import { BarChart2, Calendar, DollarSign, Activity, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";

interface Trade {
  id: string;
  asset_id: string;
  action: "BUY" | "SELL";
  size: number;
  price: number;
  pnl: number | null;
  status: string;
  created_at: string;
}

export function HistoryTab() {
  const { activePortfolio } = useSystemStore();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchTrades = async (pageNum: number, isNewPortfolio: boolean = false) => {
    if (!activePortfolio) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/portfolio/${activePortfolio.id}/trades?page=${pageNum}&limit=50`
      );
      if (!res.ok) {
        throw new Error(`Failed to fetch trades: ${res.statusText}`);
      }
      const data: Trade[] = await res.json();
      
      if (isNewPortfolio) {
        setTrades(data);
      } else {
        setTrades((prev) => {
          // Avoid duplicate trades
          const existingIds = new Set(prev.map((t) => t.id));
          const filteredNew = data.filter((t) => !existingIds.has(t.id));
          return [...prev, ...filteredNew];
        });
      }

      // If we got fewer records than 50, we reached the end
      if (data.length < 50) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while fetching trade history.");
    } finally {
      setLoading(false);
    }
  };

  // When activeportfolio changes, reset state and load first page
  useEffect(() => {
    if (activePortfolio) {
      setTrades([]);
      setPage(1);
      setHasMore(true);
      fetchTrades(1, true);
    }
  }, [activePortfolio]);

  // Load more when page changes (only if page > 1)
  useEffect(() => {
    if (page > 1 && activePortfolio) {
      fetchTrades(page, false);
    }
  }, [page]);

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const handleRefresh = () => {
    if (activePortfolio) {
      setPage(1);
      setHasMore(true);
      fetchTrades(1, true);
    }
  };

  return (
    <motion.div
      key="history"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col min-h-full py-6 w-full font-mono gap-6"
    >
      {/* Tab Header */}
      <div className="flex justify-between items-end mb-2 border-b border-white/10 pb-4 relative">
        <div className="absolute top-0 right-0 w-[30%] h-full bg-[#39ff14]/5 blur-[60px] pointer-events-none"></div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3 font-sans">
            <div className="w-10 h-10 rounded-lg bg-[#39ff14]/10 flex items-center justify-center border border-[#39ff14]/30 shadow-[0_0_15px_rgba(57,255,20,0.1)]">
              <Activity className="w-5 h-5 text-[#39ff14]" />
            </div>
            Trade Execution History
          </h1>
          <p className="text-gray-400 text-xs mt-2 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#39ff14] animate-pulse"></span>
            Real-time ledger of completed trades and orders
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading || !activePortfolio}
          className="flex items-center gap-2 bg-[#050505] border border-white/10 text-gray-400 hover:text-white hover:border-[#39ff14]/50 focus:border-[#39ff14] px-4 py-2 rounded text-xs px-3 py-1.5 font-bold transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#39ff14]" : ""}`} />
          Refresh Ledger
        </button>
      </div>

      {error && (
        <div className="bg-red-950/20 border border-red-500/40 text-red-400 p-4 rounded text-xs uppercase tracking-wider">
          ⚠ ERROR: {error}
        </div>
      )}

      {/* Main Table Grid Container */}
      <div className="bg-[#050505] border border-[#1a1a1a] rounded flex flex-col relative overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1a1a1a] bg-black/40 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                <th className="py-4 px-6">Date &amp; Time</th>
                <th className="py-4 px-6">Asset</th>
                <th className="py-4 px-6 text-center">Action</th>
                <th className="py-4 px-6 text-right">Size</th>
                <th className="py-4 px-6 text-right">Price</th>
                <th className="py-4 px-6 text-right">PnL</th>
                <th className="py-4 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => {
                const isBuy = trade.action === "BUY";
                const pnlValue = trade.pnl;
                const dynamicPnlStyle =
                  pnlValue !== null
                    ? pnlValue >= 0
                      ? "text-[#39ff14]"
                      : "text-[#ff4500]"
                    : "text-gray-500";

                return (
                  <tr
                    key={trade.id}
                    className={`border-b border-[#121212] hover:bg-[#0c0c0c] transition-colors text-xs font-mono group`}
                    style={{
                      borderLeft: `3px solid ${isBuy ? "#39ff1422" : "#ff450022"}`,
                    }}
                  >
                    <td className="py-4 px-6 text-gray-400 font-medium whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 opacity-40 text-gray-500 group-hover:opacity-75" />
                        {new Date(trade.created_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-white font-bold tracking-wide">
                      {trade.asset_id}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold tracking-widest border uppercase ${
                          isBuy
                            ? "bg-[#39ff14]/5 text-[#39ff14] border-[#39ff14]/20"
                            : "bg-[#ff4500]/5 text-[#ff4500] border-[#ff4500]/20"
                        }`}
                      >
                        {trade.action}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-gray-300 font-bold">
                      {trade.size.toFixed(4)}
                    </td>
                    <td className="py-4 px-6 text-right text-[#00f0ff] font-bold">
                      ${trade.price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className={`py-4 px-6 text-right font-bold ${dynamicPnlStyle}`}>
                      {pnlValue !== null ? (
                        <>
                          {pnlValue >= 0 ? "+" : "-"}
                          $
                          {Math.abs(pnlValue).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </>
                      ) : (
                        "--"
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-bold border ${
                          trade.status === "CLOSED"
                            ? "bg-gray-800/40 text-gray-400 border-gray-700/50"
                            : "bg-[#00f0ff]/10 text-[#00f0ff] border-[#00f0ff]/30 animate-pulse"
                        }`}
                      >
                        {trade.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-full h-11 bg-[#111] animate-pulse rounded border border-[#1a1a1a]/40"
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && trades.length === 0 && (
          <div className="flex flex-col items-center justify-center p-16 text-center border-t border-[#1a1a1a]">
            <div className="w-16 h-16 rounded-full bg-linear-to-b from-[#111] to-black border border-[#222] flex items-center justify-center shadow-inner mb-4">
              <BarChart2 className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-1">
              No trade history yet
            </h3>
            <p className="text-xs text-gray-500 max-w-xs font-sans">
              Deploy your AI agent or run manual trades to start building your portfolio history ledger.
            </p>
          </div>
        )}

        {/* Load more button */}
        {!loading && trades.length > 0 && hasMore && (
          <div className="p-4 border-t border-[#111] flex justify-center bg-black/20">
            <button
              onClick={handleLoadMore}
              className="text-xs font-bold uppercase tracking-widest text-[#00f0ff] hover:text-white bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 border border-[#00f0ff]/30 px-6 py-2.5 rounded transition-all cursor-pointer shadow-lg active:scale-98"
            >
              Load More Historical Logs
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
