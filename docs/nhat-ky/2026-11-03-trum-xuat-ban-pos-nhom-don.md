# Danh sách Xuất bán POS điện thoại nhóm theo đơn (T716)

- Ngày: 03/11/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MXuatBanPos.tsx`: danh sách nhóm theo ngày, dưới mỗi ngày là một thẻ cho mỗi đơn POS thay cho một thẻ mỗi món (bỏ cách tách của T628).
- Thẻ đơn: dòng đầu Số đơn POS, dòng phụ Mã đơn POS · khách hàng, bên phải Tổng tiền. Khách có hoá đơn GTGT hiện tên khách, còn lại hiện Khách lẻ.
- Tổng mỗi ngày giờ cộng Tổng tiền của đơn.
- Bấm thẻ vẫn mở tấm chi tiết đơn như cũ.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: in "Không có lỗi."

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
