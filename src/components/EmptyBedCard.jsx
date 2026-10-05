import React from 'react';
import { UserPlus, ArrowLeftRight } from 'lucide-react';

export default function EmptyBedCard({
  id,
  bed,
  onOpenDrawer,
  isSwapMode,
  isSelectedForSwap,
  onSelectForSwap,
  locationBadge,
  slotBadge,
}) {
  const handleClick = () => {
    if (isSwapMode) {
      onSelectForSwap(bed);
    } else {
      onOpenDrawer(bed);
    }
  };

  return (
    <div
      id={id || `bed-${bed.id}`}
      className={`rounded-2xl border-2 border-dashed transition-all duration-200 overflow-hidden bg-slate-50/60 dark:bg-slate-900/30 ${
        isSelectedForSwap
          ? 'border-amber-500 ring-4 ring-amber-400/50 shadow-md'
          : 'border-slate-300 dark:border-slate-800 hover:border-emerald-500/60 dark:hover:border-emerald-500/40'
      }`}
    >
      {locationBadge && (
        <div className="bg-slate-100/70 dark:bg-slate-800/40 px-3.5 py-1 border-b border-slate-200/50 dark:border-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
          <span>{locationBadge}</span>
          <span className="text-[10px] text-slate-700 dark:text-slate-300 font-semibold">
            Đang trống
          </span>
        </div>
      )}

      <div className="p-3 sm:p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center min-w-[36px] h-8 px-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs shrink-0">
            G{bed.label}{slotBadge ? `·${slotBadge}` : ''}
          </span>
          <div>
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Giường trống {slotBadge ? `(${slotBadge})` : ''}
            </div>
            <div className="text-[11px] text-slate-700 dark:text-slate-300">
              Sẵn sàng tiếp nhận BN
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClick}
          className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all select-none active:scale-95 ${
            isSwapMode
              ? isSelectedForSwap
                ? 'bg-amber-500 text-white'
                : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 hover:bg-amber-200'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
          }`}
        >
          {isSwapMode ? (
            <>
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Chuyển vào G{bed.label}{slotBadge ? ` (${slotBadge})` : ''}</span>
            </>
          ) : (
            <>
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Nhập bệnh nhân G{bed.label}{slotBadge ? ` (${slotBadge})` : ''}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
