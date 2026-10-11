import React, { useMemo } from 'react';
import {
  Wallet,
  Users,
  Layers,
  Award,
  PlusCircle,
  UserPlus,
  Search,
  Database,
  ArrowRight,
  PieChart as PieChartIcon,
  TrendingUp,
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { StatCard } from '../common/StatCard';
import { AllocationChart } from './AllocationChart';
import { EmptyState } from '../common/EmptyState';
import { formatINR, formatPercentage, formatNumber } from '../../utils/currency';
import { calculatePortfolioTotal } from '../../utils/calculations';

export function DashboardOverview() {
  const {
    users,
    systemMetrics,
    setAddUserModalOpen,
    setAddHoldingModal,
    setSearchUserModalOpen,
    setSelectedUserId,
    setActiveTab,
    selectedUserId,
  } = usePortfolio();

  // Flatten all holdings across all users for aggregate allocation & recent activity
  const allHoldings = useMemo(() => {
    const list = [];
    users.forEach((u) => {
      (u.investments || []).forEach((inv) => {
        list.push({
          ...inv,
          userId: u.userID,
          userName: u.name,
        });
      });
    });
    return list;
  }, [users]);

  // Aggregate holdings grouped by stock symbol across all users
  const consolidatedStocks = useMemo(() => {
    const stockMap = new Map();
    allHoldings.forEach((h) => {
      const sym = h.stockName;
      if (!stockMap.has(sym)) {
        stockMap.set(sym, {
          stockName: sym,
          quantity: 0,
          totalInvested: 0,
          price: 0,
        });
      }
      const existing = stockMap.get(sym);
      existing.quantity += h.quantity;
      existing.totalInvested += h.totalInvested;
      existing.price = existing.totalInvested / existing.quantity;
    });
    return Array.from(stockMap.values());
  }, [allHoldings]);

  // Recent activity: sort by addedAt or lastAddedAt descending
  const recentActivity = useMemo(() => {
    const sorted = [...allHoldings].sort((a, b) => {
      const dateA = new Date(a.lastAddedAt || a.addedAt || 0).getTime();
      const dateB = new Date(b.lastAddedAt || b.addedAt || 0).getTime();
      return dateB - dateA;
    });
    return sorted.slice(0, 5);
  }, [allHoldings]);

  if (users.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Portfolio Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            System Dashboard • C++ Stock Portfolio Tracker (v1.0)
          </p>
        </div>

        <EmptyState
          icon={Users}
          title="No Users Registered Yet"
          description="The system currently has no users. Register your first user profile to start adding stocks and building portfolios, or explore with a pre-configured sample dataset."
          actionLabel="Create First User"
          onAction={() => setAddUserModalOpen(true)}
          showSampleDataAction={true}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time aggregate telemetry across {users.length} registered user profiles
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSearchUserModalOpen(true)}
            className="fintech-btn-secondary !text-xs !py-2"
          >
            <Search className="w-3.5 h-3.5 text-emerald-400" />
            Find User
          </button>
          <button
            onClick={() => setAddUserModalOpen(true)}
            className="fintech-btn-secondary !text-xs !py-2"
          >
            <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
            New User
          </button>
          <button
            onClick={() => setAddHoldingModal({ isOpen: true, userId: selectedUserId || users[0].userID })}
            className="fintech-btn-primary !text-xs !py-2"
          >
            <PlusCircle className="w-3.5 h-3.5 text-slate-950" />
            Add Stock
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Invested (All Users)"
          value={formatINR(systemMetrics.totalInvested)}
          subtitle="Total acquisition cost across all portfolios"
          icon={Wallet}
          accentColor="emerald"
          badgeText="Active"
        />

        <StatCard
          title="Registered Users"
          value={formatNumber(systemMetrics.totalUsers)}
          subtitle={`Max capacity: 100 users (C++ limit)`}
          icon={Users}
          accentColor="cyan"
          badgeText={`${systemMetrics.totalUsers}/100`}
        />

        <StatCard
          title="Unique Stock Symbols"
          value={formatNumber(systemMetrics.uniqueStocksCount)}
          subtitle={`${systemMetrics.totalHoldingsCount} total holding positions`}
          icon={Layers}
          accentColor="purple"
        />

        <StatCard
          title="Largest Single Holding"
          value={
            systemMetrics.largestHolding
              ? formatINR(systemMetrics.largestHolding.totalInvested)
              : '₹0.00'
          }
          subtitle={
            systemMetrics.largestHolding
              ? `${systemMetrics.largestHolding.stockName} (${systemMetrics.largestHolding.userName})`
              : 'No holdings registered'
          }
          icon={Award}
          accentColor="amber"
          badgeText={systemMetrics.largestHolding?.stockName || 'None'}
        />
      </div>

      {/* Charts & Top Holdings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: System Portfolio Allocation */}
        <div className="lg:col-span-7 fintech-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1E293B]">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-emerald-400" />
                Aggregated Asset Allocation
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Consolidated equity exposure across all registered portfolios
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {formatINR(systemMetrics.totalInvested)}
            </span>
          </div>

          <AllocationChart
            holdings={consolidatedStocks}
            totalPortfolio={systemMetrics.totalInvested}
          />
        </div>

        {/* Right: Top 5 Investments Across System */}
        <div className="lg:col-span-5 fintech-card p-5 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1E293B]">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Top Holdings
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ranked by total invested acquisition amount
              </p>
            </div>
          </div>

          {systemMetrics.topHoldings.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500 text-xs">
              No holdings recorded yet
            </div>
          ) : (
            <div className="space-y-2.5 flex-1 overflow-y-auto">
              {systemMetrics.topHoldings.map((holding, idx) => {
                const allocation = systemMetrics.totalInvested > 0
                  ? (holding.totalInvested / systemMetrics.totalInvested) * 100
                  : 0;

                return (
                  <div
                    key={`${holding.userId}-${holding.stockName}-${idx}`}
                    className="p-3 bg-[#0B0F19] border border-[#1E293B] rounded-xl flex items-center justify-between gap-3 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 ${
                          idx === 0
                            ? 'bg-amber-400/20 text-amber-400 border border-amber-400/40'
                            : 'bg-[#1E293B] text-slate-400'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <span className="font-mono font-bold text-white block truncate">
                          {holding.stockName}
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate">
                          {holding.userName} ({holding.quantity} shares)
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 font-mono">
                      <span className="text-xs font-bold text-white block">
                        {formatINR(holding.totalInvested)}
                      </span>
                      <span className="text-[11px] text-emerald-400 block">
                        {formatPercentage(allocation)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Users Quick-View & Recent Investments Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* User Summary Quick Table */}
        <div className="lg:col-span-6 fintech-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1E293B]">
            <div>
              <h3 className="text-base font-bold text-white">Registered Users</h3>
              <p className="text-xs text-slate-400 mt-0.5">Profiles and their total portfolio values</p>
            </div>
            <button
              onClick={() => setActiveTab('users')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              Manage Users <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {users.slice(0, 5).map((user) => {
              const userTotal = calculatePortfolioTotal(user.investments);
              return (
                <div
                  key={user.userID}
                  onClick={() => {
                    setSelectedUserId(user.userID);
                    setActiveTab('portfolio');
                  }}
                  className="p-3 bg-[#0B0F19] border border-[#1E293B] rounded-xl flex items-center justify-between cursor-pointer hover:border-emerald-500/40 transition-colors"
                >
                  <div>
                    <span className="text-sm font-bold text-white block">
                      {user.name}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      ID: {user.userID} • {user.investments?.length || 0} stocks
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-400 block">
                      {formatINR(userTotal)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      View Portfolio →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Investments Log */}
        <div className="lg:col-span-6 fintech-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1E293B]">
            <div>
              <h3 className="text-base font-bold text-white">Recent Investment Activity</h3>
              <p className="text-xs text-slate-400 mt-0.5">Recently added and updated holdings</p>
            </div>
          </div>

          {recentActivity.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No recent investments
            </div>
          ) : (
            <div className="space-y-2">
              {recentActivity.map((activity, i) => (
                <div
                  key={`${activity.id}-${i}`}
                  className="p-3 bg-[#0B0F19] border border-[#1E293B] rounded-xl flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white text-xs">
                        {activity.stockName}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                        +{activity.quantity} shares
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      For {activity.userName} @ {formatINR(activity.price)}/sh
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-200">
                    {formatINR(activity.totalInvested)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
