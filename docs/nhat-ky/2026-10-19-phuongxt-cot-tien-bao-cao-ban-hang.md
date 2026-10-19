# Báo cáo bán hàng đủ cột tiền theo mẫu iFaster (T453 đến T457)

- Ngày: 19/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `ban-hang/bao-cao.ts`: ba báo cáo 3-2-6 Bán hàng theo ngày, 3-2-7 Tổng hợp bán hàng, 3-2-8 Chi tiết bán hàng dùng chung bộ cột tiền `COT_TIEN`: Thành tiền, Giảm giá, Chiết khấu, Phí dịch vụ, Doanh thu tính thuế, Thuế GTGT, Giảm thuế GTGT, Phiếu giảm giá, Phí vận chuyển, Tổng tiền.
- Công thức theo mẫu iFaster PhuongXT gửi: Doanh thu tính thuế = Thành tiền − Giảm giá − Chiết khấu + Phí dịch vụ; Tổng tiền = Doanh thu tính thuế + Thuế GTGT − Giảm thuế GTGT − Phiếu giảm giá + Phí vận chuyển.
- Chiết khấu, Phí dịch vụ, Phí vận chuyển lấy từ dòng món của đơn POS (T106), dữ liệu mẫu đang bằng 0; Phiếu giảm giá chưa có trong dữ liệu FABi mẫu, để 0.
- T454: Tổng hợp bán hàng bỏ cột Giá vốn, Lãi gộp theo PhuongXT; bỏ luôn phần chia giá vốn cho món (`heSoGv`) trong `bao-cao.ts` vì không báo cáo nào dùng.
- T455: Chi tiết bán hàng thêm cột Kênh bán (`kenh` của chứng từ Xuất bán POS). `ui/bao-cao/tuyChinhBC.ts` có `TC_MAC_DINH`: tuỳ chỉnh sẵn khi người dùng chưa lưu, 3.2.8 là `{ nhom: ['kenh'], xemNhom: 'chiTiet' }`; Về mặc định cũng quay lại đây. `docTuyChinh` trả bản sao vì `luuRongCotBC` sửa thẳng object.
- T456: đổi tên 4-2-7 thành Bảng kê chi tiết mua hàng (`mua-hang/index.ts`, `quy-trinh.ts`), 3-2-8 thành Bảng kê chi tiết bán hàng (`ban-hang/index.ts`); nhãn trong `tools/kiem_tra.py` đổi theo.
- T457: `bao-cao/loc-nguon.ts` thêm khoá `locKenh`, `LOC_KENH` đứng đầu `LOC_BAN`, `quaLocKenh`; `dongBan` lọc theo kênh; Bán hàng theo ngày đếm Số hoá đơn theo phiếu của kênh đang lọc. 3-2-8 thêm `kenh` vào `nhomDuoc`.
- Đổi tên theo từ đang dùng trong app: Giảm giá VAT thành Giảm thuế GTGT, Phiếu GG thành Phiếu giảm giá, Phí ship thành Phí vận chuyển. Thuế GTGT, Giảm thuế GTGT vẫn ẩn hiện theo phương pháp GTGT (T450).

## Đã kiểm

- `npm run typecheck`, `npm run build`, `python tools/kiem_tra.py --nhanh`: không lỗi.
- T455 trên trình duyệt: mở 3-2-8 có nút Tổng hợp, Chi tiết (đang ở Chi tiết), nhóm Kênh bán: Tại quán; bấm Tổng hợp ra Tại quán, Mang về, App giao đồ ăn, cộng khớp Tổng cộng. 3-2-8 phân trang 100 dòng (`phanTrang: 100`), nên trang đầu ở Chi tiết chỉ thấy nhóm Tại quán.
- T456, T457 trên trình duyệt: Trung tâm báo cáo hiện tên mới. Bán hàng theo ngày lọc App giao đồ ăn: Thành tiền 286.292.200, Tổng tiền 277.048.683, khớp nhóm App giao đồ ăn ở 3-2-8; Số hoá đơn 1.716. Bài T238 trong `kiem_tra.py` (100 dòng đầu 3-2-8) chạy riêng: không lỗi.
- Trình duyệt gói Free tháng 10, % doanh thu: ba báo cáo cùng Thành tiền 2.861.830.200, Doanh thu tính thuế 2.786.386.000, Giảm thuế GTGT 16.718.299, Tổng tiền 2.769.667.701. Khấu trừ: hiện Thuế GTGT 229.598.205, Tổng tiền 3.015.984.205, không có cột Giảm thuế GTGT.

## Dở dang, việc tiếp theo

- Dữ liệu mẫu chưa có số Chiết khấu, Phí dịch vụ, Phiếu giảm giá, Phí vận chuyển nên các cột này trống. Muốn có số thì phải sinh trong `ChungTuBanHang.tsx` (`dongMonGiam`, `dongMonDon`) mà vẫn giữ doanh thu ngày khớp `DAILY`.

## Bẫy, quyết định mới

- Không.
