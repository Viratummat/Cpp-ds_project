import React from 'react';
import { Search, Plus, Menu } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { BrandLogo } from './BrandLogo';

export function Navbar({ onOpenMobileMenu }) {
  const {
    activeTab,
    setActiveTab,
    setAddUserModalOpen,
    setSearchUserModalOpen,
    users,
  } = usePortfolio();

  const navLinks = [
    { id: 'overview', label: 'Home' },
    { id: 'users', label: 'Users' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'ranking', label: 'Ranking' },
    { id: 'settings', label: 'Data' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#040508]/85 backdrop-blur-xl border-b border-white/[0.06]">
      {/* Primary Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className="flex items-center hover:opacity-85 transition-opacity"
          >
            <BrandLogo />
          </button>
        </div>

        {/* Center: Desktop Navigation Links (matching Home Work Studio Journal) */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`text-xs uppercase tracking-[0.2em] font-medium transition-all duration-200 relative py-1 ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* C++ User ID Search Button */}
          <button
            onClick={() => setSearchUserModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors"
            title="Search User by ID (C++ findUser)"
          >
            <Search className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[11px] font-mono">findUser</span>
          </button>

          {/* "+ Start a project" Style Pill Button */}
          <button
            onClick={() => setAddUserModalOpen(true)}
            className="pill-btn-secondary"
          >
            <Plus className="w-3.5 h-3.5 text-purple-400" />
            <span>Register User</span>
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Sub-navigation Ribbon Breadcrumb matching the photo */}
      <div className="hidden lg:block border-t border-white/[0.04] py-2 bg-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-4 text-[10px] tracking-[0.3em] font-mono text-slate-500 uppercase">
          <span className={activeTab === 'overview' ? 'text-purple-400 font-bold' : ''}>OVERVIEW</span>
          <span>&gt;</span>
          <span className={activeTab === 'users' ? 'text-purple-400 font-bold' : ''}>USERS</span>
          <span>&gt;</span>
          <span className={activeTab === 'portfolio' ? 'text-purple-400 font-bold' : ''}>PORTFOLIO</span>
          <span>&gt;</span>
          <span className={activeTab === 'ranking' ? 'text-purple-400 font-bold' : ''}>SELECTION SORT</span>
          <span>&gt;</span>
          <span className={activeTab === 'settings' ? 'text-purple-400 font-bold' : ''}>BACKUP & DATA</span>
        </div>
      </div>
    </header>
  );
}
