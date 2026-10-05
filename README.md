# QUẢN LÝ PHÒNG 707 (P707) · Khoa PT ĐTT

Hệ thống quản lý buồng bệnh tiền phẫu Phòng 707 — Khoa Phẫu thuật Đại trực tràng, Bệnh viện Bình Dân.
Xây dựng trên nền tảng **React 19 + Tailwind CSS v4 + Vite**.

## 🚀 Tính năng nổi bật

- **Tối ưu đi buồng & giao ban:**
  - Bố cục 9 phòng / 18 vị trí giường chuẩn (`VT1` và `VT2`), tự động thích ứng Desktop và Mobile.
  - Bỏ slot rỗng thừa; hỗ trợ tiếp nhận nhanh đủ 18 giường trực tiếp trên thẻ hoặc qua Modal tiếp nhận.
  - Thẻ giường thu gọn mặc định, bung chi tiết tại chỗ ("Xem thêm").
  - 6 tiêu chí tiền phẫu luôn hiển thị trực quan (3 thuốc + 3 giấy tờ) cùng chip tổng tiến độ $x/6$.
  - Công thái học lâm sàng: 100% phần tử tương tác đạt chiều cao bấm $\ge 44\text{px}$.
  - Hỗ trợ Dark Mode phòng mổ chuẩn WCAG.
  - Form Dirty Guard: Cảnh báo chống mất dữ liệu khi vô tình đóng drawer.
  - Bản dịch tiếng Anh chuyên khoa gom gọn theo accordion.

## 🛠️ Công nghệ

- **Frontend:** React 19, Tailwind CSS v4, Lucide React
- **Build Tool:** Vite 6
- **Hosting:** GitHub Pages (Automated GitHub Actions CI/CD)

## 💻 Chạy cục bộ (Local Development)

```bash
# Cài đặt thư viện
npm install

# Khởi chạy dev server
npm run dev

# Build sản phẩm production
npm run build
```
