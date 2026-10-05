import React from 'react';
import { Search, ArrowLeftRight, Download, UserPlus, RefreshCw, Moon, Sun, Building2 } from 'lucide-react';

export default function Header({
  searchQuery,
  onSearchChange,
  isSwapMode,
  onToggleSwapMode,
  onExportPng,
  onAddDoctor,
  onRefresh,
  isRefreshing,
  isDarkMode,
  onToggleDarkMode,
  occupiedCount,
  emptyCount,
  onOpenQuickAdmit,
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          {/* Brand & Subtitle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                707
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  QUẢN LÝ P707
                  <span className="hidden xs:inline-block px-1.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-md">
                    Live
                  </span>
                </h1>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate max-w-[200px] xs:max-w-none">
                  Khoa Phẫu thuật Đại trực tràng · {occupiedCount} BN · {emptyCount} trống
                </p>
              </div>
            </div>

            {/* Quick dark mode on mobile */}
            <div className="flex items-center gap-1 sm:hidden">
              <button
                type="button"
                onClick={onToggleDarkMode}
                aria-label={isDarkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
                className="w-11 h-11 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Search bar & Desktop Actions */}
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2">
            {/* Search Input (P1-7) */}
            <div className="relative flex-1 xs:w-56 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 dark:text-slate-300 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Tìm BN hoặc số giường..."
                className="w-full h-11 pl-9 pr-3 text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-700 dark:placeholder-slate-300 rounded-xl border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-xs text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Action Buttons (All ≥44px height) */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              <button
                type="button"
                onClick={onOpenQuickAdmit}
                className="h-11 px-3.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-all shrink-0 select-none shadow-xs active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Nhập BN</span>
                {emptyCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-800 text-[10px] font-extrabold text-white">
                    {emptyCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={onToggleSwapMode}
                className={`h-11 px-3 rounded-xl font-medium text-xs flex items-center gap-1.5 transition-all shrink-0 select-none ${
                  isSwapMode
                    ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span>{isSwapMode ? 'Hủy đổi' : 'Đổi giường'}</span>
              </button>

              <button
                type="button"
                onClick={onExportPng}
                className="h-11 px-3 rounded-xl font-medium text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-all shrink-0 select-none"
              >
                <Download className="w-4 h-4" />
                <span>Xuất ảnh</span>
              </button>

              <button
                type="button"
                onClick={onAddDoctor}
                className="h-11 px-3 rounded-xl font-medium text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-all shrink-0 select-none"
              >
                <UserPlus className="w-4 h-4" />
                <span>Thêm BS</span>
              </button>

              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                aria-label="Tải lại dữ liệu"
                className="h-11 w-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-all shrink-0 select-none"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
              </button>

              <button
                type="button"
                onClick={onToggleDarkMode}
                aria-label={isDarkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
                className="hidden sm:flex h-11 w-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 items-center justify-center transition-all shrink-0 select-none"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
