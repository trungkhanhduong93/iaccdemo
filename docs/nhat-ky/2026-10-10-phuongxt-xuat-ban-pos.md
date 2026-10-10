# Chứng từ Xuất bán POS theo form IACC; cố định đầu phiếu, dải tổng (T102, T103, T104, T105, T106)

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
- T106: bảng Hàng bán thêm % CK, Tiền CK, % Phí dịch vụ, Phí dịch vụ, Giảm thuế GTGT, Phí vận chuyển (mẫu bằng 0), Doanh thu trước thuế (thành tiền − giảm − CK + phí dịch vụ + phí vận chuyển); bỏ cột Tổng tiền; dòng Tổng cộng cộng mọi cột tiền. Dải đáy chỉ Phiếu giảm giá, Tổng tiền.
- T106: form có nút Tuỳ chỉnh giao diện (`HopCotPhieu`, `COT_POS`); Giảm thuế GTGT, Phí vận chuyển ẩn sẵn (`AN_POS_MAC_DINH`), khoá `iacc-cot-phieu:ban-hang/3-1-1`. `HopCotPhieu` thêm tham số `macDinh` cho nút Khôi phục mặc định. Header: Khách hàng, Kênh bán hàng, Ghi chú (trước là Diễn giải).
- T103 `dongMonGiam(dt, vat)`: thuế từng món chỉnh cho tổng bằng thuế GTGT của ngày, phần lệch dồn vào món thuế lớn nhất.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- Gói Plus, BH2610-TD-07: Thành tiền 20.140.100, giảm 528.100, sau giảm 19.612.000 bằng doanh thu ngày; Tổng tiền 21.228.029 bằng danh sách. Đơn giá đúng giá món, tỷ lệ 10%, 5%.
- T104: gói Free, phiếu số YHLTJTAKD76Z: đầu phiếu 3, 2, 2 ô; tab Hàng bán; dải tổng ở đáy giữ nguyên khi cuộn, Tổng tiền 21.228.029.
- T105: phiếu mua mới 26 dòng, cuộn vùng bảng 400px: đầu phiếu, tiêu đề cột không dịch; dải Tổng tiền ở đáy. Phiếu uỷ nhiệm chi, phiếu kho, Xuất bán POS cùng bố cục.
- T106, T103: YHLTJTAKD76Z: 16 cột tiêu đề, 16 ô dòng Tổng cộng; Doanh thu trước thuế 19.612.000 + thuế 1.616.029 = 21.228.029 bằng Tổng tiền ở dải đáy. Panel tuỳ chỉnh: bật hai cột ẩn thì hiện, Khôi phục mặc định thì ẩn lại.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
