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
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { StatCard } from '../common/StatCard';
import { AllocationChart } from '../dashboard/AllocationChart';
import { EmptyState } from '../common/EmptyState';
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

  // Calculations for current user
  const portfolioInvestments = useMemo(() => {
    return selectedUser?.investments || [];
  }, [selectedUser]);

  const totalPortfolio = useMemo(() => {
    return calculatePortfolioTotal(portfolioInvestments);
  }, [portfolioInvestments]);

  // Filtered holdings
  const filteredHoldings = useMemo(() => {
    if (!holdingsSearch.trim()) return portfolioInvestments;
    const query = holdingsSearch.trim().toUpperCase();
    return portfolioInvestments.filter((h) =>
      h.stockName.toUpperCase().includes(query)
    );
  }, [portfolioInvestments, holdingsSearch]);

  if (users.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Portfolio Tracker
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Individual user holdings and allocation analysis
          </p>
        </div>
        <EmptyState
          icon={Wallet}
          title="No Users Available"
          description="Register an investor profile before managing stock portfolios."
          actionLabel="Create User"
          onAction={() => setAddUserModalOpen(true)}
          showSampleDataAction={true}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Switcher Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 fintech-card">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Viewing Portfolio For
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-lg font-bold text-white">
                {selectedUser?.name || 'Select a user'}
              </span>
              <span className="font-mono text-xs font-bold text-emerald-400 bg-[#0B0F19] px-2 py-0.5 rounded border border-[#1E293B]">
                ID: {selectedUser?.userID}
              </span>
            </div>
          </div>
        </div>

        {/* User Switcher Dropdown & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[200px]">
            <select
              value={selectedUserId || ''}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="fintech-input text-xs font-semibold"
            >
              {users.map((u) => (
                <option key={u.userID} value={u.userID} className="bg-[#111827] text-white">
                  {u.name} ({u.userID}) — {u.investments?.length || 0} stocks
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setActiveTab('ranking')}
            className="fintech-btn-secondary !text-xs !py-2"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
            Selection Sort Ranking
          </button>

          <button
            onClick={() => setAddHoldingModal({ isOpen: true, userId: selectedUserId })}
            className="fintech-btn-primary !text-xs !py-2"
          >
            <PlusCircle className="w-3.5 h-3.5 text-slate-950" />
            Add Stock
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Portfolio Investment"
          value={formatINR(totalPortfolio)}
          subtitle="Cumulative acquisition cost of all shares"
          icon={Wallet}
          accentColor="emerald"
        />

        <StatCard
          title="Different Stocks"
          value={`${portfolioInvestments.length} Holdings`}
          subtitle="Unique stock positions in portfolio"
          icon={Layers}
          accentColor="cyan"
        />

        <StatCard
          title="Average Holding Cost"
          value={
            portfolioInvestments.length > 0
              ? formatINR(totalPortfolio / portfolioInvestments.length)
              : '₹0.00'
          }
          subtitle="Average capital allocated per stock position"
          icon={PieChartIcon}
          accentColor="purple"
        />
      </div>

      {/* Allocation Chart & Details */}
      {portfolioInvestments.length > 0 && (
        <div className="fintech-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1E293B]">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-emerald-400" />
                Portfolio Asset Allocation
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Relative percentage distribution of investments
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-400">
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
      <div className="fintech-card overflow-hidden">
        {/* Table Header / Toolbar */}
        <div className="p-4 sm:p-5 border-b border-[#1E293B] bg-[#0E1524] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white">Stock Holdings</h3>
            <p className="text-xs text-slate-400">
              Individual positions with weighted-average purchase prices
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={holdingsSearch}
                onChange={(e) => setHoldingsSearch(e.target.value)}
                placeholder="Filter stocks..."
                className="fintech-input pl-8 !py-1.5 !text-xs w-44 sm:w-56"
              />
            </div>

            <button
              onClick={() => setAddHoldingModal({ isOpen: true, userId: selectedUserId })}
              className="fintech-btn-primary !py-1.5 !px-3 !text-xs whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 text-slate-950" />
              Add Stock
            </button>
          </div>
        </div>

        {portfolioInvestments.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Layers}
              title={`No Investments in ${selectedUser?.name}'s Portfolio`}
              description="This user does not own any stocks yet. Add their first stock holding with quantity and purchase price."
              actionLabel="Add Stock to Portfolio"
              onAction={() => setAddHoldingModal({ isOpen: true, userId: selectedUserId })}
            />
          </div>
        ) : filteredHoldings.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-300 font-semibold mb-1">
              No holdings found matching "{holdingsSearch}"
            </p>
            <button
              onClick={() => setHoldingsSearch('')}
              className="text-xs text-emerald-400 underline mt-2"
            >
              Clear Filter
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#1E293B] bg-[#0B0F19]/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-6">Stock Name</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Quantity</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Avg Purchase Price</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Total Invested</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Portfolio Allocation</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]">
                {filteredHoldings.map((holding) => {
                  const allocation = calculateAllocationPercentage(
                    holding.totalInvested,
                    totalPortfolio
                  );

                  return (
                    <tr
                      key={holding.id}
                      className="hover:bg-[#162033]/60 transition-colors group"
                    >
                      {/* Stock Name */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white text-sm">
                            {holding.stockName}
                          </span>
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="py-3.5 px-4 sm:px-6 text-right font-mono font-semibold text-slate-200">
                        {holding.quantity.toLocaleString('en-IN')}
                      </td>

                      {/* Average Purchase Price */}
                      <td className="py-3.5 px-4 sm:px-6 text-right font-mono text-slate-300">
                        {formatINR(holding.price)}
                      </td>

                      {/* Total Invested */}
                      <td className="py-3.5 px-4 sm:px-6 text-right font-mono font-bold text-emerald-400">
                        {formatINR(holding.totalInvested)}
                      </td>

                      {/* Portfolio Allocation */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-2 font-mono">
                          <div className="w-16 bg-[#1E293B] h-1.5 rounded-full overflow-hidden hidden sm:block">
                            <div
                              className="bg-emerald-400 h-full rounded-full"
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
                          {/* Add More Shares */}
                          <button
                            onClick={() => {
                              setAddHoldingModal({
                                isOpen: true,
                                userId: selectedUserId,
                              });
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-[#1E293B] transition-colors"
                            title="Add more shares to this stock (Weighted Average)"
                          >
                            <PlusCircle className="w-4 h-4" />
                          </button>

                          {/* Edit Holding */}
                          <button
                            onClick={() => {
                              setEditHoldingModal({
                                isOpen: true,
                                userId: selectedUserId,
                                holding,
                              });
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] transition-colors"
                            title="Edit Holding"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete Holding */}
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
