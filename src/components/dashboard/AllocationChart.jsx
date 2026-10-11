import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { formatINR, formatPercentage } from '../../utils/currency';

const CHART_COLORS = [
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#3B82F6', // Blue
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#84CC16', // Lime
];

export function AllocationChart({ holdings, totalPortfolio }) {
  if (!holdings || holdings.length === 0 || !totalPortfolio || totalPortfolio <= 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs">
        <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-700 mb-2 flex items-center justify-center text-slate-600">
          %
        </div>
        No allocation data available
      </div>
    );
  }

  const chartData = holdings.map((h) => {
    const total = Number(h.totalInvested) || 0;
    const percentage = totalPortfolio > 0 ? (total / totalPortfolio) * 100 : 0;
    return {
      name: h.stockName,
      value: total,
      percentage: Number(percentage.toFixed(2)),
      quantity: h.quantity,
      price: h.price,
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#111827] border border-[#273549] rounded-xl p-3 shadow-xl text-xs">
          <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-[#1E293B]">
            <span className="font-bold text-white font-mono">{data.name}</span>
            <span className="font-semibold text-emerald-400">
              {formatPercentage(data.percentage)}
            </span>
          </div>
          <div className="space-y-1 font-mono text-[11px] text-slate-300">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Invested:</span>
              <span className="font-semibold text-white">{formatINR(data.value)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Holding:</span>
              <span>{data.quantity} shares @ {formatINR(data.price)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      {/* Donut Chart */}
      <div className="w-full md:w-1/2 h-64 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${entry.name}-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                  stroke="#111827"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
            Total
          </span>
          <span className="text-xs font-bold text-slate-200 font-mono">
            {chartData.length} Stocks
          </span>
        </div>
      </div>

      {/* Legend & Breakdown List */}
      <div className="w-full md:w-1/2 space-y-2 max-h-60 overflow-y-auto pr-2">
        {chartData.map((item, index) => (
          <div
            key={item.name}
            className="flex items-center justify-between p-2 rounded-lg bg-[#0B0F19]/60 border border-[#1E293B] text-xs hover:border-slate-600 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
              />
              <span className="font-mono font-bold text-white truncate">
                {item.name}
              </span>
            </div>

            <div className="flex items-center gap-3 font-mono text-right flex-shrink-0">
              <span className="text-slate-300 text-[11px]">
                {formatINR(item.value)}
              </span>
              <span className="font-semibold text-emerald-400 text-xs w-14">
                {formatPercentage(item.percentage)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
