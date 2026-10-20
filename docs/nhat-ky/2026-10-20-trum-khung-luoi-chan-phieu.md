# Khung lưới chi tiết và chân form phiếu (T513)

- Ngày: 20/10/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `app.css`, mục T505 cuối file: `.ct-than-card > .ct-than` bỏ padding, thêm margin 0 12px 12px, viền `var(--luoi-vien)`, bo góc 8px. Viền đặt ở vùng cuộn vì `.ct-than .tbl-wrap` đã bỏ viền (dòng 5267), tiêu đề cột dính vẫn nằm trong khung.
- `app.css`: `.fsf-f.fsf-f-xem .btn` có viền `var(--line)` để nút Hiện cột tài khoản thấy được trên nền trắng.
- `ChungTuForm.tsx`: chân form thêm mới, sửa và màn chọn cửa hàng dùng class `fsf-f-xem` như lúc xem. Nút Huỷ, Lưu đổi sang `xp-btn-outline`, Lưu và thêm sang `xp-btn-sua`.
- Vá `main` hỏng: commit `4d939a5` (T498) import `MDtThuChiDs`, `MDtThuChiLap`, `MDtThuChiXem` mà chưa thêm file. Chép 3 file từ worktree `iaccdemo-dt-thu-chi`, commit riêng `77f8906`, đã push.

## Đã kiểm

- `npm run typecheck`, `npm run build`: chạy xong, không lỗi (sau khi thêm 3 file).
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.` Server cổng 5180 chạy từ đúng thư mục `D:\IACC-CLOUD\Web`.
- Chụp phiếu mua hàng thêm mới ở 1440x800, gói Pro: lưới đủ viền 4 cạnh, bo góc 8px; chân nền trắng `rgb(255, 255, 255)`.

## Dở dang, việc tiếp theo

- Không. Worktree `iaccdemo-dt-thu-chi` còn 3 file chưa theo dõi trùng tên với file vừa đẩy lên `main`. Phiên T498 lấy `main` về phải xoá hoặc so 3 file đó trước, không thì git báo file chưa theo dõi bị ghi đè.

## Bẫy, quyết định mới

- Không.
