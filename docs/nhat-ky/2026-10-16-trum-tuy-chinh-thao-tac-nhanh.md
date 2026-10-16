# Tuỳ chỉnh Thao tác nhanh kiểu Ctrl K, nút bật tắt toàn app (T280)

- Ngày: 16/10/2026
- Người: Trum, agent: Claude Code giao Antigravity (gemini-3.8-flash-high) qua Orca
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/app/thaoTacNhanh.ts`: thêm `layTatCaThaoTac`. Danh sách chọn gồm 11 thao tác cũ, giữ id cũ, cộng mọi màn trong `MODULES` (id `man:<phân hệ>/<slug>`) và lệnh lập chứng từ (id `moi:<phân hệ>/<slug>`, tên "Lập …"). Lọc ẩn như Ctrl K. Gói Free bỏ màn ngoài gói, gói khác giữ kèm ổ khoá. Tối đa 8 mục (`TOI_DA_THAO_TAC`). Gói Free có 57 mục, gói Plus có 171 mục (29 mục khoá).
- `src/app/TuyChinhThaoTac.tsx` (mới): hộp cùng kiểu Ctrl K. Ô tìm gõ không dấu, phím lên xuống, Enter hoặc Space để tích. Hàng Đã chọn kéo thả đổi thứ tự, có nút x. Chân hộp có Khôi phục mặc định, Huỷ, Lưu.
- `src/app/SidebarFlyout.tsx`: nút Tuỳ chỉnh ở bảng nổi Thao tác nhanh mở hộp thay vì chuyển màn.
- `src/modules/thao-tac-nhanh/ThaoTacNhanhScreen.tsx`: route `/app/thao-tac-nhanh/danh-sach` giữ lại, chỉ hiện các thao tác đang chọn và nút Tuỳ chỉnh mở hộp.
- `src/ui/mobile/MTrangChu.tsx`, khối tấm Tuỳ chỉnh: tấm toàn màn, cùng dữ liệu với web, đổi thứ tự bằng nút lên xuống.
- `src/ui/generic/VoucherScreen.tsx`, khối `dc-tabs`: bỏ số đếm cạnh Xuất điều chỉnh, Nhập điều chỉnh. Xoá rule CSS `.seg.dc-tabs .dc-dem`.
- Nút bật tắt toàn app (QD64): bộ CSS T276 thêm lớp chung `input.bat-tat`, có trạng thái khoá. 36 ô tích tuỳ chọn trong 16 file thêm `className="bat-tat"`, không đổi logic. Ô chọn dòng, lọc nhiều giá trị, chọn hàng loạt giữ ô vuông.
- `src/styles/app.css`: mục T280 cuối file cho hộp và tấm điện thoại.

## Đã kiểm

- `npm run typecheck`, `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh` với vite cổng 5181: in `Không có lỗi.`
- Ảnh: hộp gói Plus có dòng khoá, hộp gói Free, hộp đủ 8 mục, tấm điện thoại 390px dưới 8 mục và đủ 8 mục, tab Nhập điều chỉnh, danh mục CCDC, Cấu hình kế toán.
- Vòng sửa 1: tấm điện thoại có icon kính lúp không có cỡ, nút Huỷ, Lưu bị bóp. Đã sửa, chụp lại.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- QD64: ô tích tuỳ chọn dùng nút bật tắt, ô chọn nhiều mục giữ ô vuông.
