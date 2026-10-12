# Nhóm HHDV mua vào, bỏ ô kèm hoá đơn khi xem (T162)

- Ngày: 12/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/generic/gen.ts`: danh sách `NHOM_HHDV` gồm 5 nhóm hàng hoá, dịch vụ mua vào theo tờ khai 01/GTGT; dòng chứng từ có thêm `nhomHhdv`, để trống thì tính là nhóm 1.
- `src/ui/generic/BangSua.tsx`: thêm prop `coNhomHhdv`. Cột Nhóm HHDV mua vào nằm sau Tiền thuế, cả bảng xem và bảng sửa. Khi sửa thì chọn nhóm bằng ô chọn. Cột có trong Tuỳ chỉnh giao diện.
- `src/ui/generic/ChungTuForm.tsx`: phiếu mua gói Plus, Pro có tích Nhận kèm hoá đơn thì hiện cột. Ô tích Nhận kèm hoá đơn, Lập kèm hoá đơn chỉ hiện khi thêm mới, sửa; xem chi tiết không còn ô này.
- `src/ui/generic/VoucherScreen.tsx`: danh sách mua bỏ cột và ô lọc Nhận hoá đơn; danh sách bán giữ Xuất hoá đơn.
- `src/modules/ban-hang/ChungTuBanHang.tsx`: chip Tổng hợp, Chi tiết ở danh sách Xuất bán POS chỉ để xem, không còn dẫn sang Cấu hình kế toán.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `PYTHONIOENCODING=utf-8 python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `kiem_van.py` 5 file đã sửa: 0 ĐỎ. Còn 1 VÀNG có từ trước ở `ChungTuForm.tsx` (câu "Bạn có chắc chắn"), không do T162.
- Bấm thử Phố Mây gói Plus. Danh sách mua hàng không còn cột Nhận hoá đơn. Xem chi tiết phiếu mua không có ô tích. Thêm phiếu mua, tích Nhận kèm hoá đơn thì hiện cột Nhóm HHDV mua vào; bỏ tích thì cột ẩn. Chip ở danh sách Xuất bán POS là chữ, không bấm được. Phiên giữ nguyên Phố Mây gói Plus.

## Dở dang, việc tiếp theo

- Nhóm HHDV chưa đổ vào tờ khai 01/GTGT, bảng kê mua vào.

## Bẫy, quyết định mới

- Không.
