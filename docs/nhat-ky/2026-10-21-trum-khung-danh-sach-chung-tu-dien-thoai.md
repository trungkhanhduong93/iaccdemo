# Khung danh sách chứng từ điện thoại dùng chung (T581, T582)

- Ngày: 21/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity viết code, Anti B review
- Trạng thái cuối phiên: Xong

## Đã làm

- T581: thẻ phiếu mỗi nhóm ngày ở danh sách Mua hàng có viền 1px #f1f5f9, bóng nhẹ, bo 10px như thẻ Thu chi. Mục mới cuối `src/styles/app.css`.
- T582: tách khung danh sách Mua hàng 4.1.1 thành `src/ui/mobile/MDsChungTuChuan.tsx` (header, hàng tab, hàng lọc, thẻ tổng, sắp xếp, nhóm ngày, nút Thêm mới).
- `src/ui/mobile/MChungTu.tsx`: Mua hàng, mọi màn chứng từ Bán hàng, mọi tab Kho gọi khung chung. Kho không hiện tiền, thẻ tổng chỉ đếm chứng từ. Phân hệ khác vẫn qua `MDanhSach`.
- `src/ui/mobile/MXuatBanPos.tsx`: chuyển phần đầu và thân danh sách sang khung chung, giữ bộ lọc T570, hộp lịch T571.
- Trường lọc mỗi màn vẫn lấy theo cấu hình của chính màn đó.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: "Không có lỗi."
- `python tools/kiem_tra.py --dien-thoai`: dừng ở đợt 5, đúng lỗi đã ghi ở T525, chưa kiểm được phần sau.
- Anti B review diff bằng pre-push-qa: XANH, khớp spec.
- Chưa mở điện thoại thật để xem bằng mắt.

## Dở dang, việc tiếp theo

- T583: Chi phí phân bổ điện thoại (`MCcdc.tsx`) dùng khung `MDsChungTuChuan`, làm sau khi T436 xong.
- Lớp `m-ds-fab` dùng trong khung chung chưa có CSS, có từ nhánh Mua hàng cũ. Không ảnh hưởng hiển thị.

## Bẫy, quyết định mới

- Không.
