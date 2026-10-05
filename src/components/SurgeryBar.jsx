import React from 'react';
import { Calendar, ChevronRight, Activity, Clock } from 'lucide-react';
import { getSurgeryDates } from '../utils/bedLayout';
import { isBSHuu } from '../utils/doctors';

export default function SurgeryBar({ beds, onSelectBed }) {
  const { today, tomorrow } = getSurgeryDates();

  const todayCases = beds.filter(
    (b) => b.name && b.name.trim() && b.date && b.date.trim() === today
  );
  const tomorrowCases = beds.filter(
    (b) => b.name && b.name.trim() && b.date && b.date.trim() === tomorrow
  );

  const totalCases = todayCases.length + tomorrowCases.length;

  // P1-8: Khi 0 ca -> rút gọn thành thanh 1 dòng mỏng tinh tế
  if (totalCases === 0) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-2.5 pb-1">
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">Lịch phẫu thuật:</span>
            <span>Hôm nay (0 ca)</span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span>Ngày mai (0 ca)</span>
          </div>
          <span className="text-[11px] text-slate-700 dark:text-slate-300 italic hidden sm:inline">
            Chưa có ca mổ nào được lên lịch
          </span>
        </div>
      </div>
    );
  }

  // Khi có ca mổ -> Liệt kê tên + giường, click nhảy tới giường
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-2.5 pb-1">
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/40 dark:via-teal-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-2.5">
          <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 animate-pulse" />
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
            Lịch phẫu thuật ({totalCases} ca)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {/* Hôm nay */}
          <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl p-2.5 border border-emerald-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                Hôm nay ({todayCases.length} ca)
              </span>
              <span className="text-[11px] text-slate-700 font-normal">{today}</span>
            </div>

            {todayCases.length === 0 ? (
              <p className="text-xs text-slate-700 italic">Không có ca mổ hôm nay</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {todayCases.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => onSelectBed(b)}
                    className="min-h-[44px] px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-left flex items-center justify-between gap-2 transition-all active:scale-98"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-900 dark:text-emerald-200">
                        <span>G{b.label}</span>
                        <span>·</span>
                        <span className="truncate max-w-[140px]">{b.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
                        {b.treatment || b.diagnosis || 'Chưa nhập PP'} · {b.surgeon || 'Chưa có BS'}
                      </div>
                    </div>
                    {isBSHuu(b.surgeon) && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-600 text-white rounded">
                        BS Hữu
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Ngày mai */}
          <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl p-2.5 border border-emerald-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Ngày mai ({tomorrowCases.length} ca)
              </span>
              <span className="text-[11px] text-slate-700 font-normal">{tomorrow}</span>
            </div>

            {tomorrowCases.length === 0 ? (
              <p className="text-xs text-slate-700 italic">Không có ca mổ ngày mai</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {tomorrowCases.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => onSelectBed(b)}
                    className="min-h-[44px] px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 text-left flex items-center justify-between gap-2 transition-all active:scale-98"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-blue-900 dark:text-blue-200">
                        <span>G{b.label}</span>
                        <span>·</span>
                        <span className="truncate max-w-[140px]">{b.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
                        {b.treatment || b.diagnosis || 'Chưa nhập PP'} · {b.surgeon || 'Chưa có BS'}
                      </div>
                    </div>
                    {isBSHuu(b.surgeon) && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-600 text-white rounded">
                        BS Hữu
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
