import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';

export function ConfirmDialog() {
  const { confirmDialog, closeConfirm } = usePortfolio();

  if (!confirmDialog.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={closeConfirm}
      />

      {/* Dialog box */}
      <div className="relative w-full max-w-md bg-[#111827] border border-[#273549] rounded-2xl p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95">
        <div className="flex items-start gap-4 mb-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              confirmDialog.isDestructive
                ? 'bg-rose-950/60 border border-rose-800/40 text-rose-400'
                : 'bg-emerald-950/60 border border-emerald-800/40 text-emerald-400'
            }`}
          >
            {confirmDialog.isDestructive ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <Info className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">
              {confirmDialog.title}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {confirmDialog.message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E293B]">
          <button
            type="button"
            onClick={closeConfirm}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-[#1E293B] hover:bg-[#28384E] rounded-lg transition-colors"
          >
            {confirmDialog.cancelText}
          </button>
          <button
            type="button"
            onClick={confirmDialog.onConfirm}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              confirmDialog.isDestructive
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-900 shadow-lg shadow-emerald-950/50'
            }`}
          >
            {confirmDialog.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
