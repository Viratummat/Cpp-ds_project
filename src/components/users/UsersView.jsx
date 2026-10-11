import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  PieChart,
  PlusCircle,
  Edit2,
  Trash2,
  ArrowUpDown,
  FolderPlus,
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { calculatePortfolioTotal } from '../../utils/calculations';
import { formatINR } from '../../utils/currency';

export function UsersView() {
  const {
    users,
    setAddUserModalOpen,
    setEditUserModal,
    setAddHoldingModal,
    deleteUser,
    setSelectedUserId,
    setActiveTab,
  } = usePortfolio();

  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.trim().toLowerCase();
    return users.filter(
      (u) =>
        u.userID.toLowerCase().includes(query) ||
        u.name.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const handleViewPortfolio = (userId) => {
    setSelectedUserId(userId);
    setActiveTab('portfolio');
  };

  const handleViewRanking = (userId) => {
    setSelectedUserId(userId);
    setActiveTab('ranking');
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-purple-400 block mb-1">
            REGISTRATION DIRECTORY
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Investor Profiles
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {users.length === 0
              ? 'No users registered yet • Ready for registration'
              : `${users.length} registered user profile(s) stored locally`}
          </p>
        </div>

        <button
          onClick={() => setAddUserModalOpen(true)}
          className="pill-btn-neon self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New User</span>
        </button>
      </div>

      {/* Search Input */}
      {users.length > 0 && (
        <div className="glass-card p-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by User ID or User Name..."
              className="cosmic-input pl-10 !py-2 text-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Users Content */}
      {users.length === 0 ? (
        <div className="glass-card p-12 text-center border-dashed border-white/10">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto mb-4 text-purple-400">
            <FolderPlus className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            No users registered yet
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
            The registration ledger is completely empty. Register your first user profile to start managing portfolios and tracking stock holdings.
          </p>
          <button
            onClick={() => setAddUserModalOpen(true)}
            className="pill-btn-neon"
          >
            + Register User
          </button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <p className="text-sm text-slate-300 font-semibold mb-1">
            No matching users found for "{searchQuery}"
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="pill-btn-secondary !text-xs mt-3"
          >
            Reset Search
          </button>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-black/40 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">
                  <th className="py-3.5 px-4 sm:px-6">User ID</th>
                  <th className="py-3.5 px-4 sm:px-6">User Name</th>
                  <th className="py-3.5 px-4 sm:px-6 text-center">Different Stocks</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Total Invested</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredUsers.map((user) => {
                  const total = calculatePortfolioTotal(user.investments);
                  const stockCount = user.investments?.length || 0;

                  return (
                    <tr
                      key={user.userID}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      {/* User ID */}
                      <td className="py-4 px-4 sm:px-6 font-mono font-bold text-purple-300">
                        {user.userID}
                      </td>

                      {/* User Name */}
                      <td className="py-4 px-4 sm:px-6 font-medium text-white">
                        {user.name}
                      </td>

                      {/* Stock Count */}
                      <td className="py-4 px-4 sm:px-6 text-center font-mono">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/[0.04] border border-white/10 text-cyan-300">
                          {stockCount}
                        </span>
                      </td>

                      {/* Total Invested */}
                      <td className="py-4 px-4 sm:px-6 text-right font-mono font-bold text-white text-sm">
                        {formatINR(total)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleViewPortfolio(user.userID)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-purple-300 hover:bg-white/[0.06] transition-colors"
                            title="View Portfolio"
                          >
                            <PieChart className="w-4 h-4 text-purple-400" />
                          </button>

                          <button
                            onClick={() => handleViewRanking(user.userID)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                            title="View Selection Sort Ranking"
                          >
                            <ArrowUpDown className="w-4 h-4 text-amber-400" />
                          </button>

                          <button
                            onClick={() => setAddHoldingModal({ isOpen: true, userId: user.userID })}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-white/[0.06] transition-colors"
                            title="Add Stock"
                          >
                            <PlusCircle className="w-4 h-4 text-cyan-400" />
                          </button>

                          <button
                            onClick={() => setEditUserModal({ isOpen: true, user })}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                            title="Edit User Name"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => deleteUser(user.userID)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                            title="Delete User"
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
        </div>
      )}
    </div>
  );
}
