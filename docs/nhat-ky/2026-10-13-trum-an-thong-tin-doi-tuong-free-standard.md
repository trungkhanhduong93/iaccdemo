# Ẩn thông tin số thẻ, công nợ ở đối tượng và hạn thanh toán với gói Free, Standard (T180)

- Ngày: 13/10/2026
- Người: Trum, agent: Anti A (Antigravity Windows)
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/danh-muc/truong-dm.ts`: Thêm `goi: ['PL', 'PR']` cho ô `soThe` (khối Ngân hàng) và toàn bộ khối `Công nợ` (Bảng giá, Điều khoản thanh toán, TK công nợ) ở panel Thêm/Sửa Đối tượng (1.5).
- `src/modules/danh-muc/index.ts`: Ẩn cột `dktt` (Điều khoản thanh toán) và `tkCn` (TK công nợ) trong bảng danh mục Đối tượng (1.5) với gói Free (`F`) và Standard (`S`).
- `src/ui/generic/ChungTuForm.tsx`: Thêm điều kiện `coHanTt` (`s.goi !== 'F' && s.goi !== 'S'`) để ẩn ô `hanTt` (Hạn thanh toán) ở đầu form chứng từ và trong cấu hình tuỳ chỉnh trường đầu phiếu với gói Free, Standard.
- `src/ui/generic/VoucherScreen.tsx`: Ẩn cột `hanTt` (Hạn thanh toán) trong danh sách chứng từ và trong hộp tuỳ chỉnh cột với gói Free, Standard.
- `docs/QUYET-DINH.md`: Ghi nhận QD56 về việc ẩn số thẻ, khối công nợ và hạn thanh toán ở gói Free, Standard.
- `docs/TIEN-DO.md`: Chuyển T180 xuống bảng Đã xong.

## Đã kiểm

- `npm run typecheck`: chạy xong, không có lỗi.
- `npm run build`: chạy xong, thành công.
- `python tools/kiem_tra.py --nhanh`: đã kiểm 183 lượt mở màn, in "Không có lỗi."
- `playwright`: kiểm tra thực tế trên Chrome ở 3 gói (Free, Standard, Plus):
  + Gói Free: bảng danh mục không có cột Điều khoản thanh toán; panel Thêm đối tượng không có ô Số thẻ, khối Công nợ, Bảng giá.
  + Gói Standard: bảng danh mục không có cột Điều khoản thanh toán; panel Thêm đối tượng không có ô Số thẻ, khối Công nợ; form chứng từ mua hàng không có ô Hạn thanh toán; danh sách chứng từ không có cột Hạn thanh toán.
  + Gói Plus: bảng danh mục có cột Điều khoản thanh toán; panel Thêm đối tượng có ô Số thẻ, khối Công nợ; form chứng từ có ô Hạn thanh toán khi chọn hình thức Chưa thanh toán.
- `python tools/kiem_van.py`: 0 ĐỎ trên toàn bộ các file đã sửa.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Đã ghi nhận QD56 vào `docs/QUYET-DINH.md`.
