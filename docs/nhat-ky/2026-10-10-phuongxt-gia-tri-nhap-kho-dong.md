# Tiền trước thuế, giá trị nhập kho trên từng dòng phiếu mua (T84)

- Ngày: 10/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `BangSua.tsx`: tham số mới `coNhapKho`. Bật thì dòng có cột Tiền trước thuế (bằng Thành tiền, ngay trước Thuế suất) và Giá trị nhập kho (Thành tiền trừ Tiền CK, cuối dòng), cả khi xem lẫn khi sửa. Khối tổng phiếu mua đổi nhãn Tiền hàng thành Tiền trước thuế. Dòng Tổng cộng cộng cả hai cột. Cách tính giống khối tổng cuối phiếu, theo ý PhuongXT.
- `ChungTuForm.tsx`, `VoucherScreen.tsx`: bật cột cho phiếu mua có giá trị nhập kho (`bo.tongNhap`), ở form và khung chi tiết dưới danh sách. Phiếu trả lại hàng mua, chi phí mua hàng không có.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- Trên trình duyệt, gói Free, Mua hàng 4.1.1: khung chi tiết danh sách có hai cột, tổng đúng. Form thêm mới gõ % CK 10 thì dòng ra Tiền trước thuế 1.120.000, Giá trị nhập kho 1.008.000, khớp khối tổng.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
