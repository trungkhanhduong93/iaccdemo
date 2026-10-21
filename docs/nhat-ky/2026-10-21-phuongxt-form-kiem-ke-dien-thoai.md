# Form lập phiếu kiểm kê điện thoại theo khung phiếu mua hàng, màn Kiểm kê 4 tab (T588)

- Ngày: 21/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Dựng bản mẫu trên artifact https://claude.ai/artifact/XdU8irdLKPUVx34DETs7Zg, PhuongXT góp ý 2 lượt rồi chốt.
- `MLapPhieuKho.tsx`, nhánh `laKk`: đầu phiếu chỉ còn chip loại phiếu, ô Kho kiểm kê (nhỏ hơn ô Nhà cung cấp), dòng cửa hàng. Bỏ Thừa/Thiếu theo kg, bỏ "Đã đếm".
- Thông tin kiểm kê: Ngày kiểm kê gộp ngày giờ, Người kiểm, Số chứng từ (số kế tiếp, xám), Diễn giải.
- Ô tìm hàng dùng `m-t449-tim` của phiếu mua hàng; chip lọc Tất cả, Thừa, Thiếu, Khớp kèm số mặt hàng.
- Thẻ mặt hàng dùng khung `m-t449-hang-the`: Tồn hệ thống, Tồn thực tế (ô nhập, ĐVT trong ô), Chênh lệch kèm nhãn Thừa/Thiếu/Khớp, dòng Xử lý (thiếu: Xuất điều chỉnh, thừa: Nhập điều chỉnh) khi có chênh lệch, ô ghi chú.
- Tồn thực tế tự điền bằng tồn hệ thống, tồn hệ thống âm thì 0 (`tonTtMacDinh`). Lưu với ô bỏ trống cũng lấy giá trị này. Dữ liệu giả Dầu ăn đổi tồn hệ thống thành -3 để thấy trường hợp âm.
- Khung cuối chỉ còn số mặt hàng chênh lệch, số mặt hàng thừa, số mặt hàng thiếu. Bỏ đoạn gợi ý "hàng chưa đếm giữ nguyên tồn sổ".
- `MNghiepVu.tsx`: ẩn màn Điều chỉnh kho (màn có `voucher.dieuChinh`) khỏi Nghiệp vụ.
- `MChungTu.tsx`: màn Kiểm kê và màn Điều chỉnh dùng chung hàng tab Kiểm kê, Xuất điều chỉnh, Nhập điều chỉnh, Báo cáo (mở hộp Báo cáo theo dõi). Danh sách điều chỉnh đọc `?loai=xdc|ndc`. Gỡ khối tab Kiểm kê, Điều chỉnh kho Trum thêm ở T582 vì khối mới đứng trước, khối cũ không còn chạy tới.
- `MobileShell.tsx`: danh sách điều chỉnh có tiêu đề "Kiểm kê".
- CSS mục T588 cuối `app.css`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi, cả trước và sau khi rebase lên T581, T582, T586, T589.
- `python tools/kiem_tra.py --nhanh` (KIEM_TRA_URL cổng 5184, bản riêng `D:\IACC-CLOUD\Web-kiem-ke`): Không có lỗi.
- `python tools/kiem_van.py` cho `MLapPhieuKho.tsx`, `MChungTu.tsx`: sạch.
- Xem tay trên khung điện thoại 375px: gõ 29 cho Xương ống bò ra -2 kg, Thiếu, Xuất điều chỉnh; Dầu ăn -3 ra tồn thực tế 0, +3 Thừa, Nhập điều chỉnh; khung tổng 2/1/1; 4 tab chuyển đúng, tiêu đề "Kiểm kê".
- `tools/xuat_bao_cao_he_thong.py` không chạy được trên máy PhuongXT: thiếu file "Dự kiến tính năng IACC Cloud.xlsx", nên chưa làm mới báo cáo xlsx.
- Chưa chạy `kiem_tra.py --dien-thoai` (đang dừng ở bước lập phiếu đợt 5, việc T525).

## Dở dang, việc tiếp theo

- Không.
- Tab Báo cáo đang mở hộp Báo cáo theo dõi chung của kho. Muốn mở thẳng Báo cáo kiểm kê thì đổi `onClick` tab Báo cáo trong khối T588 của `MChungTu.tsx`.

## Bẫy, quyết định mới

- Không.
