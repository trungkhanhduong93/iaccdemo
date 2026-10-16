# Lọc quỹ ở Lịch sử thu chi (T279)

- Ngày: 16/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/home/LichSuQuy.tsx`: thêm ô lọc Quỹ cạnh lọc thu, chi. Chọn Tất cả quỹ, từng quỹ tiền mặt chi nhánh hoặc từng tài khoản ngân hàng. Quỹ đang chọn ghi vào tham số `quy` trên địa chỉ, nên 4 ô số, dòng phụ, bảng và file Excel đổi theo.
- `src/styles/app.css`: mục cuối file "Lọc quỹ ở Lịch sử thu chi (T279)", ô rộng 230px.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh` (dev ở cổng 5181, `KIEM_TRA_URL=http://localhost:5181/`): `Không có lỗi.`
- `python tools/kiem_van.py src/modules/home/LichSuQuy.tsx`: sạch.
- Mở màn trên máy, gói Free, rộng 1600px: chọn Quỹ tiền mặt Thảo Điền, số và bảng đổi đúng, cột Quỹ ẩn.
- Chưa sửa bản điện thoại `MLichSuQuy.tsx`.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
