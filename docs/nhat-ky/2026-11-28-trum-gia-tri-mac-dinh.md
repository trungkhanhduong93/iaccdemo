# Giá trị mặc định chứng từ Pro theo cửa hàng (T955)

- Ngày: 28/11/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity (3 worker) viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/generic/giaTriMacDinh.ts` (mới): kho ô chọn được theo mã màn (`TRUONG_MAC_DINH`, thí điểm `4.1.1`), đọc, lưu giá trị theo cửa hàng (`iacc-gt-mac-dinh:<đơn vị>/<mã>`), danh sách ô đã chọn chung cả công ty (`iacc-gt-mac-dinh-o:<đơn vị>/<mã>`), `macDinhCuaHang` chỉ trả ô đang chọn, `duocSuaMacDinh` (owner, ktt).
- `src/ui/generic/HopGiaTriMacDinh.tsx` (mới): hộp giữa màn, trái menu cửa hàng kèm số ô đã đặt, phải hai thẻ Đầu phiếu, Dòng chi tiết; nút Thêm ô, X gỡ ô; chép sang cửa hàng khác (kho đổi theo vị trí kho của cửa hàng nhận); KTV chỉ xem có băng vàng.
- `src/ui/generic/ChungTuForm.tsx`: nút vuông Giá trị mặc định cạnh nút Tuỳ chỉnh giao diện (gói Pro, màn có trong `TRUONG_MAC_DINH`), chấm cam khi cửa hàng đã đặt; phiếu mới không `traTu` tự điền Nhà cung cấp, Kho nhập, Hình thức thanh toán, Diễn giải, Người giao. Khoản mục chỉ đưa ra chọn khi phiếu có cột Khoản mục (dòng tiền), phiếu mua không có.
- `src/ui/generic/BangSua.tsx`: prop `macDinhDong` cho dòng mới (kho, thuế suất khi hàng không có thuế suất, khoản mục).
- `src/styles/app.css`: mục cuối "Hộp Giá trị mặc định chứng từ (T955)", lớp `gtmd-`.
- Sửa sau QA: đang xem Tất cả cửa hàng, chọn cửa hàng trên màn "Chọn cửa hàng lập chứng từ" thì đọc lại mặc định của cửa hàng đó và điền vào phiếu (`apMacDinhCn` trong `ChungTuForm.tsx`, `macDinhDong` tính lại theo `md`).
- Mẫu duyệt: artifact 9fWCmd9NWi64QrKz9HvXAi, bản chép ở `backup/mau-T955-hop.dc.html` (không lên git).

## Đã kiểm

- `npm run typecheck`, `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_van.py src/ui/generic/HopGiaTriMacDinh.tsx`: Sạch.
- `python tools/kiem_tra.py --nhanh`: đỏ sẵn trên main, không do T955. Mục T870 crash (từ T923 Thẻ kho phải chọn Kho, Mặt hàng). Bỏ riêng T870 thì còn 8 lỗi, so với bản gốc 2fb6db16 giống hệt. Ghi thành T957.
- Worker chạy Playwright trên `#/app/mua-hang/4-1-1/moi`: gói Pro KTT tự điền đúng, phiếu cũ không đổi, gói Standard không có nút, KTV chỉ xem, Huỷ giữ danh sách ô cũ, 0 pageerror.

## Dở dang, việc tiếp theo

- Không. Màn khác muốn có Giá trị mặc định thì thêm mã màn và kho ô vào `TRUONG_MAC_DINH`, nối thêm ô mới ở `ChungTuForm.tsx`.

## Bẫy, quyết định mới

- Không ghi QD mới. Trum chốt trong phiên: chỉ điền ô trống, chỉ phiếu mới (sao chép, kế thừa không điền), cửa hàng chưa đặt thì không điền, danh sách ô chung công ty.
