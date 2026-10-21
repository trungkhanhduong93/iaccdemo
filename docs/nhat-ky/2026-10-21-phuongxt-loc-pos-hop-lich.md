# Bộ lọc Xuất bán POS điện thoại, hộp lịch chọn khoảng ngày (T570, T571)

- Ngày: 21/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- T570: `src/ui/mobile/MXuatBanPos.tsx` thêm ô tìm (số, ghi chú, tên món), nút lọc Khách hàng, Thanh toán, Hàng hoá (có ô tìm), Tồn kho, nút Xoá lọc. Lọc giống `DanhSach` trong `ChungTuBanHang.tsx`, dùng `PTTT`, `ptttCua`, `dongCuaPhieu`.
- T571: tạo `src/ui/mobile/MChonKhoangNgay.tsx`, hộp lịch giữa màn: kỳ nhanh Tháng trước, Tháng này, Tuần trước, Tuần này; cột số tuần ISO; bấm ngày đầu rồi ngày cuối; Huỷ, Áp dụng. Prop `nut` thay nút mặc định bằng dòng của tấm Bộ lọc.
- T571: dùng hộp lịch ở `MXuatBanPos.tsx`, dòng Thời gian của `MLoc.tsx` (bỏ trang con Thời gian), dòng Kỳ báo cáo của `MBaoCaoLoc.tsx` (bỏ trang con chọn kỳ).
- CSS: mục `Điện thoại: hộp lịch chọn khoảng ngày... (T571)` cuối `src/styles/app.css`, hộp rộng tối đa 320px.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py` cho 4 file tsx đã sửa: Sạch.
- Trình duyệt 375x812: POS lọc Tiền mặt 3850 → 1308 đơn, thêm PHO02 còn 286; Thu chi chọn Tuần trước còn 36 chứng từ 28/09–04/10; Sổ quỹ tiền mặt chọn 05/09–15/09 số liệu đổi theo.

## Dở dang, việc tiếp theo

- Không.
- `MLoc` không còn chọn "Tất cả" thời gian, "Hôm nay" chọn bằng bấm một ngày rồi Áp dụng. Cần lại thì thêm nút vào `KY_NHANH` trong `MChonKhoangNgay.tsx`.
- Máy PhuongXT còn sửa dở `MChon.tsx` và mục CSS "Bảng chọn MChon có ô tìm..." cuối `app.css`, không thuộc việc này, chưa commit.

## Bẫy, quyết định mới

- Không.
