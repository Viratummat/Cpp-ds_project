import React, { useState } from 'react';
import { usePortfolio } from './context/PortfolioContext';
import { Navbar } from './components/common/Navbar';
import { ToastContainer } from './components/common/Toast';
import { ConfirmDialog } from './components/common/ConfirmDialog';
import { UserModal } from './components/users/UserModal';
import { UserSearchModal } from './components/users/UserSearchModal';
import { InvestmentModal } from './components/portfolio/InvestmentModal';
import { EditHoldingModal } from './components/portfolio/EditHoldingModal';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { UsersView } from './components/users/UsersView';
import { PortfolioView } from './components/portfolio/PortfolioView';
import { RankingView } from './components/ranking/RankingView';
import { SettingsView } from './components/settings/SettingsView';
import { X, Search, Plus } from 'lucide-react';
import { BrandLogo } from './components/common/BrandLogo';

export function App() {
  const { activeTab, setActiveTab, isLoaded, setAddUserModalOpen } = usePortfolio();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#040508] flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono tracking-widest text-purple-300">
            INITIALIZING TANDEM CORE...
          </span>
        </div>
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />;
      case 'users':
        return <UsersView />;
      case 'portfolio':
        return <PortfolioView />;
      case 'ranking':
        return <RankingView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardOverview />;
    }
  };

  const navLinks = [
    { id: 'overview', label: 'Home' },
    { id: 'users', label: 'Users' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'ranking', label: 'Ranking' },
    { id: 'settings', label: 'Data' },
  ];

  return (
    <div className="min-h-screen bg-[#040508] text-slate-100 relative selection:bg-purple-500 selection:text-white">
      {/* Background Ambience: Spotlight & Perspective Floor Dot Grid */}
      <div className="cosmic-spotlight" />
      <div className="perspective-dot-grid" />

      {/* Top Navigation */}
      <Navbar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-[#080A12] border-r border-white/10 h-full p-6 flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-white/[0.06] mb-6">
                <BrandLogo />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-2">
                {navLinks.map((link) => {
                  const isActive = activeTab === link.id;
                  return (
                    <button
                      key={link.id}
                      onClick={() => {
                        setActiveTab(link.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-mono tracking-widest uppercase transition-colors ${
                        isActive
                          ? 'bg-purple-950/50 text-purple-300 font-bold border border-purple-800/40'
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      {link.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-6 border-t border-white/[0.06]">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setAddUserModalOpen(true);
                }}
                className="w-full pill-btn-neon !text-xs !py-2.5"
              >
                <Plus className="w-4 h-4" />
                <span>Register User</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-20">
        {renderActiveView()}
      </main>

      {/* Modals & Dialogs */}
      <UserModal />
      <UserSearchModal />
      <InvestmentModal />
      <EditHoldingModal />
      <ConfirmDialog />
      <ToastContainer />
    </div>
  );
}

export default App;
