# Thao tác nhanh dùng chung web và điện thoại (T266)

- Ngày: 15/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity (Gemini 3.8 Flash High) viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/app/thaoTacNhanh.ts` (mới): danh mục 11 thao tác ứng viên. Gồm Thu tiền, Chi tiền, Nhập kho, Xuất kho, Sổ quỹ, Nhập mua, Kiểm kê, Báo có, Uỷ nhiệm chi, Sổ ngân hàng, Chuyển quỹ. Mặc định gói Free: Thu, Chi, Nhập mua, Kiểm kê, Sổ quỹ. Gói khác: Thu, Chi, Nhập kho, Xuất kho, Sổ quỹ. Lựa chọn lưu ở localStorage khoá `iacc-thao-tac-nhanh`; đọc, ghi đều bọc try/catch. Hook `useThaoTacNhanh` dùng chung cho web và điện thoại, gói Free lọc bỏ mục ngoài gói.
- Phân hệ mới `src/modules/thao-tac-nhanh/` có màn `danh-sach`, đăng ký cuối `MODULES` trong `registry.ts`, nên sidebar hiện ngay dưới Hệ thống. Màn có lưới ô và nút Tuỳ chỉnh. Hộp tuỳ chỉnh có ô tích, nút lên xuống đổi thứ tự, các nút Về mặc định, Huỷ, Lưu. Ô ngoài gói hiện nhãn gói (T260).
- `MTrangChu.tsx`: Thao tác nhanh lấy danh sách từ hook. Nút Tuỳ chỉnh (gói Free cũng có) mở tấm trượt dưới, chức năng như hộp trên web.
- `MNghiepVu.tsx`: không hiện phân hệ Thao tác nhanh trong Nghiệp vụ. `tools/kiem_tra.py`: bước duyệt `manMobile` bỏ qua phân hệ này.
- Coordinator sửa thêm: ô Sổ ngân hàng trỏ về 2.2.3 (anti để nhầm 2.2.2); màn web thêm lớp `page` để có lề như các màn khác.
- `app.css`: mục T266 cuối file.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- `python tools/kiem_tra.py --dien-thoai`: chỉ còn lỗi cũ T242 (màn Chi phí NVL chưa có bản điện thoại).
- `kiem_van.py` cho `ThaoTacNhanhScreen.tsx`, `MTrangChu.tsx`: sạch.
- Ảnh `tools/shots/t266-*.png`. Web gói F và gói S hiện đúng mặc định, tuỳ chỉnh lưu được, tải lại trang vẫn giữ. Điện thoại cùng trình duyệt hiện đúng danh sách vừa lưu ở web.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
