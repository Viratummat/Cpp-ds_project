import React, { useMemo } from 'react';
import {
  ArrowUpDown,
  Trophy,
  Code2,
  Sparkles,
  Info,
  Layers,
  Wallet,
  User,
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { selectionSortInvestments } from '../../utils/sorting';
import {
  calculatePortfolioTotal,
  calculateAllocationPercentage,
} from '../../utils/calculations';
import { formatINR, formatPercentage } from '../../utils/currency';
import { EmptyState } from '../common/EmptyState';

export function RankingView() {
  const {
    users,
    selectedUserId,
    setSelectedUserId,
    selectedUser,
    setAddHoldingModal,
    setActiveTab,
  } = usePortfolio();

  const portfolioInvestments = useMemo(() => {
    return selectedUser?.investments || [];
  }, [selectedUser]);

  const totalPortfolio = useMemo(() => {
    return calculatePortfolioTotal(portfolioInvestments);
  }, [portfolioInvestments]);

  // Execute Selection Sort without Array.prototype.sort()
  const { sortedInvestments, stats } = useMemo(() => {
    return selectionSortInvestments(portfolioInvestments);
  }, [portfolioInvestments]);

  const highestInvestment = sortedInvestments.length > 0 ? sortedInvestments[0] : null;

  if (users.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Investment Ranking
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Descending order ranking powered by Selection Sort algorithm
          </p>
        </div>
        <EmptyState
          icon={ArrowUpDown}
          title="No Users Registered"
          description="Create a user profile to test the Selection Sort investment ranking algorithm."
          actionLabel="Create User"
          onAction={() => setActiveTab('users')}
          showSampleDataAction={true}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with User Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 fintech-card">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-800/40 flex items-center justify-center text-amber-400 flex-shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Selection Sort Ranking For
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-lg font-bold text-white">
                {selectedUser?.name}
              </span>
              <span className="font-mono text-xs font-bold text-emerald-400 bg-[#0B0F19] px-2 py-0.5 rounded border border-[#1E293B]">
                ID: {selectedUser?.userID}
              </span>
            </div>
          </div>
        </div>

        {/* User dropdown switcher */}
        <div className="flex items-center gap-3">
          <select
            value={selectedUserId || ''}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="fintech-input text-xs font-semibold min-w-[200px]"
          >
            {users.map((u) => (
              <option key={u.userID} value={u.userID} className="bg-[#111827] text-white">
                {u.name} ({u.userID}) — {u.investments?.length || 0} stocks
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Educational Selection Sort Algorithm Banner */}
      <div className="p-4 sm:p-5 bg-[#0E1524] border border-emerald-500/30 rounded-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Algorithm: Selection Sort (Non-Mutating Descending Order)
            </h3>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs text-slate-400">
            <span>Complexity: <strong className="text-emerald-400">O(n²)</strong></span>
            <span>Comparisons: <strong className="text-cyan-400">{stats.comparisons}</strong></span>
            <span>Swaps: <strong className="text-amber-400">{stats.swaps}</strong></span>
          </div>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
          Matching the original C++ linked-list <code className="text-emerald-300 bg-slate-900 px-1 py-0.5 rounded font-mono">selectionSort()</code> algorithm.
          This implementation operates on an isolated cloned array without invoking JavaScript’s native <code className="text-rose-300 bg-slate-900 px-1 py-0.5 rounded font-mono">.sort()</code> method, ensuring educational integrity and preventing unintentional mutation of stored portfolio state.
        </p>
      </div>

      {/* Summary Cards: Total Portfolio & Highest Investment (Matching C++ program output) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Total Portfolio Investment Card */}
        <div className="p-5 fintech-card border-emerald-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Portfolio Investment
            </span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {formatINR(totalPortfolio)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Across {portfolioInvestments.length} individual stock positions
          </p>
        </div>

        {/* Highest Investment Highlight Card */}
        <div className="p-5 fintech-card border-amber-500/30 bg-gradient-to-br from-[#111827] to-[#1C1917]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-bold">
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
              <p className="text-xs text-slate-400 mt-1">
                {highestInvestment.quantity} shares @ {formatINR(highestInvestment.price)}/sh •{' '}
                <span className="text-emerald-400 font-semibold">
                  {formatPercentage(calculateAllocationPercentage(highestInvestment.totalInvested, totalPortfolio))} allocation
                </span>
              </p>
            </div>
          ) : (
            <div>
              <div className="text-lg font-bold text-slate-500">None</div>
              <p className="text-xs text-slate-500 mt-1">No holdings registered for this user</p>
            </div>
          )}
        </div>
      </div>

      {/* Ranked Table */}
      {portfolioInvestments.length === 0 ? (
        <EmptyState
          icon={Layers}
          title={`No Investments to Rank for ${selectedUser?.name}`}
          description="Add stock holdings to this user's portfolio to rank them by total acquisition amount."
          actionLabel="Add Stock Investment"
          onAction={() => setAddHoldingModal({ isOpen: true, userId: selectedUserId })}
        />
      ) : (
        <div className="fintech-card overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#1E293B] bg-[#0E1524] flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">
                Stocks Ranked from HIGHEST to LOWEST Investment
              </h3>
              <p className="text-xs text-slate-400">
                Sorted by Total Invested using Selection Sort
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400 bg-[#1E293B] px-2.5 py-1 rounded-lg">
              {sortedInvestments.length} Items Sorted
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#1E293B] bg-[#0B0F19]/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6 w-16 text-center">Rank</th>
                  <th className="py-3.5 px-4 sm:px-6">Stock</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Quantity</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Avg Price</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Total Invested</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Portfolio Allocation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]">
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
                          ? 'bg-amber-950/20 hover:bg-amber-950/30 font-medium'
                          : 'hover:bg-[#162033]/60'
                      }`}
                    >
                      {/* Rank Column */}
                      <td className="py-4 px-4 sm:px-6 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-mono font-bold ${
                            isTopRank
                              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50 shadow-sm shadow-amber-950'
                              : rank === 2
                              ? 'bg-slate-300/10 text-slate-300 border border-slate-600'
                              : rank === 3
                              ? 'bg-amber-700/20 text-amber-500 border border-amber-800/40'
                              : 'bg-[#1E293B] text-slate-400'
                          }`}
                        >
                          {rank}
                        </span>
                      </td>

                      {/* Stock Name */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white text-sm">
                            {item.stockName}
                          </span>
                          {isTopRank && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                              <Trophy className="w-3 h-3" />
                              Highest Holding
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="py-4 px-4 sm:px-6 text-right font-mono font-semibold text-slate-200">
                        {item.quantity.toLocaleString('en-IN')}
                      </td>

                      {/* Avg Price */}
                      <td className="py-4 px-4 sm:px-6 text-right font-mono text-slate-300">
                        {formatINR(item.price)}
                      </td>

                      {/* Total Invested */}
                      <td className="py-4 px-4 sm:px-6 text-right font-mono font-bold text-sm">
                        <span className={isTopRank ? 'text-amber-300' : 'text-emerald-400'}>
                          {formatINR(item.totalInvested)}
                        </span>
                      </td>

                      {/* Allocation */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-2 font-mono">
                          <div className="w-16 bg-[#1E293B] h-1.5 rounded-full overflow-hidden hidden sm:block">
                            <div
                              className={`h-full rounded-full ${
                                isTopRank ? 'bg-amber-400' : 'bg-emerald-400'
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
