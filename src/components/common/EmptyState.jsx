import React from 'react';
import { FolderPlus, TrendingUp, Users, Database } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';

export function EmptyState({
  icon: Icon = Users,
  title = 'No Data Found',
  description = 'Get started by creating your first entry.',
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  showSampleDataAction = false,
}) {
  const { loadSampleDataset } = usePortfolio();

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-[#111827] border border-dashed border-[#273549] rounded-2xl">
      <div className="w-16 h-16 rounded-2xl bg-[#1E293B] border border-[#334155] flex items-center justify-center text-slate-400 mb-4 shadow-inner">
        <Icon className="w-8 h-8 text-emerald-400" />
      </div>

      <h3 className="text-lg font-bold text-white mb-1.5">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="fintech-btn-primary"
          >
            <FolderPlus className="w-4 h-4" />
            {actionLabel}
          </button>
        )}

        {secondaryActionLabel && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="fintech-btn-secondary"
          >
            {secondaryActionLabel}
          </button>
        )}

        {showSampleDataAction && (
          <button
            onClick={loadSampleDataset}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-800/50 rounded-lg transition-colors"
          >
            <Database className="w-4 h-4" />
            Load Sample Dataset
          </button>
        )}
      </div>
    </div>
  );
}
