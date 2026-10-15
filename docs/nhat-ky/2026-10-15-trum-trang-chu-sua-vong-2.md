# Trang chủ sửa vòng 2, báo cáo điện thoại dạng bảng, sidebar Thao tác nhanh nổi (T273)

- Ngày: 15/10/2026
- Người: Trum, agent: Claude Code chia việc, kiểm, commit; Antigravity Windows (Anti A) code phần trang chủ, sidebar và chỉnh bảng báo cáo vòng 2; Anti B (WSL) code báo cáo điện thoại, review chéo phần A
- Trạng thái cuối phiên: Xong

## Đã làm

- Trang chủ Free: nút "Tạo quỹ" dưới cột thu chi đổi thành "Biểu đồ thu chi ›", mở modal gộp tất cả quỹ. Nút "+ Tạo quỹ" chuyển vào modal gộp.
- Điện thoại: số tồn quỹ tổng to, đậm như số lãi; danh sách quỹ đổi tiêu đề thành "Các quỹ". Sheet quỹ: hai nút Lập phiếu thu, chi chung một hàng, nút Xem chi tiết lịch sử thu chi rộng hết hàng dưới.
- Chỗ bấm được có đúng một mũi tên ›, bỏ mũi tên đúp.
- Số tiền bỏ dấu + −, chỉ tô màu xanh, đỏ. Lãi âm ghi "Lỗ … đ". Áp trang chủ các gói (`TongQuan.tsx`), modal quỹ, Lịch sử thu chi, sổ dạng dòng điện thoại. Dấu + − = nối 4 ô công thức trong modal quỹ giữ nguyên.
- Báo cáo điện thoại (`bangMauA.tsx`, `MSoBaoCao.tsx`, `MToGiay.tsx`, `MBaoCaoDong.tsx`): bỏ đóng băng cột, cả bảng vuốt ngang; bảng gọn chữ 13px. Phân trang 100 dòng (`phanTrangM.tsx` mới), dòng tổng là tổng cả báo cáo, hiện cuối mỗi trang.
- Sidebar web (`Shell.tsx`, `SidebarFlyout.tsx`): rê chuột hoặc bấm vào Thao tác nhanh hiện bảng nổi các thao tác, bấm đi thẳng tới màn. Không mở màn riêng nữa. Cuối bảng có link Tuỳ chỉnh.
- `tools/kiem_tra.py`: đợt 19B kiểm nút Biểu đồ thu chi thay Tạo quỹ; đợt 21B đổi sang luật mới: cột đầu không ghim, sổ dạng dòng có số xanh, đỏ không dấu, báo cáo trên 100 dòng có thanh phân trang, sang trang 2 dòng tổng không đổi.
- `app.css`: hai mục T273 cuối file.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- `--dien-thoai`: chỉ còn lỗi có từ trước, màn `trang-chu/chi-phi-nvl` (T242) và `thue/to-khai` chưa có bản điện thoại.
- `kiem_van.py` các file có chữ giao diện: sạch.
- Anti B review phần A ra VÀNG: modal gộp web có 2 nút Tạo quỹ, hẹn giờ sidebar chưa dọn khi gỡ. Claude đã sửa cả hai.
- Xem ảnh Báo cáo kiểm kê, Chi tiết bán hàng 2430 dòng (25 trang): bảng không ghim cột, có thanh phân trang.

## Dở dang, việc tiếp theo

- T274 (2 tab trang chủ Free, biểu đồ) làm tiếp.

## Bẫy, quyết định mới

- Trum chốt: báo cáo điện thoại không đóng băng cột, 100 dòng một trang; số tiền không ghi dấu + −, chỉ tô màu. Luật này thay luật ghim cột đầu của mẫu A (T258).
