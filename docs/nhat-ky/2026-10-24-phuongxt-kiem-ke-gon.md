# Lập phiếu kiểm kê gọn đầu phiếu, khoá sửa khi đã có phiếu điều chỉnh (T657)

- Ngày: 24/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Điện thoại, Lập phiếu kiểm kê (`MLapPhieuKho.tsx`): cửa hàng lên hàng chip cạnh "Kiểm kê định kỳ", bỏ nhãn Phiếu mới, Đang sửa; bỏ dòng Số chứng từ (số vẫn tự cấp khi lưu); Diễn giải đổi thành Ghi chú. CSS mục T657 cuối `app.css`, bỏ class `.m-kk588-so-ct` không còn dùng.
- Điện thoại, xem phiếu kiểm kê (`MXemPhieu.tsx`): đã sinh phiếu Xuất, Nhập điều chỉnh thì ẩn nút Sửa phiếu và mục Sửa chứng từ ở menu ba chấm (`khoaKk`).
- Web (`ChungTuForm.tsx`): cùng luật, biến `khoaDc`: ẩn nút Sửa, chặn Ctrl+E và `?sua=1`. Xoá vẫn được, phiếu điều chỉnh bị xoá theo.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi. Bộ nhanh không đi qua màn kiểm kê điện thoại.
- `python tools/kiem_van.py` cho `MLapPhieuKho.tsx`, `MXemPhieu.tsx`: sạch.
- Chưa mở trình duyệt xem tận mắt bố cục hàng chip và màn xem phiếu.
- `tools/xuat_bao_cao_he_thong.py` không chạy được trên máy PhuongXT: cần `Dự kiến tính năng IACC Cloud.xlsx` (chỉ máy Trum có), nên `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx` chưa làm mới.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
