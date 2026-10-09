# Màn xem báo cáo gọn, gộp T55 và bản Anti (T57)

- Ngày: 09/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- `app.css` mục T57: ẩn PageHead lặp tên báo cáo khi có thanh chọn (`.bc-chon ~ .page > .ph:not(:has(.ph-act))`), khung báo cáo kéo tới đáy (`.main:has(.bc-chon)`), hàng trên không xuống dòng, màn dưới 1360px ẩn chữ nút Tuỳ chỉnh, Xuất.
- `ReportScreen.tsx` (ReportToolbar): nút Tuỳ chỉnh, Xuất, In có chữ, In là nút chính.
- `ToGiay.tsx`: nút Tờ in / Bảng dữ liệu ở thanh dưới, Bảng dữ liệu dùng `Table` cuộn ảo với bảng đầu tiên; nhớ lựa chọn ở `bc-che-xem`; không hiện "0 dòng".
- `Table.tsx` (commit riêng T56): đo chiều cao hàng tiêu đề bằng `offsetHeight`, hàng lọc hết đè tiêu đề khi trang thu zoom.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: 233 lượt mở màn, `Không có lỗi.`
- `python tools/kiem_van.py` hai file TSX: sạch.
- Chụp Bảng cân đối số phát sinh, Xuất nhập tồn ở 1440x900: một tiêu đề, khung tới đáy, Bảng dữ liệu hiện lưới.
- Chưa bấm In thật ở chế độ Bảng dữ liệu (hộp in của trình duyệt không chụp được).

## Dở dang, việc tiếp theo

- Không. T58, T59 làm tiếp theo bảng tiến độ.

## Bẫy, quyết định mới

- QD37. Bẫy đo chiều cao bằng `getBoundingClientRect` khi html có zoom: đã có trong `docs/BAY.md` mục T42, áp cả cho `Table.tsx`.
