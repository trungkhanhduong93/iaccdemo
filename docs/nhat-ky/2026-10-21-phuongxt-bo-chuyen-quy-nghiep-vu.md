# Bỏ Chuyển quỹ, Số dư ban đầu ở màn Nghiệp vụ Thu chi điện thoại (T572)

- Ngày: 21/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MNghiepVu.tsx`: phân hệ Thu chi chỉ còn mục Thu, chi tiền. Bỏ mục Chuyển quỹ (đã là tab trong danh sách Thu, chi tiền) và Số dư ban đầu gói Free (khai ở Danh mục Quỹ tiền, QD61).

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi (chạy trên bản máy PhuongXT trước khi lấy bản mới về).

## Dở dang, việc tiếp theo

- Không. Web vẫn giữ "Chuyển quỹ nội bộ" trong menu bung ra của phân hệ Thu chi vì nằm chung danh sách nghiệp vụ; muốn bỏ thì mở việc mới.

## Bẫy, quyết định mới

- Không.
