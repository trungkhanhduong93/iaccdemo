# Trang chủ: đổi chữ Giá vốn nguyên vật liệu thành Chi phí nguyên vật liệu (T482)

- Ngày: 19/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/home/BaBaiToanFree.tsx`: dòng trong khối kết quả kinh doanh trang chủ gói Free máy tính đổi "Giá vốn nguyên vật liệu" thành "Chi phí nguyên vật liệu", chú thích khi rê chuột thành "Xem chi phí nguyên vật liệu".
- `src/ui/mobile/MTrangChuFree.tsx`: đổi như trên ở trang chủ gói Free điện thoại.
- `src/ui/mobile/MChiPhiNvl.tsx`: sửa chú thích đầu file theo tên mới.
- Giữ nguyên: bước quy trình "Tính giá vốn nguyên vật liệu" (`gia-thanh/quy-trinh.ts`) và chú thích "Chi phí giá vốn nguyên vật liệu trong tháng" ở trang chủ điện thoại gói khác (`MTrangChu.tsx`), vì không phải nhãn trang chủ gói Free.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: xong.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- `python tools/kiem_van.py` hai file trang chủ: sạch.
- Trình duyệt, gói Free, trang chủ Tổng quan: hiện "Chi phí nguyên vật liệu". Xong trả phiên về Phố Mây gói Plus.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
