import React, { useState, useMemo } from 'react';
import {
  PieChart as PieChartIcon,
  PlusCircle,
  Search,
  Trash2,
  Edit2,
  Layers,
  Wallet,
  ArrowUpDown,
  User,
  Plus,
  FolderPlus,
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { AllocationChart } from '../dashboard/AllocationChart';
import {
  calculatePortfolioTotal,
  calculateAllocationPercentage,
} from '../../utils/calculations';
import { formatINR, formatPercentage } from '../../utils/currency';

export function PortfolioView() {
  const {
    users,
    selectedUserId,
    setSelectedUserId,
    selectedUser,
    setAddHoldingModal,
    setEditHoldingModal,
    deleteHolding,
    setActiveTab,
    setAddUserModalOpen,
  } = usePortfolio();

  const [holdingsSearch, setHoldingsSearch] = useState('');

  const portfolioInvestments = useMemo(() => {
    return selectedUser?.investments || [];
  }, [selectedUser]);

  const totalPortfolio = useMemo(() => {
    return calculatePortfolioTotal(portfolioInvestments);
  }, [portfolioInvestments]);

  const filteredHoldings = useMemo(() => {
    if (!holdingsSearch.trim()) return portfolioInvestments;
    const query = holdingsSearch.trim().toUpperCase();
    return portfolioInvestments.filter((h) =>
      h.stockName.toUpperCase().includes(query)
    );
  }, [portfolioInvestments, holdingsSearch]);

  if (users.length === 0) {
    return (
      <div className="space-y-8 pb-16">
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-purple-400 block mb-1">
            PORTFOLIO LEDGER
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Asset Holdings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track individual stock allocations and weighted-average acquisition prices
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
            Register an investor profile first to begin creating stock portfolios and tracking acquisition costs.
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
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-purple-400 flex-shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-[0.2em] text-slate-400 uppercase block">
              Viewing Portfolio For
            </span>
            <div className="flex items-center gap-2.5 mt-0.5">
              <span className="text-xl font-bold text-white">
                {selectedUser?.name || 'No user selected'}
              </span>
              {selectedUser && (
                <span className="font-mono text-xs font-bold text-purple-300 bg-purple-950/50 px-2 py-0.5 rounded border border-purple-800/40">
                  ID: {selectedUser.userID}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* User Switcher & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
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

          <button
            onClick={() => setActiveTab('ranking')}
            className="pill-btn-secondary !text-xs !py-2"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-purple-400" />
            <span>Selection Sort</span>
          </button>

          <button
            onClick={() => setAddHoldingModal({ isOpen: true, userId: selectedUserId })}
            className="pill-btn-neon !text-xs !py-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Stock</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">
            Total Invested
          </span>
          <div className="text-2xl font-extrabold text-white font-mono">
            {formatINR(totalPortfolio)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Cumulative acquisition cost
          </p>
        </div>

        <div className="glass-card p-5">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">
            Stock Positions
          </span>
          <div className="text-2xl font-extrabold text-white font-mono">
            {portfolioInvestments.length} Holdings
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Unique stock positions in portfolio
          </p>
        </div>

        <div className="glass-card p-5">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">
            Average Position Cost
          </span>
          <div className="text-2xl font-extrabold text-white font-mono">
            {portfolioInvestments.length > 0
              ? formatINR(totalPortfolio / portfolioInvestments.length)
              : '₹0.00'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Capital allocated per holding
          </p>
        </div>
      </div>

      {/* Allocation Chart */}
      {portfolioInvestments.length > 0 && (
        <div className="glass-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Asset Allocation Breakdown
              </h3>
            </div>
            <span className="font-mono text-xs font-bold text-purple-400">
              100% Capital Accounted
            </span>
          </div>
          <AllocationChart
            holdings={portfolioInvestments}
            totalPortfolio={totalPortfolio}
          />
        </div>
      )}

      {/* Holdings Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/[0.06] bg-black/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Stock Holdings
            </h3>
            <p className="text-[11px] text-slate-400">
              Weighted-average acquisition costs and portfolio allocation percentages
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={holdingsSearch}
                onChange={(e) => setHoldingsSearch(e.target.value)}
                placeholder="Filter stocks..."
                className="cosmic-input pl-8 !py-1.5 text-xs w-44 sm:w-52"
              />
            </div>

            <button
              onClick={() => setAddHoldingModal({ isOpen: true, userId: selectedUserId })}
              className="pill-btn-neon !py-1.5 !px-3 !text-xs whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Stock</span>
            </button>
          </div>
        </div>

        {portfolioInvestments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto mb-3 text-purple-400">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white mb-1">
              No investments added yet
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
              Add your first stock investment with quantity and price to view portfolio metrics.
            </p>
            <button
              onClick={() => setAddHoldingModal({ isOpen: true, userId: selectedUserId })}
              className="pill-btn-neon !text-xs"
            >
              + Add First Stock
            </button>
          </div>
        ) : filteredHoldings.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 font-mono">
            No holdings found matching "{holdingsSearch}"
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-black/30 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">
                  <th className="py-3 px-4 sm:px-6">Stock</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Quantity</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Avg Purchase Price</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Total Invested</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Allocation</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredHoldings.map((holding) => {
                  const allocation = calculateAllocationPercentage(
                    holding.totalInvested,
                    totalPortfolio
                  );

                  return (
                    <tr
                      key={holding.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Stock Name */}
                      <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-white text-sm">
                        {holding.stockName}
                      </td>

                      {/* Quantity */}
                      <td className="py-3.5 px-4 sm:px-6 text-right font-mono text-slate-200">
                        {holding.quantity.toLocaleString('en-IN')}
                      </td>

                      {/* Avg Price */}
                      <td className="py-3.5 px-4 sm:px-6 text-right font-mono text-slate-300">
                        {formatINR(holding.price)}
                      </td>

                      {/* Total Invested */}
                      <td className="py-3.5 px-4 sm:px-6 text-right font-mono font-bold text-purple-300">
                        {formatINR(holding.totalInvested)}
                      </td>

                      {/* Portfolio Allocation */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-2 font-mono">
                          <div className="w-16 bg-white/[0.06] h-1.5 rounded-full overflow-hidden hidden sm:block">
                            <div
                              className="bg-gradient-to-r from-purple-400 to-indigo-400 h-full rounded-full"
                              style={{ width: `${Math.min(100, allocation)}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-300">
                            {formatPercentage(allocation)}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setAddHoldingModal({
                                isOpen: true,
                                userId: selectedUserId,
                              });
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-purple-300 hover:bg-white/[0.06] transition-colors"
                            title="Add More Shares (Weighted Average)"
                          >
                            <PlusCircle className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setEditHoldingModal({
                                isOpen: true,
                                userId: selectedUserId,
                                holding,
                              });
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                            title="Edit Holding"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => deleteHolding(selectedUserId, holding.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                            title="Remove Holding"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
