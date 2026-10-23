# Ghi sổ theo gói mới (T648)

- Ngày: 23/10/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Rà logic gói sau T642: bảng đổi mã trong 67 file đúng. Lệch đến từ T632: doanh nghiệp gói Standard chạy TT58, trùng chế độ của Plus, nên chỗ nào hỏi theo chế độ thì Standard doanh nghiệp chạy như Plus.
- T646 (PhuongXT) sửa bằng cách chỉ giữ ghi sổ cho gói Nợ/Có, làm gói Plus mất ghi sổ. Trum chốt QD81: Standard không ghi sổ, Plus doanh nghiệp có, Plus hộ kinh doanh không, Pro có.
- `src/app/plan.ts`: thêm `kieuGhiSoDv(s)`, gói Standard trả `khong`, gói khác theo chế độ.
- Đổi sang `kieuGhiSoDv`: `ChungTuForm.tsx` (cờ mới `coGhiSo` cho trạng thái, nút, tab Ghi sổ, trạng thái lưu, chặn xoá; `coTkGoi` giữ cho cột tài khoản; tab lại tên Ghi sổ với TT58, Hạch toán với Nợ/Có), `ChungTuBanHang.tsx`, `VoucherScreen.tsx`, `MXemPhieu.tsx`, `MChungTu.tsx`, `MDtThuChiDs.tsx`, `MLapPhieu.tsx`, `MXuatBanPos.tsx`.
- `MLichSu.tsx`, `LichSu` trong `ChungTuForm.tsx`, `butToan.ts`: trả điều kiện về `!== 'khong'` như trước T646.
- `MToGiay.tsx`: gói Standard xem Báo cáo kết quả kinh doanh bản lãi lỗ đơn giản như web, không ra B02-DNSN.
- Thêm việc T649 (dọn sót sau T642) vào `docs/TIEN-DO.md`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- Script riêng mở danh sách và phiếu mua hàng 4.1.1 ở 5 trường hợp: Standard doanh nghiệp, Standard hộ kinh doanh, Plus hộ kinh doanh không có chữ Ghi sổ, Chưa ghi sổ; Plus doanh nghiệp có tab Ghi sổ, nút, trạng thái; Pro có tab Hạch toán, nút, trạng thái.
- Chưa kiểm bằng mắt màn điện thoại và cột Khoản mục, Công việc (phiếu mua không có dòng tiền).

## Dở dang, việc tiếp theo

- Không.
- T649: tab Hạch toán, Bút toán trên điện thoại còn ẩn theo gói Standard, Plus hộ kinh doanh thấy tab rỗng; cùng các việc dọn sót khác sau T642.
- PhuongXT (T647) đang sửa `ChungTuForm.tsx`, dinhlanphuongipacc (T436) giữ `MXemPhieu.tsx`: cần `git pull --rebase`.

## Bẫy, quyết định mới

- `docs/QUYET-DINH.md`: QD81.
