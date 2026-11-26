# Xoá, chuyển cửa hàng khỏi công ty ở Danh mục cửa hàng (T946)

- Ngày: 26/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Mẫu trên artifact: https://claude.ai/artifact/6wVahYNmqtZSTCQ2YewQy2 (5 khung: hộp chi tiết, popup xoá, xoá có tích dữ liệu, popup chuyển, chuyển có tích dữ liệu).
- `src/modules/danh-muc/DanhMucCuaHang.tsx`, hộp Chi tiết cửa hàng (`HopChiTietCn`):
  - Combo Công ty có nút X bỏ trống công ty. Đổi công ty hoặc bấm X chỉ là nháp, bấm Lưu mới hỏi xác nhận. Nút Lưu luôn hiện (trước chỉ hiện ở gói Plus, Pro để lưu định mức).
  - Đang trống công ty thì chọn công ty rồi Lưu là gán luôn, không hỏi.
  - Trống công ty: dòng Trạng thái "Chưa thuộc công ty nào, không nhập được phát sinh"; cột Công ty của bảng hiện nhãn vàng.
  - Lưu bỏ trống trong `cnCongTy` là chuỗi rỗng `''` (hàm `khongCty`).
- Hộp xác nhận mới `HopDoiCty` (dùng `ThongBao`), thay hộp chuyển công ty cũ của T711. Theo người dùng: không có ô tích chọn, cả xoá lẫn chuyển luôn xoá mọi chứng từ đã phát sinh của cửa hàng ở công ty cũ.
  - Gạch đầu dòng đầu chữ đỏ: chứng từ đã phát sinh ở công ty cũ bị xoá vĩnh viễn.
  - Xoá: không nhập thêm phát sinh, thu chi FABi ngừng đồng bộ. Nút "Xoá cửa hàng và dữ liệu".
  - Chuyển: Từ, Sang; phát sinh mới vào công ty mới, thu chi FABi đồng bộ về công ty mới. Nút "Chuyển và xoá dữ liệu".
- CSS cuối `src/styles/app.css`, mục T946.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_van.py src/modules/danh-muc/DanhMucCuaHang.tsx`: Sạch.
- Bấm thử trên trình duyệt gói Pro: X, Lưu, popup xoá, xác nhận; bảng hiện "Chưa thuộc công ty nào". Chưa bấm thử luồng chuyển công ty (chung code với xoá).
- `python tools/kiem_tra.py --nhanh`: dừng ở `.bc-ban-du-lieu table.tbl` quá 8 giây, lỗi cũ đã ghi ở T933, không do việc này.

## Dở dang, việc tiếp theo

- Bản mẫu chưa xoá chứng từ thật, chưa chặn nhập phát sinh ở các màn chứng từ cho cửa hàng trống công ty.
- Điện thoại `src/ui/mobile/MCuaHang.tsx` còn hộp chuyển công ty cũ (T711, ghi "toàn bộ chứng từ chuyển theo"), chưa có nút bỏ trống. Ghi việc T947.

## Bẫy, quyết định mới

- Không.
