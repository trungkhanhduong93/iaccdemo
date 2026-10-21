# Sửa phiếu thu chi điện thoại giữ dòng chi tiết (T598)

- Ngày: 21/10/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MDtThuChiLap.tsx`: thêm `dongGoc`, lấy dòng chi tiết như màn xem (`_dong`, thiếu thì `dongCua` theo số phiếu). Trước đây form chỉ đọc `_dong`, phiếu mẫu không có nên bị thay bằng 1 dòng trống.
- Cùng file: dòng thêm bằng nút Thêm dòng mang cờ `moi`, thẻ dòng có class `moi`; lúc lưu bỏ cờ này khỏi `_dong`.
- `src/styles/app.css`: mục cuối file (T598), dòng `moi` nền `--tint`.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- Chưa bấm thử trên trình duyệt.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
