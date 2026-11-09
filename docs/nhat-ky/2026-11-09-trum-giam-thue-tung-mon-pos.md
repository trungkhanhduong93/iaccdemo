# Giảm thuế GTGT theo từng món ở Xuất bán POS (T780)

- Ngày: 09/11/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity code
- Trạng thái cuối phiên: Xong

## Đã làm

- `ChungTuBanHang.tsx`: thêm `giamThuePhieu(x)`, cộng `giamThueHang(dtTruocThue, ma)` của từng món trong phiếu. Danh sách phiếu, tổng phiếu, chia tiền thanh toán (`ttHkd`) và bảng chi tiết dùng hàm này thay `giamThueHkd(x.dt)`. Bảng chi tiết bỏ cách chia giảm thuế theo doanh thu, mỗi dòng tính theo món.
- `ChungTuBanHang.tsx`: bảng chi tiết POS có cột chỉ xem "Giảm thuế theo quy định", ẩn sẵn, bật ở hộp chọn cột. Cột chỉ có khi GTGT theo % doanh thu và Cấu hình kế toán bật giảm thuế.
- `bao-cao.ts`: báo cáo bán hàng tính giảm thuế theo mã hàng của dòng.
- `data.ts`: báo cáo doanh thu theo ngày cộng `giamThuePhieu`.
- `MXuatBanPos.tsx`: điện thoại tính như web.
- Ghi T781: hiệu lực nghị quyết đang so với ngày làm việc, chưa so ngày từng chứng từ.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `kiem_van.py ChungTuBanHang.tsx`: 0 ĐỎ, 3 VÀNG (chuỗi path SVG có sẵn, không phải chữ mới).
- Anti thử phiếu mẫu có BIA01 (seed `td-07/10/2026-117`): giảm cũ 606 đ, mới 24 đ, tổng dòng bằng giảm của phiếu.
- Chưa mở trình duyệt xem cột mới.

## Dở dang, việc tiếp theo

- Không.
- Máy đã lưu cột ẩn của bảng Hàng bán (khoá `iacc-cot-phieu:ban-hang/3-1-1`) thì cột mới hiện luôn, không ẩn sẵn.
- `VoucherScreen.tsx:225` và phiếu lập tay gói Plus trong danh sách (`hangTay`) không có món, vẫn tính trên tổng.

## Bẫy, quyết định mới

- Không.
