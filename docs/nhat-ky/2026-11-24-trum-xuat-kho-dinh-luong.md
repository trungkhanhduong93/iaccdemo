# Xuất kho định lượng làm lại theo mẫu (T907)

- Ngày: 24/11/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Danh sách (`kho/XuatDinhLuong.tsx`): bỏ dòng đếm "N phiếu", nút Excel lên thanh lọc, dòng tổng ghi "Tổng cộng".
- Danh sách: thêm cột Mã hoá đơn sau Số chứng từ, hiện # và 5 ký tự cuối (QD114). Ghi chú rộng 200px, cắt bằng dấu ba chấm. Cột kéo giãn được, nhớ bề rộng.
- Danh sách: ô tìm tìm thêm theo mã hoá đơn. Thu bề rộng các cột để cột Nguồn không bị cột Tổng tiền đè.
- Chi tiết: đầu phiếu 2 nhóm Đơn hàng POS, Phiếu xuất kho, dùng lớp `xp637-*` của Xuất bán POS. Nhãn ô thứ hai cố định 64px để các ô thẳng cột.
- Chi tiết: lưới phẳng dùng `Table`, nhóm cột Món bán, Hàng hoá. Mỗi dòng một NVL, phần món lặp lại, lọc được từng cột.
- Chi tiết: cột Ghi chú ghi lý do món không xuất được, cột Xử lý có nút mở màn sửa. Dải vàng đếm món theo lý do. Thẻ "N món chưa xuất" ở đầu form.
- Chi tiết: dòng tổng cộng số lượng món, thành tiền món (mỗi món tính một lần), số lượng NVL, tiền vốn.
- Dữ liệu (`kho/xuat-dinh-luong.ts`): phiếu có mã hoá đơn, số đơn POS, kênh bán, giá bán món. Tìm công thức theo trạng thái, ngày áp dụng, cửa hàng.
- Dữ liệu: 5 lý do. 1 chưa có công thức, 2 món FABi chưa khớp mã hàng, 3 công thức khác ĐVT bán, 4 công thức ngừng áp dụng, 5 NVL giá 0.
- Dữ liệu mẫu cho lý do 2, 3, 5: `MA_FABI` (Gỏi cuốn mang mã FABi riêng), công thức CTCB007 Trà đào theo Bình, CTCB008 Cà phê sữa đá có Đá viên. Thêm NVL033 Đá viên giá 0 vào `HANG_SX`.
- CSS: bỏ các lớp lưới cây cũ của mục T849, thêm mục T907 cuối `app.css`.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py src/modules/kho/XuatDinhLuong.tsx`: 0 ĐỎ, 3 VÀNG là chuỗi đường vẽ SVG của nút In có từ trước.
- Chụp gói Plus 1440x900: phiếu XDL2610-0155 hiện đủ 3 lý do, không lỗi trang.
- Lý do 4 có ở món Cơm tấm (công thức CTCB003 đang tắt). Lý do 2 có ở phiếu có Gỏi cuốn. Chưa chụp riêng hai phiếu đó.

## Dở dang, việc tiếp theo

- Không.
- Món bán lại có theo dõi tồn kho (Bia, Nước suối) vẫn ghi "Chưa có công thức chế biến", giống cách tính cũ. Trum muốn tách thành xuất kho thẳng thì mở việc mới.

## Bẫy, quyết định mới

- Không.
