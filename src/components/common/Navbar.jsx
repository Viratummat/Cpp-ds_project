import React from 'react';
import {
  Menu,
  Search,
  UserPlus,
  PlusCircle,
  Database,
  CheckCircle,
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';

export function Navbar({ onOpenMobileMenu }) {
  const {
    setAddUserModalOpen,
    setAddHoldingModal,
    setSearchUserModalOpen,
    selectedUserId,
    users,
    storageInfo,
  } = usePortfolio();

  return (
    <header className="h-16 bg-[#0E1524]/90 backdrop-blur-md border-b border-[#1E293B] sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & breadcrumb/title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] md:hidden transition-colors"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* C++ Search Button */}
        <button
          onClick={() => setSearchUserModalOpen(true)}
          className="flex items-center gap-2.5 px-3 py-1.5 bg-[#111827] hover:bg-[#162033] border border-[#273549] hover:border-slate-600 rounded-lg text-xs text-slate-400 hover:text-slate-200 transition-colors shadow-sm"
        >
          <Search className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Search User by ID (C++ Find)...</span>
          <span className="sm:hidden">Search...</span>
          <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] bg-[#1E293B] border border-[#334155] rounded text-slate-400">
            findUser
          </kbd>
        </button>
      </div>

      {/* Right: Storage Status & Quick Actions */}
      <div className="flex items-center gap-2.5">
        {/* Storage status pill */}
        <div
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-[#111827] border border-[#1E293B] rounded-lg text-xs text-slate-400"
          title={`LocalStorage: ${storageInfo.formattedSize} used`}
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Storage: {storageInfo.formattedSize}</span>
        </div>

        {/* Quick Add User */}
        <button
          onClick={() => setAddUserModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-[#1E293B] hover:bg-[#28384E] border border-[#334155] rounded-lg transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Add User</span>
        </button>

        {/* Quick Add Investment */}
        <button
          onClick={() => setAddHoldingModal({ isOpen: true, userId: selectedUserId || (users[0]?.userID || null) })}
          disabled={users.length === 0}
          className="fintech-btn-primary !px-3 !py-1.5 !text-xs"
          title={users.length === 0 ? 'Create a user first' : 'Add stock holding'}
        >
          <PlusCircle className="w-3.5 h-3.5 text-slate-950" />
          <span>Add Stock</span>
        </button>
      </div>
    </header>
  );
}
