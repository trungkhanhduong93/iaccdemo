# Hộp chi tiết ở Chi phí NVL, Chi phí hoạt động (T953)

- Ngày: 27/11/2026
- Người: Trum, agent: Claude Code (giao Antigravity rồi dừng vì lâu, Claude tự làm)
- Trạng thái cuối phiên: Xong

## Đã làm

- Tạo `src/modules/home/HopChiTietChiPhi.tsx`: hộp dùng chung gồm ô tóm tắt, thanh ghi chú và nút Xuất Excel, bảng lọc từng cột (prop `loc` của `Table`), `PhanTrang` 50/100/200, dòng chân chỉ đếm số dòng dưới cột #. Esc, X, Đóng, bấm nền đều đóng hộp.
- `ChiPhiNvl.tsx`: bấm cửa hàng mở hộp (5 ô khi kiểm kê định kỳ, 3 ô khi tính theo mua), thay cho đổi `?cn=`. Nhánh chọn cửa hàng trên thanh trên và `?cn=` giữ nguyên.
- `ChiPhiThang.tsx`: bấm lý do chi mở hộp phiếu chi (4 ô), bỏ phần bung danh sách phiếu dưới bảng (T483).
- Cuối `app.css` thêm mục T953.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: exit 0.
- `python tools/kiem_van.py` cho 3 file: Sạch.
- `python tools/kiem_tra.py --nhanh`: dừng ở `kiem_tra_t870_the_kho` (lỗi cũ T933, chờ `.bc-ban-du-lieu table.tbl`), chưa tới các mục sau.
- Script Playwright riêng: cả 2 màn bấm dòng đầu mở hộp đúng tiêu đề, số ô (5, 4), đúng cột, có hàng lọc, không ô tìm kiếm, dòng chân chỉ hiện số dòng; Esc, X, Đóng đều đóng hộp và giữ URL; không có lỗi trang.
- Chưa bấm thử từng ô lọc và nút Xuất Excel trong hộp.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
