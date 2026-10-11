import React from 'react';

export function StatCard({ title, value, subtitle, icon: Icon, accentColor = 'emerald', badgeText, badgeColor = 'emerald' }) {
  const getAccentStyles = () => {
    switch (accentColor) {
      case 'emerald':
        return {
          iconBg: 'bg-emerald-950/50 border-emerald-800/40 text-emerald-400',
          borderHover: 'hover:border-emerald-500/40',
        };
      case 'cyan':
        return {
          iconBg: 'bg-cyan-950/50 border-cyan-800/40 text-cyan-400',
          borderHover: 'hover:border-cyan-500/40',
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-950/50 border-amber-800/40 text-amber-400',
          borderHover: 'hover:border-amber-500/40',
        };
      case 'purple':
        return {
          iconBg: 'bg-purple-950/50 border-purple-800/40 text-purple-400',
          borderHover: 'hover:border-purple-500/40',
        };
      default:
        return {
          iconBg: 'bg-slate-800 border-slate-700 text-slate-300',
          borderHover: 'hover:border-slate-600',
        };
    }
  };

  const accents = getAccentStyles();

  return (
    <div
      className={`relative p-5 bg-[#111827] border border-[#1E293B] rounded-xl transition-all duration-200 ${accents.borderHover} shadow-md`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-lg border ${accents.iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="text-2xl font-extrabold text-white tracking-tight">
          {value}
        </div>
        {badgeText && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/60 border border-emerald-800/50 text-emerald-400">
            {badgeText}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-xs text-slate-400 truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
}
