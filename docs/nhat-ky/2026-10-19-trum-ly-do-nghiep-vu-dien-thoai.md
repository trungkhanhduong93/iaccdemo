# Danh mục Lý do nghiệp vụ điện thoại (T441)

- Ngày: 19/10/2026
- Người: Trum, agent: Antigravity
- Trạng thái cuối phiên: Xong

## Đã làm

- Bỏ ô tích "Là chi phí" ở thẻ danh mục ngoài (`src/ui/mobile/MDanhMuc.tsx`), dùng icon chevron đồng nhất với các danh mục khác.
- Đổi dòng "Là chi phí" trong màn chi tiết `xemLyDo` thành chữ Có / Không theo dữ liệu, bỏ ô tích tránh gây hiểu nhầm ở màn chỉ xem.
- Xoá khoảng đệm dạt phải `<span className="grow" />`, thêm class `.m-dm-nut-dong-chan` giúp nút Đóng rộng hết chân màn cân đối (`src/ui/mobile/MDanhMuc.tsx`, `src/styles/app.css`). Áp dụng tương tự cho `xemPttt`.
- Cho phép form `MFormDm` (nếu mở cho lý do nghiệp vụ) tích/bỏ tích và lưu trường `chiPhi` đúng quy chuẩn.
- Ghi nhận khảo sát tại `backup/T441-khao-sat.md`. Chụp ảnh trước/sau tại `backup/T441-ly-do-360-truoc.png` và `backup/T441-ly-do-360-sau.png`.

## Đã kiểm

- `npm run typecheck`: chạy xong, không có lỗi.
- `npm run build`: chạy xong, không có lỗi.
- `python tools/kiem_tra.py --nhanh` (port 5192): không có lỗi.
- `python tools/kiem_van.py`: 0 ĐỎ.
- Playwright kiểm tra khung 360px: không tràn ngang, thẻ danh mục hiện chevron, màn chi tiết hiện "Là chi phí: Có/Không" và nút Đóng rộng hết chân màn.

## Dở dang, việc tiếp theo

- Không. Làm tiếp T442.

## Bẫy, quyết định mới

- Không.
