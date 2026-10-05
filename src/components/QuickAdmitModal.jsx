import React from 'react';
import { X, UserPlus, Sparkles, RotateCcw, Bed, CheckCircle2 } from 'lucide-react';
import { getSlotPosition } from '../utils/bedLayout';

export default function QuickAdmitModal({
  isOpen,
  onClose,
  emptyBeds,
  allBeds,
  onSelectBed,
  onFill18Beds,
  onResetBeds,
  isFullyOccupied,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 animate-scaleUp">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Tiếp nhận bệnh nhân mới
              </h2>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                {isFullyOccupied
                  ? 'Khoa đã đầy tải 18/18 giường bệnh'
                  : `Hiện còn ${emptyBeds.length} giường trống sẵn sàng tiếp nhận`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại"
            className="w-11 h-11 rounded-xl flex items-center justify-center text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 max-h-[65vh] overflow-y-auto space-y-4">
          {/* Quick Demo Fill / Reset Banner */}
          <div className="p-3.5 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/40 dark:via-teal-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-900 dark:text-emerald-200">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Thử nghiệm nhanh đầy đủ 18 giường</span>
              </div>
              <p className="text-[11px] text-slate-700 dark:text-slate-300">
                Tự động điền dữ liệu lâm sàng mẫu chuẩn vào toàn bộ các giường trống còn lại.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  onFill18Beds();
                  onClose();
                }}
                className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all shadow-xs flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Điền mẫu 18 giường</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onResetBeds();
                  onClose();
                }}
                title="Khôi phục 9 ca ban đầu"
                className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-300 dark:border-slate-700 active:scale-95 transition-all flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset 9 ca</span>
              </button>
            </div>
          </div>

          {/* List of Available Empty Beds */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2.5 flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-emerald-600" />
              <span>Danh sách giường trống ({emptyBeds.length} giường)</span>
            </h3>

            {emptyBeds.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  Tất cả 18 giường đều đã có bệnh nhân!
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                  Khoa đang đạt công suất 100%. Bác sĩ có thể bấm "Reset 9 ca" ở trên để đưa về trạng thái 9 giường nếu cần.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {emptyBeds.map((bed) => {
                  const roomBeds = allBeds.filter(
                    (b) => b.id <= 18 && String(b.label) === String(bed.label)
                  );
                  const slotPos = getSlotPosition(bed, roomBeds);

                  return (
                    <button
                      key={bed.id}
                      type="button"
                      onClick={() => {
                        onSelectBed(bed);
                        onClose();
                      }}
                      className="min-h-[56px] p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-left transition-all active:scale-95 group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                          G{bed.label} · {slotPos}
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      </div>
                      <div className="text-[11px] text-slate-700 dark:text-slate-300">
                        {bed.id > 18 ? 'Băng ca' : 'Giường tiêu chuẩn'}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
