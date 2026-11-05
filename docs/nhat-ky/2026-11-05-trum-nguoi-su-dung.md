# Màn Người sử dụng theo mẫu đã duyệt (T751, T752)

- Ngày: 05/11/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity làm T752, OpenCode làm T751, Antigravity review T752
- Trạng thái cuối phiên: Xong

## Đã làm

- T751: thêm kiểu trường `chonHaiCot`, cờ `oVuong`, prop `rong` của `CatalogPanel` ở `truong-dm.ts`, `CatalogScreen.tsx`.
- T751: mở rộng `ChonHaiCot.tsx` bằng prop `the` hiện thẻ tên có nút x. Các màn đang dùng ô này giữ nguyên nút Làm mới. CSS ở mục T751 cuối `app.css`.
- T751: dòng phụ đầu `CatalogPanel` bỏ tên đăng nhập.
- T752: đổi tên màn, menu, chữ hướng dẫn thành Người sử dụng; gõ "người dùng" ở ô tìm lệnh vẫn ra màn này.
- T752: bảng có thanh lọc, bộ lọc nâng cao, Tuỳ chỉnh cột, nút Thêm mới; chỉ bấm icon bút mới mở panel; 5 cột mặc định ẩn.
- T752: form bỏ Tên đăng nhập, Bộ phận, Bắt buộc xác thực hai lớp, Hiệu lực từ ngày; thêm Xác thực, Đăng nhập gần nhất, Thông tin hệ thống.
- T752: `NGUOI_DUNG` trong `mock.ts` đổi trường theo QD96. Điện thoại đổi chữ và form, không có bộ lọc nâng cao, chọn cột.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: in "Không có lỗi." Cả ba chạy sau lần sửa cuối.
- Script Playwright riêng trên màn máy tính 1440x900, gói Pro: qua 35/35 mục, chạy sau lần sửa cuối.
- `python tools/kiem_van.py` các file có sửa chữ: 0 ĐỎ.
- Worker review `pre-push-qa` kết luận XANH cho diff T752, trước các sửa nhỏ của coordinator.
- Chưa bấm thử màn này trên điện thoại ngoài bộ `kiem_tra`.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- QD96 ghi quyết định của Trum về màn này.
- `ChonHaiCot.tsx` đã có sẵn và nhiều màn đang dùng. Spec T751 ghi nhầm là file mới, nên đọc lại file trước khi ghi "mới" trong spec.
- `.tbl thead tr:first-child th` đè `.tbl th.c`: cột có `c: true` vẫn căn trái tiêu đề. Màn này thêm luật riêng `.nd-bang .tbl thead th[data-k="x"]`.
- `.chc-chip` ở dòng khoảng 36748 của `app.css` đặt `max-width: 96px`, `display: inline-block`: dạng thẻ phải ghi đè, nếu không nút x rớt dòng.
