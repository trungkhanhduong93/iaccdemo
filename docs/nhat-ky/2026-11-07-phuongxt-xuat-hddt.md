# Xuất hoá đơn điện tử từ Bán hàng (T763)

- Ngày: 07/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/ban-hang/hddt.tsx` (mới): kiểu `CauHinhHddt`, `cauHinhHddt(s)`, thẻ `TheCauHinhHddt`, popup `HopXuatHddt`, `hdCua`, `tenHd`.
- `src/app/session.tsx`: thêm `hddt` theo đơn vị.
- `src/modules/he-thong/HeThong.tsx`: thẻ Hoá đơn điện tử ở Cấu hình kế toán gói Plus, Pro; lưới 2 cột nhà cung cấp, loại hoá đơn, tài khoản, mật khẩu, kiểm tra kết nối; ký hiệu từng cửa hàng; gửi email. Bỏ ô Hình thức theo ý PhuongXT, ký hiệu luôn bắt đầu bằng C.
- `src/ui/generic/ChungTuForm.tsx`: thêm prop `chanThem` (nút ở chân form lúc xem), `metaThem` (nhãn đầu form).
- `src/modules/ban-hang/ChungTuBanHang.tsx`: chi tiết chứng từ lập tay có nút Xuất hoá đơn điện tử, nhãn số hoá đơn sau khi phát hành; danh sách gói Plus có cột chọn, nút Xuất hoá đơn điện tử (n), cột Hoá đơn điện tử.
- Cuối `src/styles/app.css`: mục T763.
- `docs/QUYET-DINH.md`: QD102.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py src/modules/ban-hang/hddt.tsx`: sạch.
- `python tools/xuat_bao_cao_he_thong.py`: vẫn lỗi thiếu `build_present` trên máy PhuongXT, chưa làm mới file Excel.

## Dở dang, việc tiếp theo

- Chờ Trum duyệt QD102.
- Bản mẫu giả lập đã khai báo, kết nối HĐĐT; popup luôn vào màn phát hành. Phát hành xong ô Số hoá đơn, Ký hiệu, Ngày hoá đơn (và MST, địa chỉ khi xuất một chứng từ) đổi theo hoá đơn mới, PhuongXT chốt.
- Số hoá đơn, trạng thái đã xuất chỉ giữ trong phiên (qua `suaPhieu`), tải lại trang là mất, như các phiếu sửa khác.
- Màn 3.1.5 Xuất hoá đơn điện tử, điện thoại chưa dùng thiết lập mới.

## Bẫy, quyết định mới

- QD102 trong `docs/QUYET-DINH.md`.
