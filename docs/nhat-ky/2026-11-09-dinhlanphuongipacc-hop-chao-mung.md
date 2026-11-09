# Đổi chữ hộp chào mừng Hướng dẫn ở Trang chủ (T783)

- Ngày: 09/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/home/HuongDan.tsx`, hộp chào mừng (bước 0, dùng chung web và điện thoại):
  - Nút phụ "Bỏ qua" đổi thành "Bắt đầu ngay". Các bước sau của tour vẫn ghi "Bỏ qua".
  - Nút chính "Khám phá ngay" đổi thành "Xem hướng dẫn", để chủ quán phân biệt rõ nút đi tour và nút vào thẳng.
  - Câu thông báo: "Sổ sách của quán đã sẵn sàng. Xem nhanh 3 thông tin quan trọng: Kết quả kinh doanh, Quỹ tiền và Kê khai thuế."
  - Tiêu đề nối "iPOS" và "Accounting" bằng dấu cách không ngắt (` `), không bị tách hai dòng.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py src/modules/home/HuongDan.tsx`: 0 ĐỎ, 2 VÀNG (câu dài dòng 54 có sẵn; nút "Bắt đầu ngay" không theo kiểu động từ + đối tượng, người dùng đã chốt chữ này).
- Chưa mở trình duyệt xem bằng mắt.

## Dở dang, việc tiếp theo

- `tools/xuat_bao_cao_he_thong.py` vẫn lỗi thiếu module `build_present` trên máy này, chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`.

## Bẫy, quyết định mới

- Không.
