# Phiếu mua điện thoại khớp canvas đợt 2 (T609, T610)

- Ngày: 22/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity code (2 worker Windows), Anti B review
- Trạng thái cuối phiên: Xong

## Đã làm

- T609, `MLapPhieu.tsx`: thanh tab Phiếu nhập, Hạch toán, Lịch sử dời xuống dưới khung Thanh toán, trên mục NHÀ CUNG CẤP, ở cả màn sửa và thêm mới.
- T609: ô Thuế GTGT áp chung bỏ select gốc, bấm mở sheet chọn thuế (Chọn thuế, 0% KCT, 5%, 8%, 10%).
- T609: khối HÀNG HOÁ, DỊCH VỤ bỏ lề dư trái phải; nút + Thêm dòng đủ 4 cạnh viền nét đứt; nút +, nút tải lại và chữ đếm ở sheet chọn nhà cung cấp cùng một hàng.
- T609: sheet con (chọn nhóm hàng, thêm nhà cung cấp) thấp hơn sheet mẹ khoảng 60px, lộ tiêu đề sheet mẹ. CSS ở mục T609 cuối `app.css`.
- T610: thành phần mới `src/ui/mobile/MThanhToanNgay.tsx` gồm sheet Thanh toán ngay và sheet Chọn quỹ chồng lên, theo khung TTNgay1, TTNgay2 của canvas T600.
- T610, `MXemPhieu.tsx`: nút Thanh toán ở màn xem phiếu mua dùng `MThanhToanNgay`, bỏ sheet "Thanh toán cho nhà cung cấp" cũ. Lập phiếu chi chuyển sang màn Lập phiếu chi điền sẵn.
- T610, `MDtThuChiLap.tsx`: lập phiếu chi từ phiếu mua, lưu xong mở màn xem phiếu chi vừa lập (trước đây quay về phiếu mua). Áp cho cả luồng từ màn sửa.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py src/ui/mobile/MThanhToanNgay.tsx`: Sạch.
- Anti B review chéo bằng pre-push-qa: VÀNG, khớp spec, chỉ còn 5 chỗ màu cứng. Đã đổi sang biến `--muted`, `--line-2`, `--orange-d`, `--faint`.
- Chưa bấm thử bằng mắt trên trình duyệt. Trum xem ở khổ 390×844: `?goi=PR#/app/mua-hang/4-1-1`.

## Dở dang, việc tiếp theo

- Màn sửa phiếu mua (`MLapPhieu.tsx` khoảng dòng 3053 đến 3262) vẫn giữ sheet Thanh toán ngay riêng. Đợt sau chuyển sang dùng `MThanhToanNgay` để hai màn chung một code.

## Bẫy, quyết định mới

- Không.
