import React, { useState } from 'react';
import { usePortfolio } from './context/PortfolioContext';
import { Sidebar } from './components/common/Sidebar';
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

export function App() {
  const { activeTab, isLoaded } = usePortfolio();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono tracking-wider">Loading PortfoliQ State...</span>
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

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Navbar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Modals & Overlays */}
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
