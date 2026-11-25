# Danh mục không xoá mã đã tạo: Lý do nghiệp vụ, Bảng giá (T940)

- Ngày: 25/11/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity (gemini-4-hydrogen-high) code phần Bảng giá
- Trạng thái cuối phiên: Xong

## Đã làm

- Dò mọi màn danh mục có nút Xoá: chỉ Lý do nghiệp vụ (1.16) và Bảng giá (1.14, web và điện thoại). Thẻ chi phí phân bổ có Xoá nhưng là thẻ, Trum chốt không tính.
- `truong-dm.ts`: bỏ `tienIch.xoa` của 1.16. Lý do thủ công không còn nút Xoá trong Tiện ích, không còn Ctrl+Delete. Tắt bằng ô Đang sử dụng có sẵn.
- `ThemBangGia.tsx`: thêm công tắc Trạng thái, Đang sử dụng ở đầu form, chế độ xem thì khoá. Huỷ trả lại trạng thái cũ, Sao chép và Lưu và thêm đặt lại Đang sử dụng. Bỏ mục Xoá bảng giá trong Tiện ích và hộp hỏi xoá.
- `MBangGia.tsx`: form lập có ô bật tắt Đang sử dụng, màn xem có dòng Trạng thái, đáy chỉ còn nút Sửa. Bỏ nút Xoá bảng giá và hộp hỏi xoá.
- Ghi QD117 vào `docs/QUYET-DINH.md`.

## Đã kiểm

- `npm run typecheck`: exit 0. `npm run build`: exit 0.
- `grep "Xoá bảng giá\|hoiXoa"` trong 2 file Bảng giá: 0 dòng.
- Script Playwright, gói Plus: web mở BG0003 công tắc khoá ở chế độ xem; Sửa, bấm thì tắt, Huỷ trả về bật; Sửa, tắt, Lưu thì giữ tắt. Điện thoại mở BG0003 không có Xoá bảng giá, có dòng Trạng thái Đang sử dụng. Không lỗi trang.
- `python tools/kiem_tra.py --nhanh`: dừng ở mục Thẻ kho (`.bc-ban-du-lieu table.tbl`), lỗi T933 có sẵn trên `main`. Các mục trước không báo lỗi.
- `kiem_van.py` 2 file Bảng giá: 0 ĐỎ, 0 VÀNG (anti chạy).

## Dở dang, việc tiếp theo

- Lý do nghiệp vụ nguồn FABi vẫn khoá ô Đang sử dụng (`chiSua` không có `_tt`). Chưa hỏi Trum có cho tắt lý do FABi không.

## Bẫy, quyết định mới

- QD117: mã danh mục đã tạo không xoá, chỉ tắt Đang sử dụng.
