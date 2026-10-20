# Tiến độ kiểm kê nhiều cửa hàng trên trang chủ Free (T339)

- Ngày: 20/10/2026
- Người: Trum, agent: Claude Code (Antigravity làm hỏng, Claude làm lại)
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/home/BaBaiToanFree.tsx`: phần Tiến độ kiểm kê theo cửa hàng xếp cửa hàng chưa kiểm lên đầu, rồi tới cửa hàng lệch nhiều, rồi tiến độ thấp. Hiện tối đa 4 dòng (`KK_TOI_DA`). Nhiều hơn 4 thì thêm dòng "Đã kiểm x/y cửa hàng · Xem tất cả ›". Bấm vào mở hộp `HopTienDoKk` có đủ cửa hàng, cột Đã kiểm, Mặt hàng lệch, Kiểm kê lần cuối.
- Dòng cửa hàng tách thành `DongKkCn`, dùng chung cho khối và hộp.
- `src/styles/app.css`: mục cuối "Tiến độ kiểm kê nhiều cửa hàng (T339)".

## Đã kiểm

- `npm run typecheck`, `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py src/modules/home/BaBaiToanFree.tsx`: Sạch.
- Dữ liệu giả chỉ có 3 cửa hàng. Tạm hạ ngưỡng xuống 2, chụp Playwright: khối hiện 2 dòng và dòng tóm tắt, hộp hiện đủ 3 cửa hàng, Esc đóng hộp. Đã trả ngưỡng về 4.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
