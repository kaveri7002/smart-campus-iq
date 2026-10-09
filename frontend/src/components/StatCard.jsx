import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'cyan', trend }) => {
  const colorMap = {
    cyan: 'from-cyan-500/10 to-cyan-500/5 text-cyan-500 border-cyan-500/20',
    blue: 'from-blue-500/10 to-blue-500/5 text-blue-500 border-blue-500/20',
    purple: 'from-purple-500/10 to-purple-500/5 text-purple-500 border-purple-500/20',
    emerald: 'from-emerald-500/10 to-emerald-500/5 text-emerald-500 border-emerald-500/20',
    amber: 'from-amber-500/10 to-amber-500/5 text-amber-500 border-amber-500/20',
    rose: 'from-rose-500/10 to-rose-500/5 text-rose-500 border-rose-500/20',
  };

  const selectedColor = colorMap[color] || colorMap.cyan;

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm relative overflow-hidden transition-all duration-200 hover:shadow-md hover:border-slate-300 dark:hover:border-navy-700">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1.5 tracking-tight">{value}</h3>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              {subtitle}
            </p>
          )}
          {trend && (
            <span className={`text-[11px] font-semibold mt-2 inline-block px-2 py-0.5 rounded-md ${
              trend.positive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
            }`}>
              {trend.text}
            </span>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl bg-gradient-to-br ${selectedColor} border`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};
