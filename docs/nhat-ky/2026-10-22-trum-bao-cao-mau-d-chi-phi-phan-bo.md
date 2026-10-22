# Báo cáo điện thoại theo mẫu D, Xuất nhập tồn theo gói, danh sách Chi phí phân bổ (T624, T625)

- Ngày: 22/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- T624: tạo `src/ui/mobile/MBaoCaoChiTietMauD.tsx` dùng cho 3.2.8 Bảng kê chi tiết bán hàng và 5.2.10 Chi tiết nhập kho. Khuôn theo Bảng kê chi tiết mua hàng; 3.2.8 giữ 4 ô thẻ tổng.
- T624: tạo `src/ui/mobile/MBaoCaoTongHopMauD.tsx` dùng cho 4.2.3 Công nợ nhà cung cấp, 5.2.9 Tổng hợp nhập kho, 5.2.3 Báo cáo xuất nhập tồn. Khuôn theo Tổng hợp bán hàng (T606). Công nợ NCC giữ nút Thanh toán.
- T624: nối điều hướng ở `MBaoCaoDong.tsx`, `MSoBaoCao.tsx` (laMauD).
- T624: 5.2.3 gói Free chỉ hiện số lượng, không dòng Tổng cộng. Áp ở web (`XuatNhapTon.tsx`), bản in, điện thoại dạng dòng và dạng bảng (`MToGiay.tsx` COLS_523_FREE). Gói S, PL, PR: số lượng trên, tiền dưới.
- T624: tạm bỏ 5.2.2 Tổng hợp nhập xuất tồn. Gỡ ở `SidebarFlyout.tsx` (2 chỗ), quy trình Kho, thêm vào `DA_BO` của `plan.ts`. Code báo cáo giữ nguyên.
- T625: `MDsChungTuChuan.tsx` thêm prop `nhomTheoNgay` (mặc định true). `MCcdc.tsx` tắt nhóm ngày. Thẻ trái: số thẻ trên, diễn giải dưới. Thẻ phải: badge trên, tiền dưới. CSS ở cuối `app.css` mục T625.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: in "Không có lỗi.".
- Review chéo bằng worker Antigravity khác (pre-push-qa): XANH, khớp spec.
- Chưa mở trình duyệt xem bằng mắt.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- `docs/QUYET-DINH.md` QD78.
- Báo cáo 5.2.3 trên điện thoại đi qua `MToGiay.tsx` (kind custom), không qua `MSoBaoCao.tsx`. Sửa cột 5.2.3 phải sửa ở `MToGiay.tsx`.
