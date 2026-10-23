# Bỏ ô Số phiếu ở chi tiết chứng từ (T647)

- Ngày: 23/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/generic/ChungTuForm.tsx`: bỏ ô Số phiếu (nhãn lấy từ `bo.so`: Số phiếu nhập, Số phiếu thu, chi, Số chứng từ; phiếu sản xuất, điều chuyển là Mã phiếu) ở cột 3. Số phiếu đã hiện ở tiêu đề giữa: Chi tiết phiếu, Đang chỉnh sửa; thêm mới thì lưu xong mới có. Form chung nên áp cho mọi màn chứng từ web.
- `src/modules/ccdc/the-phan-bo.tsx`: ô Số thẻ thêm `hien: () => false`. Số thẻ vẫn tự sinh ở `moi`, tiêu đề form hiện số thẻ.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Chưa xem bằng mắt: trình duyệt của agent chưa đăng nhập.

## Dở dang, việc tiếp theo

- Không. Màn điện thoại chưa đụng.

## Bẫy, quyết định mới

- Không.
