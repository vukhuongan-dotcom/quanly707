import React from 'react';
import { Users, UserX, AlertCircle, Clock, Calendar, LayoutGrid } from 'lucide-react';

export default function FilterTabs({
  activeFilter,
  onFilterChange,
  counts,
}) {
  const tabs = [
    { id: 'all', label: 'Tất cả', icon: LayoutGrid, count: counts.all },
    { id: 'occupied', label: 'Có BN', icon: Users, count: counts.occupied },
    { id: 'empty', label: 'Trống', icon: UserX, count: counts.empty },
    { id: 'incomplete', label: 'Thiếu c/bị', icon: AlertCircle, count: counts.incomplete, alert: counts.incomplete > 0 },
    { id: 'surgeryToday', label: 'Mổ hôm nay', icon: Clock, count: counts.surgeryToday },
    { id: 'surgeryTomorrow', label: 'Mổ ngày mai', icon: Calendar, count: counts.surgeryTomorrow },
  ];

  return (
    <div className="sticky top-[57px] sm:top-[61px] z-20 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 py-2">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onFilterChange(tab.id)}
                className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all active:scale-95 select-none ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-600'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${tab.alert && !isActive ? 'text-amber-500' : ''}`} />
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : tab.alert
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
