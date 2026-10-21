# Hoàn thiện phiếu mua điện thoại theo canvas, bỏ chip Nợ (T601, T602)

- Ngày: 21/10/2026
- Người: Trum. Agent: Claude Code điều phối, 3 Antigravity (Gemini 3.8 Flash High) viết code song song
- Trạng thái cuối phiên: Xong

## Đã làm

- Spec `backup/spec-T601.md`. Khung canvas tải về `backup/canvas-T600/project/*.dc.html`. Mỗi anti nộp bảng so ý: `backup/T601-A-bang.md`, `backup/T601-B-bang.md`, `backup/T601-C-bang.md`. Bảng B, C không còn ý "Chưa làm".
- Anti A, `src/ui/mobile/MXemPhieu.tsx`: tab ghi "Hạch toán", không kèm số cặp. Thẻ bút toán ghi "Giá trị hàng nhập kho" và "Thuế GTGT được khấu trừ". Màn xem bỏ ô tìm hàng. Dòng Đã trả và 3 dòng giữa khối Tổng cộng bỏ chữ "đ". Tham chiếu dùng mũi tên svg. Kho mặc định lấy kho đầu của cửa hàng trong phiếu, thay chữ "Kho hàng".
- Anti A, `src/ui/mobile/MNghiepVu.tsx` (T602): bỏ chip "Nợ 138,2 tr" ở dòng Mua hàng, xoá CSS `.m-t498-nv-badge-no`.
- Anti B, `MLapPhieu.tsx` (các sheet thanh toán ngay, chọn quỹ, chọn và thêm nhà cung cấp) và `MDtThuChiLap.tsx`: chỉnh theo khung TTNgay1–3, Ncc1–2. Lưu phiếu chi trả nhà cung cấp xong thì phiếu mua ghi `_httt: 'congno'` cùng lần trả mới trong `_dsTt`. Dải điền sẵn in đậm số phiếu mua.
- Anti C, `MLapPhieu.tsx` (thẻ đầu, form, thẻ hàng lưới 3 cột, sheet chọn hàng, khối Tổng cộng, chân): chỉnh theo khung Sua, ThemDong1, ThemDong2. Nút đổi % hoặc đ của giảm giá dòng thành lớp `m-t601-btn-kieu-giam`.
- `src/styles/app.css`: thêm mục T601-A, T601-B, T601-C ở cuối file.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong.
- `python tools/kiem_tra.py --nhanh` (cổng 5182, `KIEM_TRA_URL=http://localhost:5182/`): `Không có lỗi.`
- `python tools/kiem_van.py` cho 4 file tsx đã sửa: 0 ĐỎ.
- Lớp `m-t60x-` dùng trong tsx đều có CSS, trừ `m-t601-btn-kieu-giam`: lớp này chỉ dùng style inline.
- Coordinator chưa so bằng mắt từng khung. Anti A, C báo đã tự xem ở khổ 390×844.

## Dở dang, việc tiếp theo

- Không. Trum xem `?goi=PR#/app/mua-hang/4-1-1` (phiếu MH2610-0022) và `?goi=F` ở khổ 390×844.
- Còn 39 lớp `m-t600-*` trong `app.css` không còn chỗ nào dùng, do Anti C thay lớp mới. Nên dọn ở một việc riêng.
- Thẻ hàng dùng `key={d.id ?? originalIdx}`. Dòng thêm mới có id. Dòng của phiếu cũ không có id thì vẫn dùng số thứ tự (T540 chưa xong hẳn).
- Code tsx mới còn mã màu viết thẳng trùng biến `:root` (`#0560a6`, `#6b7280`…), chủ yếu ở svg.
- Cổng 5180 do bản `D:\IACC-CLOUD\Web` giữ, nên phiên này chạy dev ở 5182.
- Lúc 22:33, một phiên khác commit dở dang T601 ngay trong thư mục này (`3e94b8c`, chưa push). Phiên này làm tiếp trên commit đó.

## Bẫy, quyết định mới

- Không.
