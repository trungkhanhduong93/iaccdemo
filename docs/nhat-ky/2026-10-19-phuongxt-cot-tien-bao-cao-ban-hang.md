# Báo cáo bán hàng đủ cột tiền theo mẫu iFaster (T453)

- Ngày: 19/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `ban-hang/bao-cao.ts`: ba báo cáo 3-2-6 Bán hàng theo ngày, 3-2-7 Tổng hợp bán hàng, 3-2-8 Chi tiết bán hàng dùng chung bộ cột tiền `COT_TIEN`: Thành tiền, Giảm giá, Chiết khấu, Phí dịch vụ, Doanh thu tính thuế, Thuế GTGT, Giảm thuế GTGT, Phiếu giảm giá, Phí vận chuyển, Tổng tiền. Tổng hợp giữ thêm Giá vốn, Lãi gộp (lãi gộp tính trên doanh thu tính thuế).
- Công thức theo mẫu iFaster PhuongXT gửi: Doanh thu tính thuế = Thành tiền − Giảm giá − Chiết khấu + Phí dịch vụ; Tổng tiền = Doanh thu tính thuế + Thuế GTGT − Giảm thuế GTGT − Phiếu giảm giá + Phí vận chuyển.
- Chiết khấu, Phí dịch vụ, Phí vận chuyển lấy từ dòng món của đơn POS (T106), dữ liệu mẫu đang bằng 0; Phiếu giảm giá chưa có trong dữ liệu FABi mẫu, để 0.
- Đổi tên theo từ đang dùng trong app: Giảm giá VAT thành Giảm thuế GTGT, Phiếu GG thành Phiếu giảm giá, Phí ship thành Phí vận chuyển. Thuế GTGT, Giảm thuế GTGT vẫn ẩn hiện theo phương pháp GTGT (T450).

## Đã kiểm

- `npm run typecheck`, `npm run build`, `python tools/kiem_tra.py --nhanh`: không lỗi.
- Trình duyệt gói Free tháng 10, % doanh thu: ba báo cáo cùng Thành tiền 2.861.830.200, Doanh thu tính thuế 2.786.386.000, Giảm thuế GTGT 16.718.299, Tổng tiền 2.769.667.701. Khấu trừ: hiện Thuế GTGT 229.598.205, Tổng tiền 3.015.984.205, không có cột Giảm thuế GTGT.

## Dở dang, việc tiếp theo

- Dữ liệu mẫu chưa có số Chiết khấu, Phí dịch vụ, Phiếu giảm giá, Phí vận chuyển nên các cột này trống. Muốn có số thì phải sinh trong `ChungTuBanHang.tsx` (`dongMonGiam`, `dongMonDon`) mà vẫn giữ doanh thu ngày khớp `DAILY`.

## Bẫy, quyết định mới

- Không.
