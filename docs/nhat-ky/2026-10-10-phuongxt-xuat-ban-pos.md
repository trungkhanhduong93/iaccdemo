# Chứng từ Xuất bán POS theo form IACC; cố định đầu phiếu, dải tổng (T102, T104, T105)

- Ngày: 10/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `ban-hang/ChungTuBanHang.tsx` `ChiTiet`: vẽ lại theo khung form chung (`FormToanMan`): tên phiếu Xuất bán POS, giữa thanh đầu Chi tiết phiếu, dưới tên trạng thái (gói Free ghi Đã đồng bộ), nguồn FABi, chi nhánh. Ghi chú phiếu đồng bộ từ FABi chỉ xem.
- Đầu phiếu 3 cột ô chỉ xem: Khách hàng, Cửa hàng (kèm mã), Kênh bán hàng; Phương thức thanh toán, Thời gian xuất, Số đơn POS; Ngày, Số chứng từ, Diễn giải.
- Bảng Hàng bán: Mã hàng, Hàng hoá, ĐVT, Số lượng, Đơn giá, Thành tiền, Giảm giá (%), Tiền giảm giá, Ghi chú, Thuế suất, Tiền thuế, Tổng tiền. `dongMonGiam`: món khuyến mãi (mẫu 3 món, 5% hoặc 10%) giữ giá danh mục, tính lại số lượng để doanh thu sau giảm sát doanh thu món; tổng các dòng bằng doanh thu ngày.
- Khối thanh toán theo iFaster: Thành tiền, Tiền giảm giá, Chiết khấu hoá đơn, Phí dịch vụ, Giảm thuế GTGT, Phiếu giảm giá, Phí vận chuyển (mẫu bằng 0), Thuế GTGT, Tổng tiền (bằng tổng ở danh sách).
- Thanh đáy: In, Phát hành HĐĐT (từ gói Plus), Đóng; bỏ nút Lưu.
- T104 `data/mock.ts` `soBH`: số chứng từ là số hoá đơn FABi, 12 ký tự chữ số viết hoa, cố định theo chi nhánh và ngày; Thu chi (`tien/data.ts`) dùng chung hàm nên khớp.
- T104 form: ghi chú một dòng chữ nhỏ (`.pos-nhac`); đầu phiếu bỏ Cửa hàng, Số đơn POS, Diễn giải sang cột trái; bỏ tab Thanh toán, Đơn POS gốc, cột Ghi chú; khối tổng chuyển thành dải `day` cố định ở đáy form (`.pos-day`), khoản bằng 0 hiện mờ.
- T105 `ChungTuForm.tsx`: thân form lớp `ct-co-dinh`, thẻ tab `ct-than-card`, nội dung tab trong `ct-than` (vùng duy nhất cuộn; `.tbl-wrap` bên trong không tự cuộn nên tiêu đề cột dính theo `.ct-than`). Khối tổng trong thẻ bỏ, thay bằng `DaiTong` ở dải `day` (công tắc Khối tổng tiền vẫn bật tắt). Xuất bán POS dùng chung `DaiTong` và cùng bố cục.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- Gói Plus, BH2610-TD-07: Thành tiền 20.140.100, giảm 528.100, sau giảm 19.612.000 bằng doanh thu ngày; Tổng tiền 21.228.029 bằng danh sách. Đơn giá đúng giá món, tỷ lệ 10%, 5%.
- T104: gói Free, phiếu số YHLTJTAKD76Z: đầu phiếu 3, 2, 2 ô; tab Hàng bán; dải tổng ở đáy giữ nguyên khi cuộn, Tổng tiền 21.228.029.
- T105: phiếu mua mới 26 dòng, cuộn vùng bảng 400px: đầu phiếu, tiêu đề cột không dịch; dải Tổng tiền ở đáy. Phiếu uỷ nhiệm chi, phiếu kho, Xuất bán POS cùng bố cục.

## Dở dang, việc tiếp theo

- T103: tiền thuế cộng trên dòng lệch thuế GTGT của ngày trong dữ liệu mẫu (có từ trước T102).

## Bẫy, quyết định mới

- Không.
