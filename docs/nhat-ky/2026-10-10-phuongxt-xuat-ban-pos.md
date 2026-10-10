# Chứng từ Xuất bán POS theo form IACC (T102)

- Ngày: 10/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `ban-hang/ChungTuBanHang.tsx` `ChiTiet`: vẽ lại theo khung form chung (`FormToanMan`): tên phiếu Xuất bán POS, giữa thanh đầu Chi tiết phiếu, dưới tên trạng thái (gói Free ghi Đã đồng bộ), nguồn FABi, chi nhánh. Ghi chú phiếu đồng bộ từ FABi chỉ xem.
- Đầu phiếu 3 cột ô chỉ xem: Khách hàng, Cửa hàng (kèm mã), Kênh bán hàng; Phương thức thanh toán, Thời gian xuất, Số đơn POS; Ngày, Số chứng từ, Diễn giải.
- Bảng Hàng bán: Mã hàng, Hàng hoá, ĐVT, Số lượng, Đơn giá, Thành tiền, Giảm giá (%), Tiền giảm giá, Ghi chú, Thuế suất, Tiền thuế, Tổng tiền. `dongMonGiam`: món khuyến mãi (mẫu 3 món, 5% hoặc 10%) giữ giá danh mục, tính lại số lượng để doanh thu sau giảm sát doanh thu món; tổng các dòng bằng doanh thu ngày.
- Khối thanh toán theo iFaster: Thành tiền, Tiền giảm giá, Chiết khấu hoá đơn, Phí dịch vụ, Giảm thuế GTGT, Phiếu giảm giá, Phí vận chuyển (mẫu bằng 0), Thuế GTGT, Tổng tiền (bằng tổng ở danh sách).
- Thanh đáy: In, Phát hành HĐĐT (từ gói Plus), Đóng; bỏ nút Lưu.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- Gói Plus, BH2610-TD-07: Thành tiền 20.140.100, giảm 528.100, sau giảm 19.612.000 bằng doanh thu ngày; Tổng tiền 21.228.029 bằng danh sách. Đơn giá đúng giá món, tỷ lệ 10%, 5%.

## Dở dang, việc tiếp theo

- T103: tiền thuế cộng trên dòng lệch thuế GTGT của ngày trong dữ liệu mẫu (có từ trước T102).

## Bẫy, quyết định mới

- Không.
