# Gói Free mở lại loại Khách hàng ở danh mục đối tượng (T501)

- Ngày: 20/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Bỏ phần T470 đã làm: gói Free lại có loại đối tượng Khách hàng.
- `src/modules/danh-muc/truong-dm.ts`: gộp hai ô Loại đối tượng (một cho gói Free chỉ có Nhà cung cấp, Nhân viên) thành một ô đủ 3 loại cho mọi gói. Ô này dùng chung cho form danh mục và form thêm nhanh đối tượng trong chứng từ, nên cả hai chỗ đều tạo được khách hàng.
- `src/modules/danh-muc/index.ts`: bỏ `locGoi` của danh mục 1.5, gói Free lại thấy các khách hàng có sẵn trong danh sách.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- `python tools/xuat_bao_cao_he_thong.py` chưa chạy được trên máy PhuongXT: thiếu file `Dự kiến tính năng IACC Cloud.xlsx` ở gốc repo. File báo cáo Excel chưa làm mới.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
