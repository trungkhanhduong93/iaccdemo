# Khung 1 trang nhìn và dữ liệu lớn theo LedgerStudio (T50)

- Ngày: 09/10/2026
- Người: Trum, agent: Antigravity
- Trạng thái cuối phiên: Xong

## Đã làm

- Bộ khung 1 trang nhìn: khoá cứng 100vh flexbox cho `.page-voucher` và `.page-report`, chặn thanh cuộn ngoài cấp trang trên `.main` (`src/styles/app.css`, `src/ui/generic/ReportScreen.tsx`).
- Bộ cuộn ảo (Virtual Scroll) và chống giật cột: tạo `src/ui/virtual.ts` chứa hook `useVirtualScroll` tự hiệu chỉnh chiều cao dòng thực tế từ DOM bằng median, chế độ vuốt nhanh flushSync với key vị trí; thuật toán giữ bề rộng lớn nhất làm min-width của tiêu đề cột chống co giật ngang khi cuộn (`src/ui/Table.tsx`).
- Gom nhóm chứng từ đa cấp: tạo thuật toán `buildGroupedData` gom nhóm cây đa cấp kèm tính tổng con (subtotal); thêm thanh gom nhóm `GroupZone` trên đầu bảng danh sách chứng từ, cho phép chọn cột để nhóm, đóng/mở từng nhóm và hiển thị tổng tiền nhóm (`src/ui/generic/VoucherScreen.tsx`, `src/ui/Table.tsx`, `src/styles/app.css`).
- Tăng tốc cuộn bảng báo cáo lớn: áp dụng `content-visibility: auto` kèm `contain-intrinsic-size: 0 28px` cho các dòng `<tr>` trên bàn xem tờ giấy (`src/styles/app.css`), giữ nguyên khung đo ẩn và chế độ in giấy không bị ảnh hưởng.

## Đã kiểm

- `npm run typecheck`: chạy xong, không lỗi.
- `npm run build`: build thành công sau 1.10s.
- `python tools/kiem_van.py` các file `src/ui/virtual.ts`, `src/ui/Table.tsx`, `src/ui/generic/VoucherScreen.tsx`, `src/ui/generic/ReportScreen.tsx`: sạch 100%.
- `python tools/kiem_tra.py --nhanh`: kiểm tra 231 lượt mở màn, in `Không có lỗi.`

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- `docs/QUYET-DINH.md`: chốt QD34.
