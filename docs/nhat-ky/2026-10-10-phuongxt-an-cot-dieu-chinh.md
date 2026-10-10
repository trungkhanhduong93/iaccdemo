# Ẩn cột thuế, giá ở phiếu điều chỉnh (T131)

- Ngày: 10/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `ChungTuForm.tsx`: `anDc` ẩn cột `ts`, `thue` ở phiếu điều chỉnh; gói Free ẩn thêm `gia`, `tien`. Dải đáy chỉ còn Tổng tiền, gói Free bỏ hẳn. Tuỳ chỉnh giao diện không liệt kê các cột đã ẩn này.
- `VoucherScreen.tsx`: khung chi tiết dưới danh sách ẩn cùng các cột; gói Free bỏ cột Tổng tiền và dòng cộng tiền ở danh sách Điều chỉnh kho (PhuongXT chỉ nói chi tiết phiếu; ẩn thêm ở danh sách cho khớp, vì Free không hiện giá trị).

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Trên trình duyệt: XDC2609-0239 gói Free chỉ còn Mã hàng, Tên, ĐVT, Số lượng; gói Plus có thêm Đơn giá, Thành tiền, Tổng tiền 99.000, không cột thuế.
- `python tools/xuat_bao_cao_he_thong.py` không chạy được trên máy này (thiếu `../Present/tools/build_present`), chưa làm mới file Excel.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
