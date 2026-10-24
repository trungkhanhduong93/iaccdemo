# Bỏ mã phiếu chi lặp trong hộp Không sửa được phiếu mua (T661)

- Ngày: 24/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MXemPhieu.tsx`: `dsChiMua` gộp phiếu chi trả ngay (`ctTtCu`) với danh sách thanh toán (`dsTt`), mà `dsTt` có thể đã chứa phiếu đó, nên hộp báo ghi "PC2610-0261, PC2610-0261". Lọc trùng theo số phiếu.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Chưa mở trình duyệt xem lại hộp báo trên điện thoại.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
