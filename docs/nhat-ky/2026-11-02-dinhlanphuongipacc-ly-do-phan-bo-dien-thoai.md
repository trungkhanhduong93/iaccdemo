# Lý do chi phân bổ nhiều kỳ trên điện thoại (T700)

Người làm: dinhlanphuongipacc, 02/11/2026. Phần web xem [nhật ký 31/10](2026-10-31-dinhlanphuongipacc-ly-do-phan-bo-nhieu-ky.md).

## Đã làm

- `src/ui/mobile/MDanhMuc.tsx`: danh mục Lý do (chỉ xem) có dòng phụ "Chi tiền · Là chi phí" hoặc "Chi tiền · Chi phí phân bổ nhiều kỳ"; màn chi tiết thêm dòng Chi phí phân bổ nhiều kỳ. Sửa lỗi Là chi phí lấy từ dữ liệu gốc, bỏ qua giá trị đã sửa trong phiên (`cfg.phien.gan`).
- `src/ui/mobile/MLapPhieu.tsx`, `MDtThuChiLap.tsx`: gợi ý tạo thẻ khi bất kỳ dòng (hoặc lý do đầu phiếu) có tích Chi phí phân bổ nhiều kỳ, dùng `laLyPhanBo`; câu báo đổi "khoản chi phí phân bổ nhiều kỳ".
- `src/ui/generic/danhMucStore.ts`: `laLyPhanBo` nhận cả mã lý do; thêm `laLyChiPhi` đọc tích Là chi phí đã sửa trong phiên.
- Nhãn Chi phí, ô Tháng ghi nhận chi phí ở `ChungTuForm.tsx`, `MDtThuChiLap.tsx`, `MDtThuChiXem.tsx` dùng `laLyChiPhi` thay `LY_CHI_PHI`, để lý do chuyển sang tích phân bổ không còn hiện Chi phí.
- Khoá sổ điện thoại (`MKhoaSo.tsx`) dùng chung `useChoGhiTang` với web nên đã theo tích từ trước.
- Sửa ít dòng ở `MLapPhieu.tsx`, `MDtThuChiLap.tsx` khi T552 của Trum còn dở: ai push sau gộp tay.

## Đã kiểm

- `npm run typecheck`, `npm run build`, `python tools/kiem_tra.py --nhanh`: không lỗi.
- Trình duyệt cỡ 375x812, CHI26 tích phân bổ trong phiên: danh sách, chi tiết hiện đúng; phiếu chi CHI26 không còn nhãn Chi phí, lưu xong hiện hộp Tạo thẻ chi phí phân bổ.

## Dở dang

- Báo cáo chi phí (`LY_CHI_PHI`, `home/chiPhiPhieu.ts`) vẫn đọc tích Là chi phí từ dữ liệu mẫu.
- Chưa push, chờ người dùng bảo.
