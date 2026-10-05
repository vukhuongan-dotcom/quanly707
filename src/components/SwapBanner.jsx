import React from 'react';
import { ArrowLeftRight, X } from 'lucide-react';

export default function SwapBanner({
  sourceBed,
  onCancel,
}) {
  return (
    <div className="bg-amber-500 text-white py-2.5 px-3 sm:px-6 shadow-md transition-all animate-slideDown">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold">
          <ArrowLeftRight className="w-4 h-4 animate-bounce shrink-0" />
          <span>
            {sourceBed
              ? `Đã chọn G${sourceBed.label} (${sourceBed.name || 'Trống'}). Giờ hãy chọn giường thứ 2 để hoán đổi vị trí!`
              : 'Chế độ đổi giường: Chọn giường thứ nhất để bắt đầu hoán đổi.'}
          </span>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="min-h-[44px] px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1 shrink-0 transition-colors"
        >
          <X className="w-4 h-4" />
          <span>Hủy đổi</span>
        </button>
      </div>
    </div>
  );
}
