import React, { useMemo } from 'react';
import {
  ArrowUpDown,
  Trophy,
  Code2,
  Sparkles,
  Wallet,
  FolderPlus,
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { selectionSortInvestments } from '../../utils/sorting';
import {
  calculatePortfolioTotal,
  calculateAllocationPercentage,
} from '../../utils/calculations';
import { formatINR, formatPercentage } from '../../utils/currency';

export function RankingView() {
  const {
    users,
    selectedUserId,
    setSelectedUserId,
    selectedUser,
    setAddHoldingModal,
    setAddUserModalOpen,
  } = usePortfolio();

  const portfolioInvestments = useMemo(() => {
    return selectedUser?.investments || [];
  }, [selectedUser]);

  const totalPortfolio = useMemo(() => {
    return calculatePortfolioTotal(portfolioInvestments);
  }, [portfolioInvestments]);

  // Execute pure Selection Sort without Array.prototype.sort()
  const { sortedInvestments, stats } = useMemo(() => {
    return selectionSortInvestments(portfolioInvestments);
  }, [portfolioInvestments]);

  const highestInvestment = sortedInvestments.length > 0 ? sortedInvestments[0] : null;

  if (users.length === 0) {
    return (
      <div className="space-y-8 pb-16">
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-purple-400 block mb-1">
            ALGORITHM TELEMETRY
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Investment Ranking
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Descending order ranking powered by Selection Sort algorithm
          </p>
        </div>

        <div className="glass-card p-12 text-center border-dashed border-white/10">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto mb-4 text-purple-400">
            <FolderPlus className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            No users registered yet
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
            Register a user and add stock investments to evaluate the Selection Sort descending ranking algorithm.
          </p>
          <button
            onClick={() => setAddUserModalOpen(true)}
            className="pill-btn-neon"
          >
            + Register User Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* User Switcher Header */}
      <div className="glass-card p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-[0.2em] text-slate-400 uppercase block">
              Selection Sort Ranking For
            </span>
            <div className="flex items-center gap-2.5 mt-0.5">
              <span className="text-xl font-bold text-white">
                {selectedUser?.name}
              </span>
              <span className="font-mono text-xs font-bold text-purple-300 bg-purple-950/50 px-2 py-0.5 rounded border border-purple-800/40">
                ID: {selectedUser?.userID}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedUserId || ''}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="cosmic-input !w-auto text-xs font-mono font-semibold"
          >
            {users.map((u) => (
              <option key={u.userID} value={u.userID} className="bg-[#0B0D14] text-white">
                {u.name} ({u.userID}) — {u.investments?.length || 0} stocks
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selection Sort Telemetry Banner */}
      <div className="glass-card p-5 border-purple-500/30 bg-purple-950/[0.15]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Selection Sort Engine (O(n²) Descending)
            </h3>
          </div>
          <div className="flex items-center gap-4 font-mono text-xs text-slate-400">
            <span>Complexity: <strong className="text-purple-300">O(n²)</strong></span>
            <span>Comparisons: <strong className="text-cyan-300">{stats.comparisons}</strong></span>
            <span>Swaps: <strong className="text-amber-300">{stats.swaps}</strong></span>
          </div>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl font-sans">
          Replicating the original C++ <code className="text-purple-300 bg-black/60 px-1 py-0.5 rounded font-mono">selectionSort()</code> logic. Operates on an isolated clone of the holdings array to maintain non-mutating safety, ranking elements strictly by Total Invested without using JavaScript's native <code className="text-rose-300 bg-black/60 px-1 py-0.5 rounded font-mono">.sort()</code>.
        </p>
      </div>

      {/* Summary Cards: Total Portfolio & Highest Investment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              Total Portfolio Investment
            </span>
            <Wallet className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {formatINR(totalPortfolio)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Across {portfolioInvestments.length} individual stock positions
          </p>
        </div>

        <div className="glass-card p-5 border-amber-500/25 bg-amber-950/[0.1]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-amber-300 uppercase tracking-widest flex items-center gap-1.5 font-bold">
              <Trophy className="w-3.5 h-3.5" />
              Highest Investment (Rank #1)
            </span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          {highestInvestment ? (
            <div>
              <div className="text-2xl font-extrabold text-amber-300 font-mono">
                {highestInvestment.stockName}{' '}
                <span className="text-lg text-white font-normal">
                  ({formatINR(highestInvestment.totalInvested)})
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {highestInvestment.quantity} shares @ {formatINR(highestInvestment.price)}/sh •{' '}
                <span className="text-purple-300 font-semibold font-mono">
                  {formatPercentage(calculateAllocationPercentage(highestInvestment.totalInvested, totalPortfolio))} allocation
                </span>
              </p>
            </div>
          ) : (
            <div>
              <div className="text-lg font-bold text-slate-500">None</div>
              <p className="text-[11px] text-slate-500 mt-1">No investments added yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Ranked Table */}
      {portfolioInvestments.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <h4 className="text-base font-bold text-white mb-1">
            No investments added yet for {selectedUser?.name}
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
            Add stock holdings to this user's portfolio to rank them by total invested capital.
          </p>
          <button
            onClick={() => setAddHoldingModal({ isOpen: true, userId: selectedUserId })}
            className="pill-btn-neon !text-xs"
          >
            + Add Stock Investment
          </button>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-white/[0.06] bg-black/40 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Stocks Ranked from HIGHEST to LOWEST Investment
              </h3>
              <p className="text-[11px] text-slate-400">
                Sorted by Total Invested using Selection Sort
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-purple-300 bg-white/[0.04] border border-white/10 px-2.5 py-1 rounded-lg">
              {sortedInvestments.length} Items Sorted
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-black/30 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">
                  <th className="py-3.5 px-4 sm:px-6 w-16 text-center">Rank</th>
                  <th className="py-3.5 px-4 sm:px-6">Stock</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Quantity</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Avg Price</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Total Invested</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Allocation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {sortedInvestments.map((item, index) => {
                  const rank = index + 1;
                  const isTopRank = rank === 1;
                  const allocation = calculateAllocationPercentage(
                    item.totalInvested,
                    totalPortfolio
                  );

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isTopRank
                          ? 'bg-amber-500/[0.05] hover:bg-amber-500/[0.08]'
                          : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-4 px-4 sm:px-6 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-mono font-bold ${
                            isTopRank
                              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50'
                              : 'bg-white/[0.04] text-slate-400 border border-white/10'
                          }`}
                        >
                          {rank}
                        </span>
                      </td>

                      {/* Stock */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white text-sm">
                            {item.stockName}
                          </span>
                          {isTopRank && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                              <Trophy className="w-3 h-3" />
                              Highest Holding
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="py-4 px-4 sm:px-6 text-right font-mono text-slate-200">
                        {item.quantity.toLocaleString('en-IN')}
                      </td>

                      {/* Avg Price */}
                      <td className="py-4 px-4 sm:px-6 text-right font-mono text-slate-300">
                        {formatINR(item.price)}
                      </td>

                      {/* Total Invested */}
                      <td className="py-4 px-4 sm:px-6 text-right font-mono font-bold text-sm">
                        <span className={isTopRank ? 'text-amber-300' : 'text-purple-300'}>
                          {formatINR(item.totalInvested)}
                        </span>
                      </td>

                      {/* Allocation */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-2 font-mono">
                          <div className="w-16 bg-white/[0.06] h-1.5 rounded-full overflow-hidden hidden sm:block">
                            <div
                              className={`h-full rounded-full ${
                                isTopRank ? 'bg-amber-400' : 'bg-purple-400'
                              }`}
                              style={{ width: `${Math.min(100, allocation)}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-200">
                            {formatPercentage(allocation)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
