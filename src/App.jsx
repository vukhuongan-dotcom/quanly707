import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import SurgeryBar from './components/SurgeryBar';
import FilterTabs from './components/FilterTabs';
import BedCard from './components/BedCard';
import EmptyBedCard from './components/EmptyBedCard';
import BedDrawer from './components/BedDrawer';
import SwapBanner from './components/SwapBanner';
import QuickAdmitModal from './components/QuickAdmitModal';
import initialBedsData from './data/initialBeds.json';
import { 
  groupRoomsForGrid, 
  getMobileReflowList, 
  getSurgeryDates, 
  getPreOpSummary,
  createEmptyBed,
  getSlotPosition,
  SAMPLE_FILL_18_BEDS
} from './utils/bedLayout';
import { exportBedsToPng } from './utils/canvasExport';
import { PlusCircle, Sparkles, UserPlus } from 'lucide-react';

export default function App() {
  // 1. Beds State with LocalStorage cache for interactive persistence
  const [beds, setBeds] = useState(() => {
    try {
      const cached = localStorage.getItem('quanly707_beds_v2');
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    return initialBedsData;
  });

  useEffect(() => {
    try {
      localStorage.setItem('quanly707_beds_v2', JSON.stringify(beds));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [beds]);

  // 2. Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [highlightedBedId, setHighlightedBedId] = useState(null);

  // 3. Swap Mode State
  const [isSwapMode, setIsSwapMode] = useState(false);
  const [swapSourceBed, setSwapSourceBed] = useState(null);

  // 4. Drawer & Quick Admit Modal State
  const [editingBed, setEditingBed] = useState(null);
  const [isQuickAdmitOpen, setIsQuickAdmitOpen] = useState(false);

  // 5. Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)
      );
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // 6. Surgery Dates
  const { today, tomorrow } = useMemo(() => getSurgeryDates(), []);

  // 7. Counts calculation for filter tabs
  const counts = useMemo(() => {
    const occupied = beds.filter((b) => b.name && b.name.trim()).length;
    const empty = beds.filter((b) => !b.name || !b.name.trim()).length;
    const incomplete = beds.filter((b) => {
      if (!b.name || !b.name.trim()) return false;
      const pre = getPreOpSummary(b);
      return pre.doneCount < 6;
    }).length;
    const surgeryToday = beds.filter(
      (b) => b.name && b.name.trim() && b.date && b.date.trim() === today
    ).length;
    const surgeryTomorrow = beds.filter(
      (b) => b.name && b.name.trim() && b.date && b.date.trim() === tomorrow
    ).length;

    return {
      all: beds.length,
      occupied,
      empty,
      incomplete,
      surgeryToday,
      surgeryTomorrow,
    };
  }, [beds, today, tomorrow]);

  // 8. Search handler with auto-scroll & pulse animation (P1-7)
  const handleSearchChange = (query) => {
    setSearchQuery(query);
    if (!query || !query.trim()) return;

    const q = query.trim().toLowerCase();
    // Search by patient name or bed label
    const found = beds.find((b) => {
      const matchName = b.name && b.name.toLowerCase().includes(q);
      const matchLabel = `g${b.label}`.toLowerCase() === q || b.label === q;
      return matchName || matchLabel;
    });

    if (found) {
      setHighlightedBedId(found.id);
      const elDesk = document.getElementById(`bed-${found.id}`);
      const elMob = document.getElementById(`bed-mob-${found.id}`);
      const el = elDesk && elDesk.offsetParent !== null ? elDesk : elMob;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setTimeout(() => setHighlightedBedId(null), 3600);
    }
  };

  // Jump from SurgeryBar or Search
  const handleJumpToBed = (bed) => {
    setHighlightedBedId(bed.id);
    const elDesk = document.getElementById(`bed-${bed.id}`);
    const elMob = document.getElementById(`bed-mob-${bed.id}`);
    const el = elDesk && elDesk.offsetParent !== null ? elDesk : elMob;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setTimeout(() => setHighlightedBedId(null), 3600);
  };

  // 9. Bed Swap Handler
  const handleSelectForSwap = (bed) => {
    if (!swapSourceBed) {
      setSwapSourceBed(bed);
    } else {
      if (swapSourceBed.id === bed.id) {
        setSwapSourceBed(null);
        return;
      }

      // Execute Swap: preserve bed id, slot, label; swap patient clinical data
      setBeds((prev) =>
        prev.map((b) => {
          if (b.id === swapSourceBed.id) {
            return {
              ...b,
              name: bed.name,
              birth: bed.birth,
              history: bed.history,
              historyEn: bed.historyEn,
              diagnosis: bed.diagnosis,
              diagnosisEn: bed.diagnosisEn,
              treatment: bed.treatment,
              treatmentEn: bed.treatmentEn,
              surgeon: bed.surgeon,
              date: bed.date,
              notes: bed.notes,
              notesEn: bed.notesEn,
              antibiotic: bed.antibiotic,
              enema: bed.enema,
              fortrans: bed.fortrans,
              fiveSignatures: bed.fiveSignatures,
              consentForm: bed.consentForm,
              anesthesiaSurvey: bed.anesthesiaSurvey,
              version: (b.version || 0) + 1,
            };
          }
          if (b.id === bed.id) {
            return {
              ...b,
              name: swapSourceBed.name,
              birth: swapSourceBed.birth,
              history: swapSourceBed.history,
              historyEn: swapSourceBed.historyEn,
              diagnosis: swapSourceBed.diagnosis,
              diagnosisEn: swapSourceBed.diagnosisEn,
              treatment: swapSourceBed.treatment,
              treatmentEn: swapSourceBed.treatmentEn,
              surgeon: swapSourceBed.surgeon,
              date: swapSourceBed.date,
              notes: swapSourceBed.notes,
              notesEn: swapSourceBed.notesEn,
              antibiotic: swapSourceBed.antibiotic,
              enema: swapSourceBed.enema,
              fortrans: swapSourceBed.fortrans,
              fiveSignatures: swapSourceBed.fiveSignatures,
              consentForm: swapSourceBed.consentForm,
              anesthesiaSurvey: swapSourceBed.anesthesiaSurvey,
              version: (b.version || 0) + 1,
            };
          }
          return b;
        })
      );

      setSwapSourceBed(null);
      setIsSwapMode(false);
    }
  };

  // 10. Drawer Save & Clear
  const handleSaveBed = (updatedBed) => {
    setBeds((prev) => prev.map((b) => (b.id === updatedBed.id ? updatedBed : b)));
    setEditingBed(null);
  };

  const handleClearBed = (bedToClear) => {
    setBeds((prev) =>
      prev.map((b) =>
        b.id === bedToClear.id
          ? {
              ...createEmptyBed(b.id, b.label, b.slot),
              version: (b.version || 0) + 1,
            }
          : b
      )
    );
    setEditingBed(null);
  };

  // 11. Add Stretcher
  const handleAddStretcher = () => {
    const nextId = Math.max(...beds.map((b) => b.id), 18) + 1;
    const newStretcher = createEmptyBed(nextId, `BC${nextId - 18}`, nextId);
    setBeds((prev) => [...prev, newStretcher]);
    setEditingBed(newStretcher);
  };

  const handleDeleteStretcher = (stretcher) => {
    setBeds((prev) => prev.filter((b) => b.id !== stretcher.id));
    setEditingBed(null);
  };

  // 12. Quick Demo Fill 18 Beds / Reset to 9 Beds
  const handleFill18Beds = () => {
    setBeds((prev) =>
      prev.map((b) => {
        if (b.name && b.name.trim()) return b;
        if (SAMPLE_FILL_18_BEDS[b.id]) {
          return {
            ...b,
            ...SAMPLE_FILL_18_BEDS[b.id],
            version: (b.version || 0) + 1,
          };
        }
        return b;
      })
    );
  };

  const handleResetBeds = () => {
    setBeds(initialBedsData);
    localStorage.removeItem('quanly707_beds_v2');
  };

  // 13. Add Doctor
  const handleAddDoctor = () => {
    const docName = window.prompt('Nhập tên bác sĩ cần bổ sung vào danh sách:');
    if (docName && docName.trim()) {
      alert(`Đã ghi nhận bác sĩ: ${docName.trim()}`);
    }
  };

  // 14. Refresh
  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // 15. Filter predicate
  const matchesFilter = (bed) => {
    const hasName = Boolean(bed.name && bed.name.trim());
    if (activeFilter === 'occupied') return hasName;
    if (activeFilter === 'empty') return !hasName;
    if (activeFilter === 'incomplete') {
      if (!hasName) return false;
      return getPreOpSummary(bed).doneCount < 6;
    }
    if (activeFilter === 'surgeryToday') {
      return hasName && bed.date && bed.date.trim() === today;
    }
    if (activeFilter === 'surgeryTomorrow') {
      return hasName && bed.date && bed.date.trim() === tomorrow;
    }
    return true;
  };

  // Layout structures
  const gridRows = useMemo(() => groupRoomsForGrid(beds), [beds]);
  const mobileList = useMemo(() => getMobileReflowList(beds), [beds]);
  const stretchers = useMemo(() => beds.filter((b) => b.id > 18), [beds]);
  const emptyBedsList = useMemo(() => beds.filter((b) => !b.name || !b.name.trim()), [beds]);

  // Helper render 1 buồng bệnh trong Desktop Grid (hỗ trợ cả 2 giường trong 1 buồng)
  const renderRoomBay = (roomGroup) => {
    if (!roomGroup) return null;
    const { allBeds, occupiedBeds, emptyBeds, label } = roomGroup;

    // Khi lọc tab "Trống"
    if (activeFilter === 'empty') {
      if (emptyBeds.length === 0) {
        return (
          <div className="h-full rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/60 p-4 flex items-center justify-center text-xs text-slate-700">
            Phòng G{label} đã đủ 2/2 BN (hết giường trống)
          </div>
        );
      }
      return (
        <div className="space-y-3">
          {emptyBeds.map((bed) => (
            <EmptyBedCard
              key={bed.id}
              bed={bed}
              onOpenDrawer={setEditingBed}
              isSwapMode={isSwapMode}
              isSelectedForSwap={swapSourceBed?.id === bed.id}
              onSelectForSwap={handleSelectForSwap}
              slotBadge={getSlotPosition(bed, allBeds)}
            />
          ))}
        </div>
      );
    }

    // Khi lọc tab "Có BN"
    if (activeFilter === 'occupied') {
      if (occupiedBeds.length === 0) {
        return (
          <div className="h-full rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/60 p-4 flex items-center justify-center text-xs text-slate-700">
            Phòng G{label} hiện chưa có BN
          </div>
        );
      }
      return (
        <div className="space-y-3">
          {occupiedBeds.map((bed) => (
            <BedCard
              key={bed.id}
              bed={bed}
              onOpenDrawer={setEditingBed}
              isSwapMode={isSwapMode}
              isSelectedForSwap={swapSourceBed?.id === bed.id}
              onSelectForSwap={handleSelectForSwap}
              highlighted={highlightedBedId === bed.id}
              slotBadge={getSlotPosition(bed, allBeds)}
              roomBeds={allBeds}
            />
          ))}
        </div>
      );
    }

    // Khi lọc theo tiêu chí lâm sàng (thiếu c/bị, mổ hôm nay, mổ ngày mai)
    if (['incomplete', 'surgeryToday', 'surgeryTomorrow'].includes(activeFilter)) {
      const matching = occupiedBeds.filter(matchesFilter);
      if (matching.length === 0) {
        return (
          <div className="h-full rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/60 p-4 flex items-center justify-center text-xs text-slate-700">
            Phòng G{label} (Không có ca khớp bộ lọc)
          </div>
        );
      }
      return (
        <div className="space-y-3">
          {matching.map((bed) => (
            <BedCard
              key={bed.id}
              bed={bed}
              onOpenDrawer={setEditingBed}
              isSwapMode={isSwapMode}
              isSelectedForSwap={swapSourceBed?.id === bed.id}
              onSelectForSwap={handleSelectForSwap}
              highlighted={highlightedBedId === bed.id}
              slotBadge={getSlotPosition(bed, allBeds)}
              roomBeds={allBeds}
            />
          ))}
        </div>
      );
    }

    // Mặc định: activeFilter === 'all'
    if (occupiedBeds.length > 0) {
      return (
        <div className="space-y-3">
          {occupiedBeds.map((bed, idx) => (
            <BedCard
              key={bed.id}
              bed={bed}
              onOpenDrawer={setEditingBed}
              isSwapMode={isSwapMode}
              isSelectedForSwap={swapSourceBed?.id === bed.id}
              onSelectForSwap={handleSelectForSwap}
              highlighted={highlightedBedId === bed.id}
              slotBadge={getSlotPosition(bed, allBeds)}
              emptyBedInRoom={
                idx === occupiedBeds.length - 1 && emptyBeds.length > 0
                  ? emptyBeds[0]
                  : null
              }
              onAddSecondPatient={setEditingBed}
              roomBeds={allBeds}
            />
          ))}
        </div>
      );
    }

    // Cả phòng hoàn toàn trống (cả 2 vị trí đều trống)
    return (
      <div className="space-y-2.5">
        {allBeds.map((bed) => (
          <EmptyBedCard
            key={bed.id}
            bed={bed}
            onOpenDrawer={setEditingBed}
            isSwapMode={isSwapMode}
            isSelectedForSwap={swapSourceBed?.id === bed.id}
            onSelectForSwap={handleSelectForSwap}
            slotBadge={getSlotPosition(bed, allBeds)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white pb-16">
      {/* Top Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        isSwapMode={isSwapMode}
        onToggleSwapMode={() => {
          setIsSwapMode(!isSwapMode);
          setSwapSourceBed(null);
        }}
        onExportPng={() => exportBedsToPng(beds)}
        onAddDoctor={handleAddDoctor}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        occupiedCount={counts.occupied}
        emptyCount={counts.empty}
        onOpenQuickAdmit={() => setIsQuickAdmitOpen(true)}
      />

      {/* Interactive Swap Mode Notification */}
      {isSwapMode && (
        <SwapBanner
          sourceBed={swapSourceBed}
          onCancel={() => {
            setIsSwapMode(false);
            setSwapSourceBed(null);
          }}
        />
      )}

      {/* P1-8: Surgery Summary Bar */}
      <SurgeryBar beds={beds} onSelectBed={handleJumpToBed} />

      {/* P1-10: Sticky Filter Tabs */}
      <FilterTabs
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        counts={counts}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4">
        {/* Mobile View (<768px): P1-9 Reflows into 1 vertical column */}
        <div className="block md:hidden space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-semibold px-1">
            <span>SƠ ĐỒ PHÒNG 707 (DANH SÁCH DỌC)</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsQuickAdmitOpen(true)}
                className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 active:scale-95"
              >
                <UserPlus className="w-3.5 h-3.5" /> + Nhập BN
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={handleAddStretcher}
                className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 active:scale-95"
              >
                <PlusCircle className="w-3.5 h-3.5" /> + Băng ca
              </button>
            </div>
          </div>

          {mobileList
            .filter((bed) => {
              if (activeFilter === 'empty') return !bed.isOccupied;
              if (activeFilter === 'occupied') return bed.isOccupied;
              if (activeFilter === 'all') return true;
              return matchesFilter(bed);
            })
            .map((bed) => {
              if (bed.isOccupied) {
                return (
                  <BedCard
                    key={bed.id}
                    id={`bed-mob-${bed.id}`}
                    bed={bed}
                    onOpenDrawer={setEditingBed}
                    isSwapMode={isSwapMode}
                    isSelectedForSwap={swapSourceBed?.id === bed.id}
                    onSelectForSwap={handleSelectForSwap}
                    highlighted={highlightedBedId === bed.id}
                    locationBadge={bed.locationLabel}
                    slotBadge={getSlotPosition(bed, bed.roomBeds || [])}
                    emptyBedInRoom={
                      bed.emptyBeds && bed.emptyBeds.length > 0 ? bed.emptyBeds[0] : null
                    }
                    onAddSecondPatient={setEditingBed}
                    roomBeds={bed.roomBeds || []}
                  />
                );
              }
              return (
                <EmptyBedCard
                  key={bed.id}
                  id={`bed-mob-${bed.id}`}
                  bed={bed}
                  onOpenDrawer={setEditingBed}
                  isSwapMode={isSwapMode}
                  isSelectedForSwap={swapSourceBed?.id === bed.id}
                  onSelectForSwap={handleSelectForSwap}
                  locationBadge={bed.locationLabel}
                  slotBadge={getSlotPosition(bed, bed.roomBeds || [])}
                />
              );
            })}
        </div>

        {/* Desktop View (≥768px): P1-6 CSS Grid alignment without zig-zag staggering */}
        <div className="hidden md:block">
          {/* Header Row for Dãy Trái & Dãy Phải */}
          <div className="grid grid-cols-2 gap-6 mb-3 px-1 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <div className="flex items-center justify-between">
              <span>DÃY TRÁI (Phòng 1 · 2 · 4 · 6 · 8)</span>
              <span className="text-[11px] font-normal text-slate-700 dark:text-slate-300">
                10 giường tối đa
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>DÃY PHẢI (Phòng 3 · 5 · 7 · 9)</span>
              <span className="text-[11px] font-normal text-slate-700 dark:text-slate-300">
                8 giường tối đa
              </span>
            </div>
          </div>

          {/* Grid Rows: Both sides aligned horizontally */}
          <div className="space-y-4">
            {gridRows.map((row) => {
              return (
                <div key={row.rowIndex} className="grid grid-cols-2 gap-6 items-stretch">
                  {/* Left Room */}
                  <div className="h-full flex flex-col justify-start">
                    {renderRoomBay(row.left)}
                  </div>

                  {/* Right Room */}
                  <div className="h-full flex flex-col justify-start">
                    {row.right === null ? (
                      <div className="h-full min-h-[140px] rounded-2xl border border-dashed border-slate-200/60 dark:border-slate-800/40 p-4 flex flex-col items-center justify-center text-center text-xs text-slate-700 dark:text-slate-300">
                        <span className="font-semibold mb-1">Cửa vào phòng 707</span>
                        <span className="text-[11px]">Không có giường đối diện phòng 1</span>
                      </div>
                    ) : (
                      renderRoomBay(row.right)
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stretchers Section (Băng ca) on Desktop */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  BĂNG CA DỰ PHÒNG Ở GIỮA HAI DÃY ({stretchers.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={handleAddStretcher}
                className="min-h-[44px] px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Thêm băng ca ở giữa</span>
              </button>
            </div>

            {stretchers.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-700 dark:text-slate-300">
                Hiện không có băng ca nào ở lối đi giữa hai dãy.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {stretchers.filter(matchesFilter).map((bed) => {
                  if (bed.name && bed.name.trim()) {
                    return (
                      <BedCard
                        key={bed.id}
                        bed={bed}
                        onOpenDrawer={setEditingBed}
                        isSwapMode={isSwapMode}
                        isSelectedForSwap={swapSourceBed?.id === bed.id}
                        onSelectForSwap={handleSelectForSwap}
                        highlighted={highlightedBedId === bed.id}
                        locationBadge="Băng ca"
                      />
                    );
                  }
                  return (
                    <EmptyBedCard
                      key={bed.id}
                      bed={bed}
                      onOpenDrawer={setEditingBed}
                      isSwapMode={isSwapMode}
                      isSelectedForSwap={swapSourceBed?.id === bed.id}
                      onSelectForSwap={handleSelectForSwap}
                      locationBadge="Băng ca"
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Quick Admit Modal Dialog */}
      <QuickAdmitModal
        isOpen={isQuickAdmitOpen}
        onClose={() => setIsQuickAdmitOpen(false)}
        emptyBeds={emptyBedsList}
        allBeds={beds}
        onSelectBed={setEditingBed}
        onFill18Beds={handleFill18Beds}
        onResetBeds={handleResetBeds}
        isFullyOccupied={emptyBedsList.length === 0}
      />

      {/* Slide-over Drawer Modal */}
      {editingBed && (
        <BedDrawer
          bed={editingBed}
          onClose={() => setEditingBed(null)}
          onSave={handleSaveBed}
          onClearBed={handleClearBed}
          onDeleteStretcher={handleDeleteStretcher}
        />
      )}
    </div>
  );
}
