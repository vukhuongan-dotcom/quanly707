import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Save, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Languages, 
  AlertTriangle,
  User,
  Calendar,
  Stethoscope,
  Pill,
  FileCheck,
  ShieldAlert
} from 'lucide-react';
import { translate } from '../utils/dictionary';
import { ALL_DOCTORS, DEPARTMENT_DOCTORS, COLLABORATING_DOCTORS } from '../utils/doctors';

export default function BedDrawer({
  bed,
  onClose,
  onSave,
  onClearBed,
  onDeleteStretcher,
}) {
  // Form State
  const [form, setForm] = useState(() => ({
    name: bed?.name || '',
    birth: bed?.birth || '',
    history: bed?.history || '',
    historyEn: bed?.historyEn || '',
    diagnosis: bed?.diagnosis || '',
    diagnosisEn: bed?.diagnosisEn || '',
    treatment: bed?.treatment || '',
    treatmentEn: bed?.treatmentEn || '',
    surgeon: bed?.surgeon || '',
    date: bed?.date || '',
    notes: bed?.notes || '',
    notesEn: bed?.notesEn || '',
    antibiotic: Boolean(bed?.antibiotic),
    enema: Boolean(bed?.enema),
    fortrans: Boolean(bed?.fortrans),
    fiveSignatures: Boolean(bed?.fiveSignatures),
    consentForm: Boolean(bed?.consentForm),
    anesthesiaSurvey: Boolean(bed?.anesthesiaSurvey),
  }));

  // P1-12: Collapsible English Section
  const [showEnglish, setShowEnglish] = useState(false);
  const [showDangerZone, setShowDangerZone] = useState(false);

  // Store initial form state to detect dirty changes
  const initialFormRef = useRef(null);
  useEffect(() => {
    initialFormRef.current = JSON.stringify(form);
  }, []);

  const isDirty = () => {
    if (!initialFormRef.current) return false;
    return JSON.stringify(form) !== initialFormRef.current;
  };

  // P0-2: Dirty Guard - Handle Close with Escape and Backdrop
  const attemptClose = () => {
    if (isDirty()) {
      const confirmLeave = window.confirm(
        'Thông tin hồ sơ đã được chỉnh sửa nhưng chưa lưu.\nBạn có chắc chắn muốn đóng và hủy bỏ các thay đổi?'
      );
      if (confirmLeave) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        attemptClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [form]);

  // Handle field change with automatic English translation
  const handleChange = (field, value) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-translate Vietnamese medical fields
      if (field === 'history') {
        const trans = translate(value);
        if (trans) updated.historyEn = trans;
      } else if (field === 'diagnosis') {
        const trans = translate(value);
        if (trans) updated.diagnosisEn = trans;
      } else if (field === 'treatment') {
        const trans = translate(value);
        if (trans) updated.treatmentEn = trans;
      } else if (field === 'notes') {
        const trans = translate(value);
        if (trans) updated.notesEn = trans;
      }

      return updated;
    });
  };

  const handleToggle = (field) => {
    setForm((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...bed,
      ...form,
      version: (bed.version || 0) + 1,
    });
  };

  const handleClear = () => {
    const confirmClear = window.confirm(
      `Xác nhận xóa trắng thông tin bệnh nhân tại Giường G${bed.label}?`
    );
    if (confirmClear) {
      onClearBed(bed);
    }
  };

  // Count translated fields for badge
  const translatedCount = [form.historyEn, form.diagnosisEn, form.treatmentEn, form.notesEn].filter(
    (t) => t && t.trim()
  ).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end animate-fadeIn">
      {/* Backdrop with click-to-close Dirty Guard */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={attemptClose}
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col h-full z-10 border-l border-slate-200 dark:border-slate-800 animate-slideLeft">
        {/* Drawer Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-extrabold text-base flex items-center justify-center shadow-xs">
              G{bed.label}
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {bed.name ? `Cập nhật hồ sơ G${bed.label}` : `Nhập bệnh nhân G${bed.label}`}
              </h2>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                Khoa Phẫu thuật Đại trực tràng · Phòng 707
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={attemptClose}
            aria-label="Đóng bảng chỉnh sửa"
            className="w-11 h-11 rounded-xl flex items-center justify-center text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
          {/* Patient Info Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Họ và tên bệnh nhân
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value.toUpperCase())}
                placeholder="VD: NGUYỄN VĂN A"
                className="w-full h-11 px-3.5 text-sm font-semibold uppercase bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Năm sinh
              </label>
              <input
                type="number"
                value={form.birth}
                onChange={(e) => handleChange('birth', e.target.value)}
                placeholder="1980"
                min="1910"
                max="2030"
                className="w-full h-11 px-3.5 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Diagnosis & Treatment */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Chẩn đoán
            </label>
            <input
              type="text"
              value={form.diagnosis}
              onChange={(e) => handleChange('diagnosis', e.target.value)}
              placeholder="VD: Trĩ nội độ III xuất huyết / K đại tràng sigma..."
              className="w-full h-11 px-3.5 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Phương pháp phẫu thuật / Điều trị
            </label>
            <input
              type="text"
              value={form.treatment}
              onChange={(e) => handleChange('treatment', e.target.value)}
              placeholder="VD: Phẫu thuật cắt đại tràng sigma nội soi..."
              className="w-full h-11 px-3.5 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden"
            />
          </div>

          {/* Surgeon & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Phẫu thuật viên
              </label>
              <select
                value={form.surgeon}
                onChange={(e) => handleChange('surgeon', e.target.value)}
                className="w-full h-11 px-3 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:outline-hidden"
              >
                <option value="">-- Chọn phẫu thuật viên --</option>
                <optgroup label="Bác sĩ Khoa PT ĐTT">
                  {DEPARTMENT_DOCTORS.map((doc) => (
                    <option key={doc} value={doc}>
                      {doc}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Bác sĩ phối hợp / Khác">
                  {COLLABORATING_DOCTORS.map((doc) => (
                    <option key={doc} value={doc}>
                      {doc}
                    </option>
                  ))}
                  <option value="BS Hữu">BS Hữu</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Ngày phẫu thuật
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full h-11 px-3 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* P1-13: 6 LARGE Clinical Checkboxes (≥44px touch targets) */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Chuẩn bị tiền phẫu (Tick nhanh)
              </label>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Chạm để bật/tắt (≥48px)
              </span>
            </div>

            <div className="space-y-3">
              {/* Thuốc tiền phẫu */}
              <div>
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                  <Pill className="w-3.5 h-3.5" /> Thuốc & Chuẩn bị ruột
                </span>
                <div className="grid grid-cols-1 xs:grid-cols-3 gap-2">
                  {[
                    { key: 'antibiotic', label: 'Kháng sinh' },
                    { key: 'enema', label: 'Thụt tháo' },
                    { key: 'fortrans', label: 'Fortrans' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleToggle(item.key)}
                      className={`min-h-[48px] px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between gap-2 border transition-all active:scale-97 text-left ${
                        form[item.key]
                          ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-200 border-emerald-500 ring-1 ring-emerald-500'
                          : 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      <span className="truncate">{item.label}</span>
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                          form[item.key]
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-transparent'
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hồ sơ pháp lý */}
              <div>
                <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                  <FileCheck className="w-3.5 h-3.5" /> Hồ sơ & Giấy tờ mổ
                </span>
                <div className="grid grid-cols-1 xs:grid-cols-3 gap-2">
                  {[
                    { key: 'fiveSignatures', label: 'Tờ 5 chữ ký' },
                    { key: 'consentForm', label: 'Cam kết mổ' },
                    { key: 'anesthesiaSurvey', label: 'Khảo sát tiền mê' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleToggle(item.key)}
                      className={`min-h-[48px] px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between gap-2 border transition-all active:scale-97 text-left ${
                        form[item.key]
                          ? 'bg-blue-50 text-blue-900 dark:bg-blue-950/80 dark:text-blue-200 border-blue-500 ring-1 ring-blue-500'
                          : 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      <span className="truncate">{item.label}</span>
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                          form[item.key]
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-transparent'
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Medical History & Notes */}
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Tiền căn
              </label>
              <textarea
                rows={2}
                value={form.history}
                onChange={(e) => handleChange('history', e.target.value)}
                placeholder="VD: Tăng huyết áp 5 năm, ĐTĐ type 2..."
                className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Chú ý lâm sàng
              </label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="VD: Dị ứng Penicillin, xét nghiệm đông máu..."
                className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden"
              />
            </div>
          </div>

          {/* P1-12: Collapsible English Section (Default Closed) */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowEnglish(!showEnglish)}
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Bản dịch tiếng Anh chuyên ngành</span>
                {translatedCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {translatedCount}/4 mục
                  </span>
                )}
              </div>
              {showEnglish ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showEnglish && (
              <div className="mt-3 space-y-3 p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 animate-fadeIn">
                <p className="text-[11px] text-slate-700 dark:text-slate-300 italic">
                  Từ điển tự động gợi ý dịch thuật song ngữ. Bạn có thể chỉnh sửa trực tiếp bên dưới.
                </p>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Diagnosis (EN)
                  </label>
                  <input
                    type="text"
                    value={form.diagnosisEn}
                    onChange={(e) => handleChange('diagnosisEn', e.target.value)}
                    placeholder="English diagnosis..."
                    className="w-full h-10 px-3 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Treatment (EN)
                  </label>
                  <input
                    type="text"
                    value={form.treatmentEn}
                    onChange={(e) => handleChange('treatmentEn', e.target.value)}
                    placeholder="English procedure..."
                    className="w-full h-10 px-3 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    History (EN)
                  </label>
                  <textarea
                    rows={2}
                    value={form.historyEn}
                    onChange={(e) => handleChange('historyEn', e.target.value)}
                    placeholder="English medical history..."
                    className="w-full p-2.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Notes (EN)
                  </label>
                  <textarea
                    rows={2}
                    value={form.notesEn}
                    onChange={(e) => handleChange('notesEn', e.target.value)}
                    placeholder="English clinical notes..."
                    className="w-full p-2.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>
            )}
          </div>

          {/* P1-14: Tách biệt Nút Làm trống giường (Danger Zone) */}
          {bed.name && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowDangerZone(!showDangerZone)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-700 dark:text-rose-400" />
                  <span>Khu vực nguy hiểm (Làm trống giường)</span>
                </div>
                {showDangerZone ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showDangerZone && (
                <div className="mt-2 p-3 bg-rose-50/70 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/60 animate-fadeIn flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div>
                    <div className="text-xs font-bold text-rose-900 dark:text-rose-300">
                      Làm trống giường G{bed.label}
                    </div>
                    <div className="text-[11px] text-rose-800 dark:text-rose-400">
                      Bệnh nhân: {bed.name} · Dữ liệu sẽ được dọn dẹp.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Xác nhận làm trống</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Nút xóa băng ca (nếu là băng ca) */}
          {bed.id > 18 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onDeleteStretcher(bed)}
                className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-950 dark:hover:text-rose-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa băng ca {bed.label}</span>
              </button>
            </div>
          )}
        </form>

        {/* Drawer Sticky Footer: Save & Close (≥44px) */}
        <div className="p-3.5 sm:px-6 sm:py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2.5">
          <button
            type="button"
            onClick={attemptClose}
            className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Đóng (Hủy)
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="flex-2 min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Lưu hồ sơ G{bed.label}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
