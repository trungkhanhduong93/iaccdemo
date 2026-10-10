# Tiền trước thuế, giá trị nhập kho trên từng dòng phiếu mua (T84)

- Ngày: 10/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `BangSua.tsx`: tham số mới `coNhapKho`. Bật thì dòng có cột Tiền trước thuế (ngay trước Thuế suất), rồi Tổng tiền (Tiền trước thuế cộng Tiền thuế) và Giá trị nhập kho ở cuối dòng. Tiền trước thuế và Giá trị nhập kho bằng Thành tiền trừ Tiền CK. Có cả khi xem lẫn khi sửa.
- `ChungTuForm.tsx` khối tổng phiếu mua (`truocThue`) chỉ còn Tổng tiền, vì các số khác đã có trên dòng. Đã thử khối tổng đủ sáu dòng trước, PhuongXT thấy tốn chỗ. Dòng Tổng cộng cộng cả hai cột. Cách tính giống khối tổng cuối phiếu, theo ý PhuongXT.
- `ChungTuForm.tsx`, `VoucherScreen.tsx`: bật cột cho phiếu mua có giá trị nhập kho (`bo.tongNhap`), ở form và khung chi tiết dưới danh sách. Phiếu trả lại hàng mua, chi phí mua hàng không có.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- Trên trình duyệt, gói Free, Mua hàng 4.1.1: khung chi tiết danh sách có hai cột, tổng đúng. Form thêm mới gõ % CK 10 thì thuế 8% thì dòng ra Tiền trước thuế 1.008.000, Tiền thuế 80.640, Tổng tiền 1.088.640, Giá trị nhập kho 1.008.000; khối tổng ra Tổng tiền 1.088.640, khớp dòng.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
