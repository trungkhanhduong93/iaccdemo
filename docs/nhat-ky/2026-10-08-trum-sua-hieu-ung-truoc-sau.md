# Sửa hiệu ứng chớp khi bấm Trước, Sau ở form chứng từ (T25)

- Ngày: 08/10/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Nguyên nhân: `VoucherScreen.tsx` gắn `key={loc.key + loc.search}` cho form. Mỗi lần bấm Trước, Sau là đổi đường dẫn, form dựng lại và chạy lại hiệu ứng mở `.fsf` (mờ dần, trượt lên 6px). Cả màn chớp, lộ sidebar phía sau.
- `ChungTuForm.tsx`: Trước, Sau điều hướng kèm `state: { chuyenPhieu: true }`, truyền `tinh` cho `FormToanMan`.
- `FormToanMan.tsx`: thêm prop `tinh`, có thì gắn lớp `fsf-tinh`.
- `app.css`: `.fsf.fsf-tinh { animation: none; }`. Lần mở form đầu tiên vẫn có hiệu ứng.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: "Không có lỗi."
- Thử bằng Chrome ở 2.1.1: mở phiếu có hiệu ứng `fsf`; bấm Sau 2 lần, Trước 1 lần, hiệu ứng là `none`, độ mờ 1 ngay. Esc về `#/app/tien/2-1-1`.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
