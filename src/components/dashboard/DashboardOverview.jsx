import React, { useMemo } from 'react';
import {
  Wallet,
  Users,
  Layers,
  Award,
  Plus,
  Search,
  ArrowRight,
  PieChart as PieChartIcon,
  ShieldCheck,
  TrendingUp,
  FolderPlus,
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { VaultGraphic } from '../common/VaultGraphic';
import { TelemetryStack } from '../common/TelemetryStack';
import { AllocationChart } from './AllocationChart';
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

  // Aggregate holdings grouped by stock symbol across all genuine users
  const consolidatedStocks = useMemo(() => {
    const stockMap = new Map();
    users.forEach((u) => {
      (u.investments || []).forEach((inv) => {
        const sym = inv.stockName;
        if (!stockMap.has(sym)) {
          stockMap.set(sym, {
            stockName: sym,
            quantity: 0,
            totalInvested: 0,
            price: 0,
          });
        }
        const existing = stockMap.get(sym);
        existing.quantity += inv.quantity;
        existing.totalInvested += inv.totalInvested;
        existing.price = existing.totalInvested / existing.quantity;
      });
    });
    return Array.from(stockMap.values());
  }, [users]);

  return (
    <div className="relative space-y-16 pb-20">
      {/* ======================================================== */}
      {/* HERO SECTION — EXACT RECREATION OF REFERENCE IMAGE */}
      {/* ======================================================== */}
      <section className="relative min-h-[75vh] flex flex-col justify-between pt-6 sm:pt-10">
        {/* Volumetric Spotlight Beam from top center */}
        <div className="spotlight-beam" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Column: Hero Typography & Actions */}
          <div className="lg:col-span-6 space-y-6">
            {/* Pill Badge matching "NEW: INNER CIRCLE" */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono tracking-[0.25em] uppercase text-purple-300 bg-purple-950/40 border border-purple-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              <span>ALGORITHM: C++ SELECTION SORT</span>
            </div>

            {/* Large Headline matching reference */}
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold tracking-tight text-white leading-[1.08]">
              Precision tracking<br />
              <span className="text-gradient-purple drop-shadow-[0_0_30px_rgba(168,85,247,0.35)]">
                for your closest assets
              </span><br />
              No feed. No noise.
            </h1>

            {/* Subtitle matching reference */}
            <p className="text-sm sm:text-base text-slate-400 max-w-lg leading-relaxed">
              A private ledger for the investments that matter.
              Built for precision, preserving genuine historical acquisition cost and Selection Sort ranking.
            </p>

            {/* Primary Action Button matching "OPEN THE SHELF" */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => {
                  if (users.length > 0) {
                    setActiveTab('portfolio');
                  } else {
                    setAddUserModalOpen(true);
                  }
                }}
                className="pill-btn-neon"
              >
                {users.length > 0 ? 'OPEN THE PORTFOLIO' : 'REGISTER FIRST USER'}
              </button>

              <button
                onClick={() => setSearchUserModalOpen(true)}
                className="pill-btn-secondary"
              >
                <Search className="w-3.5 h-3.5 text-purple-400" />
                <span>Search by User ID</span>
              </button>
            </div>

            {/* Status indicator note */}
            <div className="flex items-center gap-3 pt-2 text-xs text-slate-500 font-mono">
              <ShieldCheck className="w-4 h-4 text-purple-400/80" />
              <span>
                {users.length === 0
                  ? 'System empty • 0 registered users • Clean local storage'
                  : `${users.length} registered user(s) • ${systemMetrics.totalHoldingsCount} holding(s)`}
              </span>
            </div>
          </div>

          {/* Center Column: Chrome Vault Padlock under Spotlight */}
          <div className="lg:col-span-4 flex items-center justify-center my-6 lg:my-0">
            <VaultGraphic />
          </div>

          {/* Right Column: Stacked Telemetry Boxes (06 RELEASES, 04 YEARS, 01 STUDIO style) */}
          <div className="lg:col-span-2 hidden lg:flex justify-end">
            <TelemetryStack />
          </div>
        </div>

        {/* Bottom Bar Indicators matching photo footer */}
        <div className="pt-12 flex items-center justify-between border-t border-white/[0.05] text-[11px] font-mono text-slate-500 tracking-wider">
          {/* Next Release Pill matching "( ) NEXT RELEASE" */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.02] border border-white/10">
            <span className="w-2 h-2 rounded-full border border-purple-400" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-300">
              C++ PORTFOLIO CORE
            </span>
          </div>

          {/* Right indicator matching "SCROLL TO EXPLORE" */}
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-[10px] uppercase tracking-[0.2em]">
              PORTFOLIO TELEMETRY
            </span>
            <div className="w-4 h-[1px] bg-purple-400" />
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* DATA OVERVIEW — CLEAN FINANCIAL TELEMETRY */}
      {/* ======================================================== */}
      <section className="space-y-6 pt-4">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5 glass-card-hover">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase tracking-widest mb-2">
              <span>Total Invested</span>
              <Wallet className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-extrabold text-white font-mono">
              {formatINR(systemMetrics.totalInvested)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {users.length === 0 ? 'No investments added yet' : 'Total acquisition cost'}
            </p>
          </div>

          <div className="glass-card p-5 glass-card-hover">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase tracking-widest mb-2">
              <span>Registered Users</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-extrabold text-white font-mono">
              {formatNumber(systemMetrics.totalUsers)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Max capacity: 100 users
            </p>
          </div>

          <div className="glass-card p-5 glass-card-hover">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase tracking-widest mb-2">
              <span>Unique Stocks</span>
              <Layers className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-extrabold text-white font-mono">
              {formatNumber(systemMetrics.uniqueStocksCount)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {systemMetrics.totalHoldingsCount} total holding positions
            </p>
          </div>

          <div className="glass-card p-5 glass-card-hover">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase tracking-widest mb-2">
              <span>Largest Holding</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold text-white font-mono truncate">
              {systemMetrics.largestHolding
                ? formatINR(systemMetrics.largestHolding.totalInvested)
                : '₹0.00'}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 truncate">
              {systemMetrics.largestHolding
                ? `${systemMetrics.largestHolding.stockName} (${systemMetrics.largestHolding.userName})`
                : 'No holdings registered yet'}
            </p>
          </div>
        </div>

        {/* Empty state or genuine portfolio tables */}
        {users.length === 0 ? (
          <div className="glass-card p-10 sm:p-14 text-center border-dashed border-white/10">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto mb-4 text-purple-400">
              <FolderPlus className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              No users registered yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
              The portfolio ledger starts completely clean. Create your first investor profile to add stock holdings and track portfolio calculations.
            </p>
            <button
              onClick={() => setAddUserModalOpen(true)}
              className="pill-btn-neon"
            >
              + Create User Profile
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Allocation Chart */}
            <div className="lg:col-span-7 glass-card p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Portfolio Asset Allocation
                  </h3>
                </div>
                <span className="text-xs font-mono text-purple-400 font-bold">
                  {formatINR(systemMetrics.totalInvested)}
                </span>
              </div>
              <AllocationChart
                holdings={consolidatedStocks}
                totalPortfolio={systemMetrics.totalInvested}
              />
            </div>

            {/* Top Holdings across genuine users */}
            <div className="lg:col-span-5 glass-card p-5 sm:p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/[0.06]">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Top Stock Holdings
                  </h3>
                </div>

                {systemMetrics.topHoldings.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500">
                    No investments added yet
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {systemMetrics.topHoldings.map((h, i) => (
                      <div
                        key={`${h.userId}-${h.stockName}-${i}`}
                        className="p-3 bg-black/40 border border-white/[0.06] rounded-xl flex items-center justify-between"
                      >
                        <div>
                          <span className="font-mono font-bold text-white text-xs block">
                            {h.stockName}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {h.userName} • {h.quantity} shares
                          </span>
                        </div>
                        <div className="text-right font-mono">
                          <span className="text-xs font-bold text-white block">
                            {formatINR(h.totalInvested)}
                          </span>
                          <span className="text-[10px] text-purple-400">
                            {formatPercentage(
                              systemMetrics.totalInvested > 0
                                ? (h.totalInvested / systemMetrics.totalInvested) * 100
                                : 0
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/[0.06] mt-4">
                <button
                  onClick={() => setActiveTab('users')}
                  className="w-full text-center text-xs text-purple-400 hover:text-purple-300 font-mono tracking-wider flex items-center justify-center gap-1.5"
                >
                  <span>Manage All Users & Holdings</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
