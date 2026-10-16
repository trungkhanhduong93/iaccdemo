# Thao tác nhanh lên đầu trang chủ Free (T290)

- Ngày: 16/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/home/BaBaiToanFree.tsx`:
  - Thêm thanh Thao tác nhanh trên hàng tab Tổng quan | Cần theo dõi, hiện ở cả 2 tab.
  - 5 nút cố định (`TT_NHANH_FREE`): Thu tiền, Chi tiền, Mua hàng (phiếu mua hàng 4.1.1), Kiểm kê (phiếu kiểm kê 5.1.10), Kê khai thuế (Danh sách tờ khai).
  - Bỏ khối Thao tác nhanh 4 nút ở cuối cột 3. Khối cũ lấy 4 mục đầu của danh sách tuỳ chỉnh `useThaoTacNhanh`; danh sách tuỳ chỉnh ở thanh bên (T280) giữ nguyên, không đổi.
- `src/styles/app.css`: mục cuối "Thao tác nhanh trên hàng tab trang chủ Free (T290)". Màn hẹp thì thanh tự xuống hàng dưới tab. Các lớp `.bbt-e-tt-nhanh-*` cũ không còn dùng, chưa xoá vì thuộc mục CSS của việc khác.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- `python tools/kiem_van.py src/modules/home/BaBaiToanFree.tsx`: sạch.
- Trên máy, Hộ kinh doanh Cà phê Góc Nhỏ gói Free, rộng 1400px: thanh 5 nút nằm cùng hàng với tab, mép phải thẳng với lưới 3 cột, trang không tràn ngang.
- Bấm Kiểm kê, Mua hàng, Thu tiền, Kê khai thuế: mở đúng phiếu, màn tương ứng. Thử xong đã trả phiên về Phố Mây gói Plus.
- Chưa sửa bản điện thoại (T281 của Trum đang sửa `src/ui/mobile/*`).

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
