import React, { useState } from 'react';
import { 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Edit3, 
  Clock, 
  FileText, 
  Pill, 
  AlertTriangle,
  User,
  UserPlus,
  Activity
} from 'lucide-react';
import { getPatientAge, getPreOpSummary, getSlotPosition } from '../utils/bedLayout';
import { isBSHuu } from '../utils/doctors';

export default function BedCard({
  id,
  bed,
  onOpenDrawer,
  isSwapMode,
  isSelectedForSwap,
  onSelectForSwap,
  highlighted,
  locationBadge,
  slotBadge,
  emptyBedInRoom,
  onAddSecondPatient,
  roomBeds = [],
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const age = getPatientAge(bed.birth);
  const preOp = getPreOpSummary(bed);
  const hasBSHuu = isBSHuu(bed.surgeon);

  const hasLongNotes = Boolean(
    (bed.history && bed.history.trim().length > 30) ||
    (bed.notes && bed.notes.trim().length > 30)
  );

  const handleCardClick = () => {
    if (isSwapMode) {
      onSelectForSwap(bed);
    } else {
      onOpenDrawer(bed);
    }
  };

  return (
    <div
      id={id || `bed-${bed.id}`}
      className={`group relative rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden bg-white dark:bg-slate-900 ${
        isSelectedForSwap
          ? 'border-amber-500 ring-4 ring-amber-400/50 shadow-lg'
          : highlighted
          ? 'bed-pulse-active border-amber-500 ring-4 ring-amber-400/40'
          : 'border-slate-200/90 dark:border-slate-800 hover:border-emerald-500/60 dark:hover:border-emerald-500/40 shadow-xs hover:shadow-md'
      }`}
    >
      {/* Top Banner / Location Tag (Mobile or Stretcher) */}
      {locationBadge && (
        <div className="bg-slate-100 dark:bg-slate-800/80 px-3.5 py-1 border-b border-slate-200/60 dark:border-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
          <span>{locationBadge}</span>
          {bed.id > 18 && (
            <span className="text-[10px] text-amber-800 bg-amber-100 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.5 rounded">
              Băng ca
            </span>
          )}
        </div>
      )}

      {/* Main Card Content */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Header Row: Bed Number, Patient Name, BS Huu Tag, Quick Edit */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center justify-center min-w-[36px] h-8 px-1.5 rounded-lg bg-emerald-700 text-white font-black text-xs shrink-0 shadow-xs">
                G{bed.label}{slotBadge ? `·${slotBadge}` : ''}
              </span>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white uppercase">
                    {bed.name}
                  </h3>
                  {bed.birth && (
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      · {bed.birth} {age ? `(${age}t)` : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {hasBSHuu && (
                <span className="px-2 py-0.5 text-xs font-bold bg-emerald-600 text-white rounded-md shadow-2xs">
                  ✓ BS Hữu
                </span>
              )}
              <button
                type="button"
                onClick={handleCardClick}
                aria-label={`Chỉnh sửa thông tin giường G${bed.label}`}
                className="w-11 h-11 rounded-xl flex items-center justify-center text-slate-700 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Core Diagnosis (1-line) */}
          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5 line-clamp-2 leading-relaxed">
            <span className="text-slate-700 dark:text-slate-300 font-normal">CĐ: </span>
            {bed.diagnosis || <span className="text-slate-700 italic">Chưa nhập chẩn đoán</span>}
          </div>

          {/* Treatment & Surgeon */}
          <div className="text-xs text-slate-700 dark:text-slate-300 mb-2.5 flex items-center gap-2 flex-wrap">
            <span>
              <strong className="text-slate-700 dark:text-slate-300">PP:</strong>{' '}
              {bed.treatment || 'Chưa nhập'}
            </span>
            <span>·</span>
            <span>
              <strong className="text-slate-700 dark:text-slate-300">BS:</strong>{' '}
              {bed.surgeon || 'Chưa phân công'}
            </span>
            {bed.date && (
              <>
                <span>·</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 dark:text-emerald-300">
                  <Clock className="w-3 h-3" />
                  {bed.date}
                </span>
              </>
            )}
          </div>

          {/* P1-5: 6 Pre-Op Chips ALWAYS visible + Summary Badge */}
          <div className="mb-2">
            <div className="flex items-center justify-between gap-1.5 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1">
                Chuẩn bị tiền phẫu
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  preOp.isComplete
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {preOp.doneCount}/6 {preOp.isComplete ? 'Hoàn tất' : 'Chưa đủ'}
              </span>
            </div>

            {/* 6 Chips Grid (Touch target friendly, clean badges) */}
            <div className="grid grid-cols-3 gap-1">
              {preOp.items.map((item) => (
                <div
                  key={item.key}
                  className={`min-h-[30px] px-1.5 py-1 rounded-md text-[11px] font-medium flex items-center justify-center gap-1 text-center transition-all ${
                    item.done
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-semibold'
                      : 'bg-slate-50 text-slate-700 dark:bg-slate-800/40 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  {item.done ? (
                    <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[2.5]" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600 shrink-0" />
                  )}
                  <span className="truncate">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* In-place Accordion for Long Notes & History (P1-4) */}
          {hasLongNotes && (
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full min-h-[44px] px-2 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-between rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                <span>{isExpanded ? 'Thu gọn chi tiết' : 'Xem thêm tiền căn & chú ý'}</span>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {isExpanded && (
                <div className="mt-2 space-y-2 text-xs bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 animate-fadeIn">
                  {bed.history && (
                    <div>
                      <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                        Tiền căn:
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                        {bed.history}
                      </p>
                    </div>
                  )}
                  {bed.notes && (
                    <div>
                      <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                        Chú ý:
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                        {bed.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card Footer: Clinical Action Button (≥44px) */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleCardClick}
            className={`w-full min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all select-none active:scale-98 ${
              isSwapMode
                ? isSelectedForSwap
                  ? 'bg-amber-500 text-white'
                  : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 hover:bg-amber-200'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200/60 dark:border-emerald-800/60'
            }`}
          >
            {isSwapMode ? (
              <span>{isSelectedForSwap ? 'Đang chọn đổi · Bấm hủy' : 'Chọn đổi giường này'}</span>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5" />
                <span>Cập nhật hồ sơ G{bed.label}{slotBadge ? ` (${slotBadge})` : ''}</span>
              </>
            )}
          </button>

          {/* Nút tiếp nhận giường 2 khi phòng còn giường trống */}
          {emptyBedInRoom && onAddSecondPatient && !isSwapMode && (
            <button
              type="button"
              onClick={() => onAddSecondPatient(emptyBedInRoom)}
              className="w-full min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-dashed border-emerald-300 dark:border-emerald-700 flex items-center justify-center gap-1.5 transition-all active:scale-98"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Tiếp nhận BN G{bed.label} ({getSlotPosition(emptyBedInRoom, roomBeds)})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
