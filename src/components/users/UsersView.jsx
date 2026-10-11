import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  UserPlus,
  PieChart,
  PlusCircle,
  Edit2,
  Trash2,
  ArrowUpDown,
  ExternalLink,
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { calculatePortfolioTotal } from '../../utils/calculations';
import { formatINR } from '../../utils/currency';
import { EmptyState } from '../common/EmptyState';

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

  // Filter users by User ID or Name
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            User Profiles
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage investor profiles and individual portfolio accounts ({users.length} registered)
          </p>
        </div>

        <button
          onClick={() => setAddUserModalOpen(true)}
          className="fintech-btn-primary self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4 text-slate-950" />
          Register New User
        </button>
      </div>

      {/* Search Bar */}
      <div className="fintech-card p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by User ID (e.g. USR101) or User Name (e.g. Virat Kumar)..."
            className="fintech-input pl-10"
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

      {/* Users Table */}
      {users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Users Registered"
          description="Create your first investor profile to start tracking stock portfolios."
          actionLabel="Register User"
          onAction={() => setAddUserModalOpen(true)}
          showSampleDataAction={true}
        />
      ) : filteredUsers.length === 0 ? (
        <div className="fintech-card p-10 text-center">
          <p className="text-sm text-slate-300 font-semibold mb-1">
            No matching users found for "{searchQuery}"
          </p>
          <p className="text-xs text-slate-500 mb-4">
            Try a different User ID or Investor Name
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="fintech-btn-secondary !text-xs"
          >
            Reset Search
          </button>
        </div>
      ) : (
        <div className="fintech-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#1E293B] bg-[#0E1524] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">User ID</th>
                  <th className="py-3.5 px-4 sm:px-6">User Name</th>
                  <th className="py-3.5 px-4 sm:px-6 text-center">Different Stocks</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Total Invested</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]">
                {filteredUsers.map((user) => {
                  const total = calculatePortfolioTotal(user.investments);
                  const stockCount = user.investments?.length || 0;

                  return (
                    <tr
                      key={user.userID}
                      className="hover:bg-[#162033]/60 transition-colors group"
                    >
                      {/* User ID */}
                      <td className="py-4 px-4 sm:px-6 font-mono font-bold text-emerald-400">
                        {user.userID}
                      </td>

                      {/* User Name */}
                      <td className="py-4 px-4 sm:px-6 font-medium text-white">
                        <div className="flex items-center gap-2">
                          <span>{user.name}</span>
                          {user.createdAt && (
                            <span className="text-[10px] text-slate-500 hidden md:inline">
                              (Joined {new Date(user.createdAt).toLocaleDateString()})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stock Count */}
                      <td className="py-4 px-4 sm:px-6 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#1E293B] text-cyan-300 border border-[#334155]">
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
                          {/* View Portfolio */}
                          <button
                            onClick={() => handleViewPortfolio(user.userID)}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-emerald-500/20 hover:border-emerald-500/40 border border-transparent transition-all"
                            title="View User Portfolio"
                          >
                            <PieChart className="w-4 h-4 text-emerald-400" />
                          </button>

                          {/* View Ranking */}
                          <button
                            onClick={() => handleViewRanking(user.userID)}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1E293B] transition-colors"
                            title="View Selection Sort Ranking"
                          >
                            <ArrowUpDown className="w-4 h-4 text-amber-400" />
                          </button>

                          {/* Add Stock */}
                          <button
                            onClick={() => setAddHoldingModal({ isOpen: true, userId: user.userID })}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1E293B] transition-colors"
                            title="Add Stock for this User"
                          >
                            <PlusCircle className="w-4 h-4 text-cyan-400" />
                          </button>

                          {/* Edit User Name */}
                          <button
                            onClick={() => setEditUserModal({ isOpen: true, user })}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] transition-colors"
                            title="Edit User Name"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete User */}
                          <button
                            onClick={() => deleteUser(user.userID)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                            title="Delete User and Portfolio"
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
