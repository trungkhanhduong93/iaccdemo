# Phiếu xuất, nhập điều chỉnh: cột Giá vốn, Tiền vốn (T747)

- Ngày: 05/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/generic/ChungTuForm.tsx`: thêm cờ `giaVon = laXh || laDc`, truyền cho bảng chi tiết `BangSua` và hộp chọn cột `cotTuyChon`. Phiếu Xuất điều chỉnh, Nhập điều chỉnh đổi cột Đơn giá, Thành tiền thành Giá vốn, Tiền vốn, như xuất huỷ, xuất khác (T741, T745).

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.

## Dở dang, việc tiếp theo

- Gói Standard vẫn ẩn giá trị phiếu điều chỉnh (T131), nên đổi tên chỉ thấy ở gói Plus, Pro.
- Điện thoại chưa đổi theo: `MLapPhieuKho.tsx`, `MXemPhieu.tsx` đang trong T552, T497 của Trum.

## Bẫy, quyết định mới

- Không.
