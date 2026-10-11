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
        className="fixed inset-0 bg-black/85 backdrop-blur-md"
        onClick={closeConfirm}
      />

      {/* Dialog Card */}
      <div className="relative w-full max-w-md bg-[#080A12]/95 border border-white/[0.12] rounded-2xl p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95">
        <div className="flex items-start gap-4 mb-4">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
              confirmDialog.isDestructive
                ? 'bg-rose-950/60 border border-rose-800/40 text-rose-400'
                : 'bg-purple-950/60 border border-purple-800/40 text-purple-400'
            }`}
          >
            {confirmDialog.isDestructive ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <Info className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-white mb-1">
              {confirmDialog.title}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {confirmDialog.message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={closeConfirm}
            className="pill-btn-secondary !text-xs !py-2"
          >
            {confirmDialog.cancelText}
          </button>
          <button
            type="button"
            onClick={confirmDialog.onConfirm}
            className={
              confirmDialog.isDestructive
                ? 'pill-btn-secondary !text-rose-300 !border-rose-700/50 hover:!bg-rose-950/50 !text-xs !py-2'
                : 'pill-btn-neon !text-xs !py-2'
            }
          >
            {confirmDialog.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
