export const getRoomLabel = (slotOrId) => {
  const num = Number(slotOrId);
  if (num <= 10) {
    return String([1, 1, 2, 2, 4, 4, 6, 6, 8, 8][num - 1]);
  }
  if (num <= 18) {
    return String([3, 3, 5, 5, 7, 7, 9, 9][num - 11]);
  }
  return `BC${num - 18}`;
};

export const getCurrentYear = () => {
  return Number(
    new Intl.DateTimeFormat('en', {
      year: 'numeric',
      timeZone: 'Asia/Ho_Chi_Minh',
    }).format(new Date())
  );
};

export const getPatientAge = (birth) => {
  if (!birth) return null;
  const birthYear = Number(birth);
  if (isNaN(birthYear) || birthYear <= 1900 || birthYear > 2030) return null;
  return getCurrentYear() - birthYear;
};

export const createEmptyBed = (id, label = '', slot = null) => ({
  id,
  slot: slot ?? id,
  label: label || getRoomLabel(slot ?? id),
  name: '',
  birth: '',
  history: '',
  historyEn: '',
  diagnosis: '',
  diagnosisEn: '',
  treatment: '',
  treatmentEn: '',
  surgeon: '',
  date: '',
  notes: '',
  notesEn: '',
  antibiotic: false,
  enema: false,
  fortrans: false,
  fiveSignatures: false,
  consentForm: false,
  anesthesiaSurvey: false,
  version: 0,
});

/**
 * Xác định vị trí giường trong phòng (Vị trí 1 hay Vị trí 2)
 */
export const getSlotPosition = (bed, roomBeds = []) => {
  if (!bed || bed.id > 18) return '';
  const list = roomBeds.length > 0 
    ? roomBeds 
    : [bed];
  const sorted = [...list].sort((a, b) => (a.slot ?? a.id) - (b.slot ?? b.id));
  const idx = sorted.findIndex((b) => b.id === bed.id);
  return idx >= 0 ? `VT${idx + 1}` : 'VT1';
};

/**
 * P0-1: Triệt tiêu slot rỗng "2 vị trí" cồng kềnh,
 * nhưng ĐẢM BẢO chức năng tiếp nhận đủ 18 giường:
 * - Nếu phòng có 1 BN: Render thẻ BN, kèm nút compact "+ Tiếp nhận BN vị trí 2".
 * - Nếu phòng có 2 BN: Render cả 2 thẻ BN rõ ràng (đạt tối đa 18 giường).
 * - Nếu phòng trống: Render thẻ compact nhận BN vị trí 1 và vị trí 2.
 */
export const groupRoomsForGrid = (beds) => {
  const leftLabels = ['1', '2', '4', '6', '8'];
  const rightLabels = [null, '3', '5', '7', '9'];

  return leftLabels.map((leftLabel, idx) => {
    const leftBeds = beds
      .filter((b) => b.id <= 18 && (b.label === leftLabel || getRoomLabel(b.slot ?? b.id) === leftLabel))
      .sort((a, b) => (a.slot ?? a.id) - (b.slot ?? b.id));

    const leftOccupied = leftBeds.filter((b) => b.name && b.name.trim());
    const leftEmpty = leftBeds.filter((b) => !b.name || !b.name.trim());

    const leftGroup = {
      label: leftLabel,
      wing: 'left',
      allBeds: leftBeds,
      occupiedBeds: leftOccupied,
      emptyBeds: leftEmpty,
      hasPatient: leftOccupied.length > 0,
      isFull: leftOccupied.length >= 2,
    };

    const rightLabel = rightLabels[idx];
    let rightGroup = null;
    if (rightLabel !== null) {
      const rightBeds = beds
        .filter((b) => b.id <= 18 && (b.label === rightLabel || getRoomLabel(b.slot ?? b.id) === rightLabel))
        .sort((a, b) => (a.slot ?? a.id) - (b.slot ?? b.id));

      const rightOccupied = rightBeds.filter((b) => b.name && b.name.trim());
      const rightEmpty = rightBeds.filter((b) => !b.name || !b.name.trim());

      rightGroup = {
        label: rightLabel,
        wing: 'right',
        allBeds: rightBeds,
        occupiedBeds: rightOccupied,
        emptyBeds: rightEmpty,
        hasPatient: rightOccupied.length > 0,
        isFull: rightOccupied.length >= 2,
      };
    }

    return {
      rowIndex: idx,
      left: leftGroup,
      right: rightGroup,
    };
  });
};

/**
 * P1-9: Gộp thành 1 danh sách dọc 1 cột duy nhất cho Mobile (<768px).
 * Hỗ trợ tiếp nhận bệnh nhân cho toàn bộ 18 giường.
 */
export const getMobileReflowList = (beds) => {
  const leftLabels = ['1', '2', '4', '6', '8'];
  const rightLabels = ['3', '5', '7', '9'];
  const stretchers = beds.filter((b) => b.id > 18 || (b.label && b.label.startsWith('BC')));

  const result = [];

  // Dãy trái
  leftLabels.forEach((label) => {
    const roomBeds = beds
      .filter((b) => b.id <= 18 && (b.label === label || getRoomLabel(b.slot ?? b.id) === label))
      .sort((a, b) => (a.slot ?? a.id) - (b.slot ?? b.id));

    const occupied = roomBeds.filter((b) => b.name && b.name.trim());
    const empty = roomBeds.filter((b) => !b.name || !b.name.trim());

    if (occupied.length > 0) {
      occupied.forEach((bed, i) => {
        result.push({
          ...bed,
          locationLabel: `DÃY TRÁI · G${label} (${getSlotPosition(bed, roomBeds)})`,
          isOccupied: true,
          wing: 'left',
          roomBeds,
          emptyBeds: empty,
        });
      });

      // Nếu còn giường trống trong phòng, chèn nút tiếp nhận vị trí 2
      if (empty.length > 0) {
        result.push({
          ...empty[0],
          locationLabel: `DÃY TRÁI · G${label} (${getSlotPosition(empty[0], roomBeds)})`,
          isOccupied: false,
          wing: 'left',
          isSecondSlot: true,
          roomBeds,
        });
      }
    } else {
      // Cả phòng trống -> Hiện cả 2 vị trí
      roomBeds.forEach((bed, i) => {
        result.push({
          ...bed,
          locationLabel: `DÃY TRÁI · G${label} (${getSlotPosition(bed, roomBeds)})`,
          isOccupied: false,
          wing: 'left',
          roomBeds,
        });
      });
    }
  });

  // Băng ca ở giữa (nếu có)
  stretchers.forEach((bed) => {
    const isOcc = Boolean(bed.name && bed.name.trim());
    result.push({
      ...bed,
      locationLabel: `BĂNG CA · ${bed.label || 'BC'}`,
      isOccupied: isOcc,
      wing: 'middle',
    });
  });

  // Dãy phải
  rightLabels.forEach((label) => {
    const roomBeds = beds
      .filter((b) => b.id <= 18 && (b.label === label || getRoomLabel(b.slot ?? b.id) === label))
      .sort((a, b) => (a.slot ?? a.id) - (b.slot ?? b.id));

    const occupied = roomBeds.filter((b) => b.name && b.name.trim());
    const empty = roomBeds.filter((b) => !b.name || !b.name.trim());

    if (occupied.length > 0) {
      occupied.forEach((bed) => {
        result.push({
          ...bed,
          locationLabel: `DÃY PHẢI · G${label} (${getSlotPosition(bed, roomBeds)})`,
          isOccupied: true,
          wing: 'right',
          roomBeds,
          emptyBeds: empty,
        });
      });

      if (empty.length > 0) {
        result.push({
          ...empty[0],
          locationLabel: `DÃY PHẢI · G${label} (${getSlotPosition(empty[0], roomBeds)})`,
          isOccupied: false,
          wing: 'right',
          isSecondSlot: true,
          roomBeds,
        });
      }
    } else {
      roomBeds.forEach((bed) => {
        result.push({
          ...bed,
          locationLabel: `DÃY PHẢI · G${label} (${getSlotPosition(bed, roomBeds)})`,
          isOccupied: false,
          wing: 'right',
          roomBeds,
        });
      });
    }
  });

  return result;
};

/**
 * Tính số mục chuẩn bị tiền phẫu (x/6).
 */
export const getPreOpSummary = (bed) => {
  const items = [
    { key: 'antibiotic', label: 'Kháng sinh', type: 'med', done: Boolean(bed.antibiotic) },
    { key: 'enema', label: 'Thụt tháo', type: 'med', done: Boolean(bed.enema) },
    { key: 'fortrans', label: 'Fortrans', type: 'med', done: Boolean(bed.fortrans) },
    { key: 'fiveSignatures', label: '5 chữ ký', type: 'doc', done: Boolean(bed.fiveSignatures) },
    { key: 'consentForm', label: 'Cam kết mổ', type: 'doc', done: Boolean(bed.consentForm) },
    { key: 'anesthesiaSurvey', label: 'Khảo sát TM', type: 'doc', done: Boolean(bed.anesthesiaSurvey) },
  ];
  const doneCount = items.filter((i) => i.done).length;
  return {
    items,
    doneCount,
    totalCount: 6,
    isComplete: doneCount === 6,
  };
};

/**
 * Format ngày giờ hiện tại
 */
export const formatVietnamDate = (d = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d);
  const getPart = (type) => parts.find((p) => p.type === type)?.value || '';
  return `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
};

export const getSurgeryDates = () => {
  const now = new Date();
  const today = formatVietnamDate(now);
  const tomorrowDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrow = formatVietnamDate(tomorrowDate);
  return { today, tomorrow };
};

/**
 * Dữ liệu lâm sàng mẫu chuẩn cho 9 giường trống còn lại để test đầy đủ 18 giường
 */
export const SAMPLE_FILL_18_BEDS = {
  2: {
    name: 'LÊ VĂN HOÀNG',
    birth: '1972',
    history: 'Tăng huyết áp đang dùng Amlodipine 5mg/ngày',
    historyEn: 'Hypertension on Amlodipine 5mg/day',
    diagnosis: 'K đại tràng góc gan cT3N0M0',
    diagnosisEn: 'Hepatic flexure colon cancer cT3N0M0',
    treatment: 'Phẫu thuật cắt đại tràng phải nội soi nạo hạch D3',
    treatmentEn: 'Laparoscopic right hemicolectomy with D3 lymphadenectomy',
    surgeon: 'TS. BSCKII Nguyễn Phú Hữu',
    date: '2026-10-06',
    notes: 'Bệnh nhân tổng trạng khá, CEA 4.2 ng/ml. Chuẩn bị ruột kỹ bằng Fortrans.',
    notesEn: 'Fair general condition, CEA 4.2 ng/ml.',
    antibiotic: true,
    enema: true,
    fortrans: true,
    fiveSignatures: true,
    consentForm: true,
    anesthesiaSurvey: true,
  },
  4: {
    name: 'NGUYỄN VĂN HÙNG',
    birth: '1968',
    history: 'Trĩ hỗn hợp 10 năm, táo bón mạn',
    historyEn: 'Mixed hemorrhoids for 10 years',
    diagnosis: 'Trĩ nội độ IV nghẹt xuất huyết',
    diagnosisEn: 'Grade IV strangulated hemorrhoids with bleeding',
    treatment: 'Phẫu thuật Longo cải biên',
    treatmentEn: 'Modified Longo procedure',
    surgeon: 'BSCKII Vũ Khương An',
    date: '2026-10-05',
    notes: 'Khối trĩ sa nghẹt phù nề, cần giảm đau tích cực sau mổ.',
    notesEn: 'Strangulated edematous hemorrhoidal mass.',
    antibiotic: true,
    enema: true,
    fortrans: false,
    fiveSignatures: true,
    consentForm: true,
    anesthesiaSurvey: false,
  },
  6: {
    name: 'ĐẶNG THỊ MAI',
    birth: '1985',
    history: 'Tiền căn mổ rò hậu môn năm 2024',
    historyEn: 'Prior anal fistula surgery in 2024',
    diagnosis: 'Rò hậu môn phức tạp tái phát xuyên cơ thắt cao',
    diagnosisEn: 'Recurrent complex transsphincteric anal fistula',
    treatment: 'Phẫu thuật cắt đường rò + đặt seton dẫn lưu',
    treatmentEn: 'Fistulotomy and loose seton placement',
    surgeon: 'BSCKII Vũ Ngọc Anh Tuấn',
    date: '2026-10-06',
    notes: 'MRI vùng chậu có đường rò ngóc ngách hướng 6h.',
    notesEn: 'Pelvic MRI shows branching tract at 6 oclock.',
    antibiotic: true,
    enema: true,
    fortrans: false,
    fiveSignatures: true,
    consentForm: false,
    anesthesiaSurvey: false,
  },
  14: {
    name: 'TRẦN ĐỨC MINH',
    birth: '1959',
    history: 'ĐTĐ type 2 đang tiêm Insulin, K trực tràng đã xạ trị tiền phẫu',
    historyEn: 'Type 2 diabetes on insulin, rectal cancer post-CRT',
    diagnosis: 'K trực tràng giữa cT3bN1M0 sau CRT',
    diagnosisEn: 'Mid rectal cancer post neoadjuvant CRT',
    treatment: 'Phẫu thuật TME nội soi bảo tồn cơ thắt',
    treatmentEn: 'Laparoscopic TME with sphincter preservation',
    surgeon: 'TS. BSCKII Nguyễn Phú Hữu',
    date: '2026-10-06',
    notes: 'Khoảng cách bờ dưới khối u đến rìa hậu môn 6cm. Chuẩn bị làm hồi tràng mở ra da bảo vệ.',
    notesEn: 'Tumor 6cm from anal verge, protective loop ileostomy planned.',
    antibiotic: true,
    enema: true,
    fortrans: true,
    fiveSignatures: true,
    consentForm: true,
    anesthesiaSurvey: true,
  },
  15: {
    name: 'PHẠM THỊ HỒNG',
    birth: '1977',
    history: 'Khỏe mạnh, nội soi tầm soát phát hiện u polyp',
    historyEn: 'Healthy, screening colonoscopy found polyp',
    diagnosis: 'Polyp đại tràng sigma kích thước lớn (3cm) dạng cuống',
    diagnosisEn: 'Large pedunculated sigmoid colon polyp (3cm)',
    treatment: 'Cắt polyp qua nội soi đại tràng ống mềm',
    treatmentEn: 'Endoscopic mucosal resection of polyp',
    surgeon: 'BSCKI Phạm Vĩnh Phú',
    date: '2026-10-05',
    notes: 'Đã ngưng thuốc chống đông 7 ngày.',
    notesEn: 'Anticoagulants stopped 7 days ago.',
    antibiotic: false,
    enema: true,
    fortrans: true,
    fiveSignatures: true,
    consentForm: true,
    anesthesiaSurvey: false,
  },
  9: {
    name: 'VŨ ĐÌNH TRỌNG',
    birth: '1963',
    history: 'Hút thuốc lá 30 gói-năm',
    historyEn: 'Smoker 30 pack-years',
    diagnosis: 'K đại tràng trái cT4aN1M0',
    diagnosisEn: 'Left colon cancer cT4aN1M0',
    treatment: 'Phẫu thuật cắt đại tràng trái nội soi',
    treatmentEn: 'Laparoscopic left hemicolectomy',
    surgeon: 'BSCKII Bùi Hồng Minh Hậu',
    date: '2026-10-06',
    notes: 'U xâm lấn thanh mạc, cần nẹp bảo vệ vết mổ.',
    notesEn: 'Serosal invasion suspected.',
    antibiotic: true,
    enema: true,
    fortrans: true,
    fiveSignatures: true,
    consentForm: true,
    anesthesiaSurvey: false,
  },
  11: {
    name: 'HOÀNG THỊ THẢO',
    birth: '1990',
    history: 'Sinh thường 2 lần, không tiền căn dị ứng',
    historyEn: 'Parity 2, no drug allergies',
    diagnosis: 'Áp-xe cạnh hậu môn gian cơ thắt cấp tính',
    diagnosisEn: 'Acute ischiorectal perianal abscess',
    treatment: 'Rạch thoát mủ + dẫn lưu áp-xe',
    treatmentEn: 'Incision and drainage of perianal abscess',
    surgeon: 'BSCKI Giao Hữu Trường Quy',
    date: '2026-10-05',
    notes: 'Khối sưng nóng đỏ đau cạnh hậu môn P, sốt nhẹ 38 độ C.',
    notesEn: 'Right perianal erythematous tender mass.',
    antibiotic: true,
    enema: false,
    fortrans: false,
    fiveSignatures: true,
    consentForm: true,
    anesthesiaSurvey: false,
  },
  16: {
    name: 'BÙI VĂN PHÚC',
    birth: '1955',
    history: 'Tai biến mạch máu não cũ di chứng yếu nhẹ nửa người T',
    historyEn: 'Old stroke with mild left hemiparesis',
    diagnosis: 'Sa trực tràng toàn phần độ III',
    diagnosisEn: 'Full-thickness rectal prolapse grade III',
    treatment: 'Phẫu thuật cố định trực tràng vào ụ nhô (Wells)',
    treatmentEn: 'Laparoscopic ventral mesh rectopexy',
    surgeon: 'BSCKII Võ Chí Nguyện',
    date: '2026-10-06',
    notes: 'Khối sa 7cm khi rặn, đã kiểm tra chức năng cơ thắt.',
    notesEn: '7cm prolapse on straining.',
    antibiotic: true,
    enema: true,
    fortrans: true,
    fiveSignatures: true,
    consentForm: true,
    anesthesiaSurvey: false,
  },
  18: {
    name: 'ĐỖ THỊ LAN',
    birth: '1981',
    history: 'Viêm túi thừa đại tràng 2 lần năm 2025',
    historyEn: 'Diverticulitis x2 in 2025',
    diagnosis: 'Túi thừa đại tràng chậu hông viêm đợt cấp',
    diagnosisEn: 'Acute recurrent sigmoid diverticulitis',
    treatment: 'Điều trị nội khoa kháng sinh tĩnh mạch + theo dõi ngoại khoa',
    treatmentEn: 'Medical therapy with IV antibiotics',
    surgeon: 'BSCKI Trịnh Hoàng Minh Đức',
    date: '',
    notes: 'Bụng đau hố chậu trái, đề kháng nhẹ. Nhịn ăn, truyền dịch, làm CT kiểm tra.',
    notesEn: 'LLQ tenderness, NPO, IV fluids.',
    antibiotic: true,
    enema: false,
    fortrans: false,
    fiveSignatures: true,
    consentForm: true,
    anesthesiaSurvey: true,
  },
};
