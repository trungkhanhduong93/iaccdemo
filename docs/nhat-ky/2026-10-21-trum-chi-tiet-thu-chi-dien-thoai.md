# Phần Chi tiết form thu chi điện thoại theo Figma (T589)

- Ngày: 21/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MDtThuChiLap.tsx`, khối CHI TIẾT (dùng chung cho Tạo mới và Sửa phiếu): tiêu đề thẻ dòng lấy theo diễn giải, trống thì ghi "Dòng mới"; nhãn "Ghi chú" đổi thành "Diễn giải"; bỏ icon xích trong ô Thành tiền.
- Dòng "Đồng bộ với Số tiền thu/chi ở đầu phiếu" chỉ hiện khi phiếu có 1 dòng. Nút xoá vẫn ẩn khi còn 1 dòng. Giữ "Thêm thông tin dòng" của gói có phí.
- Dòng Tổng cộng chỉ hiện khi từ 2 dòng, vẽ lại: trái "Tổng cộng" kèm số dòng, phải số tiền to theo màu thu, chi.
- CSS mới ở mục cuối `src/styles/app.css`, tiêu đề có mã T589: khung dòng, ô nhập, nút Thêm dòng nét đứt, dòng Tổng cộng.

## Đã kiểm

- `npm run typecheck`, `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: "Không có lỗi."
- `python tools/kiem_van.py src/ui/mobile/MDtThuChiLap.tsx`: 0 ĐỎ, 1 VÀNG (chuỗi toạ độ SVG, không phải chữ).
- Chưa xem bằng mắt trên điện thoại. Trum xem trên https://iaccdemo.pages.dev sau khi push.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
