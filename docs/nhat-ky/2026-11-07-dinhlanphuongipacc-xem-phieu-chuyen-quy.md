# Xem phiếu chuyển quỹ trên điện thoại gọn lại (T775)

- Ngày: 07/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MDtThuChiXem.tsx`: phiếu chuyển quỹ (`isCq`) ẩn dòng Địa chỉ và Tháng ghi nhận chi phí. Phiếu thu, phiếu chi giữ nguyên.
- Cùng file: nhãn lý do của phiếu chuyển quỹ đổi từ "Lý do thu" thành "Lý do".
- Cùng file: phiếu chuyển quỹ mẫu không ghi lý do (không có `_lyDo`, dòng không có `ly`, `doanLyDoThuChi` trả rỗng với `cq`) nên dòng Lý do bị ẩn. Giờ luôn hiện, thiếu thì ghi "Chuyển quỹ".

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: "Không có lỗi."
- `python tools/kiem_van.py src/ui/mobile/MDtThuChiXem.tsx`: 0 ĐỎ, 2 VÀNG (đường vẽ SVG cũ, không thuộc phần sửa).
- Chưa mở màn để xem bằng mắt.

## Dở dang, việc tiếp theo

- Form lập phiếu chuyển quỹ điện thoại (`MDtThuChiLap.tsx` dòng 785) vẫn ghi "Lý do thu". Chưa đổi vì Trum đang giữ file này ở T552.

## Bẫy, quyết định mới

- Không.
