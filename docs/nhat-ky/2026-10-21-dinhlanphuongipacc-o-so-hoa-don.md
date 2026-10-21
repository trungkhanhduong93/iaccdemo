# Ràng buộc ô Số hoá đơn, Ký hiệu, cột mã phiếu mua hàng (T597)

- Ngày: 21/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/format.ts`: thêm `chuanSoHd` (chỉ giữ chữ số) và `chuanKyHieuHd` (viết hoa, chỉ giữ chữ A-Z và số, tối đa 7 ký tự).
- `src/ui/generic/ChungTuForm.tsx`: ô Số hoá đơn, Ký hiệu ở cột thông tin hoá đơn và ở tab Hoá đơn dùng hai hàm trên; Số hoá đơn mở bàn phím số. Form này dùng chung nên phiếu bán hàng có hoá đơn cũng theo luật này.
- `src/ui/mobile/MLapPhieu.tsx`: hai ô tương ứng trên điện thoại dùng cùng hai hàm.
- `src/ui/ChonDanhMuc.tsx`: ô tìm của cột mã (`chiMa`, vd cột Mã hàng) tự viết hoa chữ gõ vào. Mã tạo mới trong hộp Thêm đã viết hoa từ trước.
- Mở rộng cho mọi màn: `src/ui/generic/CatalogScreen.tsx` ô `ma` của form danh mục sinh tự động (mọi danh mục, web và điện thoại qua `MFormDm.tsx`) tự viết hoa; `src/modules/ccdc/the-phan-bo.tsx` cột Mã dòng mục chi phí, TSCĐ viết hoa; `src/ui/mobile/MDtThuChiLap.tsx` ô Khoản mục chi phí viết hoa.
- Ô Mã số thuế, số tài khoản, ô tìm kiếm chung không đổi.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Thử hàm: "0.075,133a" ra "0075133"; "1c26tmm-99" ra "1C26TMM".
- Chưa bấm thử trên trình duyệt.

## Dở dang, việc tiếp theo

- Không. Ký hiệu chưa báo lỗi khi gõ thiếu 7 ký tự, chỉ chặn quá 7. Cần báo lỗi khi lưu thì mở việc mới.

## Bẫy, quyết định mới

- Không.
