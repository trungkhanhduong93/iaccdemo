# Đổi chữ "Đổ về tiếp" ở màn đang thiết lập sổ sách (T138)

- Ngày: 02/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Dở dang (T138 còn phần khác, phần này xong)

## Đã làm

- `src/modules/onboarding/OnboardFabi.tsx`: dòng cam dưới Doanh thu bán hàng, Thu chi tiền đổi từ "Đổ về tiếp, xem tiến độ ở Trang chủ" thành "Đang tiếp tục đồng bộ. Xem tiến độ tại Trang chủ." Màn dùng chung web và điện thoại.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py src/modules/onboarding/OnboardFabi.tsx`: sạch.

## Dở dang, việc tiếp theo

- Không với phần này.

## Bẫy, quyết định mới

- Không.
