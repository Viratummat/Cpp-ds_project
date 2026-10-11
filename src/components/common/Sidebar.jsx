import React from 'react';
import {
  LayoutDashboard,
  Users,
  PieChart,
  ArrowUpDown,
  Settings,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';

export function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
  const { activeTab, setActiveTab, users, systemMetrics } = usePortfolio();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    {
      id: 'users',
      label: 'Users',
      icon: Users,
      badge: users.length > 0 ? users.length : null,
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      icon: PieChart,
      badge: systemMetrics.totalHoldingsCount > 0 ? systemMetrics.totalHoldingsCount : null,
    },
    { id: 'ranking', label: 'Investment Ranking', icon: ArrowUpDown },
    { id: 'settings', label: 'Data Management', icon: Settings },
  ];

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen bg-[#0E1524] border-r border-[#1E293B] flex flex-col transition-all duration-300 ${
          isCollapsed ? 'md:w-20' : 'md:w-64'
        } ${
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* App Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#1E293B]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-950/50">
              <TrendingUp className="w-6 h-6 text-slate-950 font-black" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="min-w-0">
                <span className="text-sm font-extrabold tracking-tight text-white block truncate">
                  PortfoliQ
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-400 block truncate">
                  C++ Tracker v1.0
                </span>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-[#162033]'
                } ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''}`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />

                {(!isCollapsed || isMobileOpen) && (
                  <span className="flex-1 text-left truncate">{item.label}</span>
                )}

                {(!isCollapsed || isMobileOpen) && item.badge !== null && item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      isActive
                        ? 'bg-emerald-400/20 text-emerald-300'
                        : 'bg-[#1E293B] text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Financial Disclaimer & System Mode */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="p-4 m-3 bg-[#111827] border border-[#1E293B] rounded-xl text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Purchase Cost Mode</span>
            </div>
            <p className="text-[10.5px] leading-relaxed text-slate-400">
              Tracks acquisition cost & Selection Sort ranking. Values in INR (₹).
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
