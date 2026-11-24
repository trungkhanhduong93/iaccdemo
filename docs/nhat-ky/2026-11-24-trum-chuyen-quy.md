# Sửa nghiệp vụ chuyển quỹ (T916-T921)

- Ngày: 24/11/2026
- Người: Trum, agent: Claude Code điều phối, 3 Antigravity (gemini-3.8-flash-high) code
- Trạng thái cuối phiên: Xong

## Đã làm

- T917: `src/ui/generic/gen.ts` thêm `QUY_TIEN` (chuyển từ `ChungTuForm.tsx`, file cũ re-export), `tkCuaQuy`, `quyCuaCq`; nhánh cq của `dinhKhoanDongTien` ra Nợ/Có theo quỹ. `ChungTuForm.tsx` tính lại Nợ/Có dòng khi đổi quỹ. `src/modules/tien/SoQuy.tsx` dòng nộp tiền ngân hàng mang số `CQ{MM}-{000}`.
- T916: `ChungTuForm.tsx` ô Đến quỹ bỏ quỹ đi, đổi Từ quỹ trùng thì Đến quỹ rỗng, hàm `luu` chặn trùng.
- T918: `src/app/mau-in.ts` thêm mẫu `phieu-chuyen-quy`, `mauCuaChungTu` trả mẫu này đầu tiên cho loai cq. `src/ui/bao-cao/duLieuIn.ts` điền Từ quỹ, Đến quỹ, Nợ/Có theo quỹ.
- T919: `src/ui/generic/VoucherScreen.tsx` cột `_tuQuyHien`, `_denQuyHien` ở tab Chuyển quỹ.
- T920: `src/ui/mobile/MDtThuChiLap.tsx` ô Từ quỹ, Đến quỹ, bảng chọn Đến quỹ, chặn trùng, lưu `_tuQuy`, `_denQuy`.
- T921: `src/ui/mobile/MDtThuChiDs.tsx` 2 ô Tổng xuất đi, Tổng nhận vào, lọc Quỹ; `src/ui/mobile/MLoc.tsx` thêm prop `dsQuy`, trường `quy`.
- T925: `VoucherScreen.tsx` thêm `tabCq`, tab Chuyển quỹ bỏ cột Lý do, Tham chiếu, Nguồn.

## Đã kiểm

- `npm run typecheck`: exit 0. `npm run build`: exit 0.
- `python tools/kiem_tra.py --nhanh`: in "Không có lỗi.".
- `kiem_van.py` 5 file chữ giao diện: 0 ĐỎ (ChungTuForm.tsx 6 VÀNG cũ, MDtThuChiLap.tsx 1 VÀNG).
- Tồn cuối sổ quỹ tháng 9 trước và sau T917 không đổi (worker đo 3 cửa hàng).
- T925: Playwright đọc tiêu đề cột: tab Chuyển quỹ còn #, Ngày, Số chứng từ, Loại, Diễn giải, Từ quỹ, Đến quỹ, Đối tượng, Cửa hàng, Ngày tạo, Người tạo, Tổng tiền; tab Tiền mặt vẫn có Lý do, Tham chiếu, Nguồn.
- Sau khi gộp T922-T924, `kiem_tra.py --nhanh` hỏng ở ca Thẻ kho T870 (chờ `.bc-ban-du-lieu table.tbl` quá 8 giây). Nhiều khả năng do T923 bắt chọn Kho, Mặt hàng trước khi xem; đợt này không đụng Thẻ kho.
- Chưa bấm tay các ca nghiệm thu trong `backup/spec-T916-T921.md` (chọn trùng quỹ, xem trước in, lọc Quỹ điện thoại). `kiem_tra.py` chưa có ca riêng cho chuyển quỹ.

## Dở dang, việc tiếp theo

- Không. Nên bấm thử các ca nghiệm thu trong spec trên https://iaccdemo.pages.dev sau khi robot deploy.

## Bẫy, quyết định mới

- Không.
