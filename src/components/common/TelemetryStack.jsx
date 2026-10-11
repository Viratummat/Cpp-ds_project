import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';

export function TelemetryStack({ className = '' }) {
  const { systemMetrics } = usePortfolio();

  const userCountStr = String(systemMetrics.totalUsers || 0).padStart(2, '0');
  const holdingsCountStr = String(systemMetrics.totalHoldingsCount || 0).padStart(2, '0');
  const stocksCountStr = String(systemMetrics.uniqueStocksCount || 0).padStart(2, '0');

  const counters = [
    { value: userCountStr, label: 'USERS' },
    { value: holdingsCountStr, label: 'HOLDINGS' },
    { value: stocksCountStr, label: 'STOCKS' },
  ];

  return (
    <div className={`flex flex-col gap-3.5 ${className}`}>
      {counters.map((c, i) => (
        <div key={i} className="telemetry-card w-28 h-24">
          <span className="font-sans text-3xl font-extrabold text-white tracking-tight leading-none mb-1">
            {c.value}
          </span>
          <span className="text-[9.5px] font-mono tracking-[0.25em] text-slate-400 font-semibold uppercase">
            {c.label}
          </span>
        </div>
      ))}
    </div>
  );
}
