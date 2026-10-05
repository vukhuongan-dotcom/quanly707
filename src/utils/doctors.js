export const DEPARTMENT_DOCTORS = [
  'TS. BSCKII Nguyễn Phú Hữu',
  'BSCKII Vũ Khương An',
  'BSCKII Vũ Ngọc Anh Tuấn',
  'BSCKII Bùi Hồng Minh Hậu',
  'BSCKII Võ Chí Nguyện',
  'BSCKI Phạm Vĩnh Phú',
  'BSCKI Giao Hữu Trường Quy',
  'BSCKI Trịnh Hoàng Minh Đức',
  'BSCKI Trần Như Đức',
  'BSCKI Lê Văn Hoan',
  'BSCKI Phạm Thị Tuyết Minh',
];

export const COLLABORATING_DOCTORS = [
  'BSCKII Lương Thanh Tùng',
  'BSCKII Hoàng Vĩnh Chúc',
  'BSCKII Trần Thiện Hoà',
  'BSCKII Phạm Thanh Việt',
  'PGS.TS.BS Dương Văn Hải',
  'BSCKI Nguyễn Hoài Nhật Duy',
  'BSCKII Tạ Văn Ngọc Đức',
  'BSCKII Đồng Thanh Thiện',
  'BSCKI Ngô Quốc Thịnh',
  'BSCKII Nguyễn Phước Thanh Sang',
  'TS.BS Văn Thành Trung',
  'BSCKII Hứa Thành Danh',
  'BSCKII Nguyễn Khôi',
  'BSCKI Đỗ Ngọc Nghĩa',
  'BSCKII Võ Thiện Lai',
  'BSCKII Nguyễn Hùng',
  'BSCKII Nguyễn Thanh Liêm',
];

export const ALL_DOCTORS = [...DEPARTMENT_DOCTORS, ...COLLABORATING_DOCTORS, 'BS Hữu'];

export const isBSHuu = (surgeonName) => {
  if (!surgeonName) return false;
  return /(?:^|\s)hữu$/i.test(surgeonName.trim());
};
