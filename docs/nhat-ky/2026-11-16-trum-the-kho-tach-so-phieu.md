# Thẻ kho tách cột Số phiếu nhập, Số phiếu xuất, thêm cột ĐVT (T870)

- Ngày: 16/11/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/kho/data.ts`, hàm `theKho`: bảng có 8 cột Ngày, Số phiếu nhập, Số phiếu xuất, Diễn giải, ĐVT, Nhập, Xuất, Tồn. Dòng phiếu thêm khoá `soNhap` hoặc `soXuat` và `dvt`. Khoá `so` giữ nguyên cho điện thoại.
- `src/modules/kho/TheKho.tsx`: hai cột số phiếu vẽ bằng `SoChungTu`, bấm mở chứng từ như cột cũ.
- `tools/kiem_tra.py`: ca `kiem_tra_t870_the_kho`, chạy trong `--nhanh`. Ca kiểm thứ tự 8 cột, số MH ở cột nhập, số XB ở cột xuất, cột ĐVT, bấm số phiếu mở chứng từ.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi, có dòng "Kiểm tra T870".
- Đọc code: file Excel lấy giá trị theo khoá cột (`src/ui/bao-cao/xuatXlsx.ts:139`) nên ra đủ 2 cột số phiếu và cột ĐVT. Số phiếu trên tờ in dùng class `ds-link-so`, mục T556 đã đổi thành chữ thường.
- Chưa mở file Excel và tờ xem trước in bằng mắt. Chưa mở Thẻ kho trên điện thoại sau khi sửa.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
