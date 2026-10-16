# Gõ số kiểu Việt Nam ngay khi gõ, đánh số thẻ chi phí, thẻ dư đầu kỳ mẫu (T284)

- Ngày: 16/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `ui/OSoGo.tsx` (mới): ô gõ số kiểu Việt Nam, chèn chấm ngăn nghìn ngay khi gõ, phẩy thập phân, giữ vị trí con trỏ, báo số mỗi lần gõ.
- `ui/generic/BangSua.tsx`: ô `OSo` của bảng chi tiết phiếu (số lượng, đơn giá, thành tiền, CK, thuế) dùng `OSoGo`; Tổng tiền đổi ngay khi gõ. Ô không còn nhận dấu trừ.
- `kho/BangSanXuat.tsx`: ô `OSo` dùng `OSoGo`.
- `ui/format.ts`: `soQT`, `nhapSoQT` hiện, gõ kiểu Việt Nam (1.234,5); dữ liệu thẻ vẫn lưu dạng chuẩn (1234.5). Thẻ chi phí, form Ghi tăng đổi theo.
- `ccdc/the-phan-bo.tsx`: thẻ dư đầu kỳ đổi chỗ cột Số tháng phân bổ lên trước Số tháng đã phân bổ. Menu Thêm theo loại ghi Ghi tăng đầu kỳ (`bien.menu`). Thông tin mua dạng chỉ xem như đầu phiếu Xuất bán POS khi đang xem hoặc thẻ ghi tăng, số chứng từ bấm mở chứng từ gốc (`ve` nhận `xem`).
- `ccdc/the-phan-bo.tsx`, `GhiTangHangLoat.tsx`: đánh số thẻ `soTheKeTiep`: TPB{YY}{MM}-{0000}, dư đầu kỳ TPBDK{YY}{MM}-{0000}, tháng theo ngày ghi tăng, số nối tiếp cùng tiền tố, cùng tháng; đổi ngày ghi tăng thẻ mới thì đánh lại. Form hàng loạt nhận `rows` (`types.ts`, `CatalogScreen.tsx`).
- `he-thong/HeThong.tsx`, `ui/mobile/MHeThong.tsx`: Đánh số chứng từ thêm 2 dòng thẻ chi phí.
- `ccdc/index.ts`: 3 thẻ dư đầu kỳ mẫu TPBDK2512-0001 đến 0003 (31/12/2025, phân bổ tiếp từ 01/01/2026, có phần đã phân bổ, Thông tin mua gõ tay).
- `danh-muc/truong-dm.ts`, `CatalogScreen.tsx`: `bien.menu`, `ve(v, doi, xem)`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: Không có lỗi. `kiem_van --loai giao-dien` các file đã sửa: sạch.
- Thử tay: phiếu chi mới gõ 3000000 hiện 3.000.000, Tổng tiền 3.000.000 ngay; thẻ dư đầu kỳ gõ 2000000,5 hiện 2.000.000,5, dòng Cộng đúng, thứ tự cột đúng; menu Ghi tăng đầu kỳ; Thông tin mua TPB2610-0011 dạng chỉ xem, PC2610-0261 bấm được; thẻ dư đầu kỳ mới TPBDK2512-0004, form Ghi tăng TPB2610-0012 đến 0015; 3 thẻ dư đầu kỳ mẫu, đã phân bổ khớp tính tay.
- `python tools/xuat_bao_cao_he_thong.py`: không chạy được trên máy này (thiếu thư mục `Present/tools` ngoài repo), Excel chưa làm mới.

## Dở dang, việc tiếp theo

- Tiền tố TPBDK do agent chọn, người dùng có thể đổi.
- Màn Đánh số chứng từ chỉ để xem; cho sửa (tiền tố, chi nhánh, ngày tháng, số chữ số, hậu tố) là việc lớn, cần Trum chốt.

## Bẫy, quyết định mới

- Không.
