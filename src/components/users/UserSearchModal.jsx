import React, { useState } from 'react';
import { Search, UserCheck, UserX, PieChart, PlusCircle, ArrowUpDown } from 'lucide-react';
import { Modal } from '../common/Modal';
import { usePortfolio } from '../../context/PortfolioContext';
import { calculatePortfolioTotal } from '../../utils/calculations';
import { formatINR } from '../../utils/currency';

export function UserSearchModal() {
  const {
    searchUserModalOpen,
    setSearchUserModalOpen,
    users,
    setSelectedUserId,
    setActiveTab,
    setAddHoldingModal,
  } = usePortfolio();

  const [searchId, setSearchId] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResult, setSearchResult] = useState(null);

  const handleClose = () => {
    setSearchUserModalOpen(false);
    setSearchId('');
    setHasSearched(false);
    setSearchResult(null);
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    if (!searchId.trim()) return;

    const trimmed = searchId.trim().toLowerCase();
    // Replicating C++ findUser array search
    const found = users.find((u) => u.userID.toLowerCase() === trimmed);

    setHasSearched(true);
    setSearchResult(found || null);
  };

  const handleGoToPortfolio = (userId) => {
    setSelectedUserId(userId);
    setActiveTab('portfolio');
    handleClose();
  };

  const handleGoToRanking = (userId) => {
    setSelectedUserId(userId);
    setActiveTab('ranking');
    handleClose();
  };

  const handleAddInvestmentForUser = (userId) => {
    setSelectedUserId(userId);
    handleClose();
    setAddHoldingModal({ isOpen: true, userId });
  };

  return (
    <Modal
      isOpen={searchUserModalOpen}
      onClose={handleClose}
      title="Search User by User ID"
      subtitle="Replicating C++ findUser() array lookup algorithm"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSearch} className="mb-5">
        <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-widest mb-1.5">
          Enter User ID to Search
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchId}
              onChange={(e) => {
                setSearchId(e.target.value);
                setHasSearched(false);
              }}
              placeholder="Enter User ID (e.g. USR01)"
              className="cosmic-input pl-10 font-mono"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={!searchId.trim()}
            className="pill-btn-neon !py-2.5 !px-5"
          >
            Find
          </button>
        </div>
      </form>

      {/* Result Display */}
      {hasSearched && (
        <div className="animate-in fade-in zoom-in-95 duration-200">
          {searchResult ? (
            <div className="bg-[#080A12] border border-purple-500/40 rounded-xl p-5 shadow-2xl">
              <div className="flex items-center gap-2 text-xs font-bold font-mono uppercase tracking-widest text-purple-300 mb-3 pb-2 border-b border-white/[0.08]">
                <UserCheck className="w-4 h-4 text-purple-400" />
                <span>USER FOUND</span>
              </div>

              <div className="space-y-2.5 font-mono text-xs sm:text-sm">
                <div className="flex justify-between items-center py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">User ID :</span>
                  <span className="font-bold text-purple-300 bg-purple-950/50 px-2 py-0.5 rounded border border-purple-800/40">
                    {searchResult.userID}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">User Name :</span>
                  <span className="font-semibold text-slate-200">
                    {searchResult.name}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Different Stocks :</span>
                  <span className="font-semibold text-cyan-400">
                    {searchResult.investments?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Total Investment :</span>
                  <span className="font-bold text-white text-sm sm:text-base">
                    {formatINR(calculatePortfolioTotal(searchResult.investments))}
                  </span>
                </div>
              </div>

              {/* Action shortcuts */}
              <div className="mt-5 pt-4 border-t border-white/[0.08] flex flex-wrap gap-2">
                <button
                  onClick={() => handleGoToPortfolio(searchResult.userID)}
                  className="flex-1 pill-btn-neon !py-2 !text-xs"
                >
                  <PieChart className="w-3.5 h-3.5" />
                  Portfolio
                </button>
                <button
                  onClick={() => handleGoToRanking(searchResult.userID)}
                  className="flex-1 pill-btn-secondary !py-2 !text-xs"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-purple-400" />
                  Ranking
                </button>
                <button
                  onClick={() => handleAddInvestmentForUser(searchResult.userID)}
                  className="flex-1 pill-btn-secondary !py-2 !text-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
                  Add Stock
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#1A0B10] border border-rose-800/40 rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-rose-950/60 border border-rose-800/40 flex items-center justify-center mx-auto mb-3 text-rose-400">
                <UserX className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">User not found.</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                No user exists with ID <span className="font-mono text-rose-300 font-semibold">"{searchId}"</span>.
              </p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
