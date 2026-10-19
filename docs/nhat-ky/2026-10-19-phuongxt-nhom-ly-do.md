# Danh mục Nhóm lý do nghiệp vụ (T473)

- Ngày: 19/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `data/mock.ts`: `NHOM_LY_DO` 6 nhóm a đến f, tên đúng 6 mục chi phí hợp lý của Sổ S2c-HKD (TT152) PhuongXT chụp gửi; `nhomLyTuDong(ten)` xếp lý do theo tên: lãi vay vào e; lương, tiền công, bảo hiểm vào b; tài sản cố định, khấu hao, chờ phân bổ vào c; điện, nước, internet, vận chuyển, thuê, sửa chữa, bảo dưỡng, giặt, an ninh, tư vấn, in ấn vào d; nguyên liệu, vật liệu, nhiên liệu, năng lượng, công cụ, hàng hoá vào a; còn lại vào f. `LY_DO` thêm `nhomCp` cho 24 lý do là chi phí.
- `danh-muc/index.ts`: màn `nhom-ly-do` Danh mục nhóm lý do nghiệp vụ ngay sau Lý do nghiệp vụ, mọi gói, chỉ xem, không thêm (nhóm cố định theo thông tư); cột Mã, Tên nhóm, Số lý do. Lý do nghiệp vụ thêm cột Nhóm lý do (tên dài cắt "...", rê chuột xem đủ).
- `danh-muc/truong-dm.ts`: form Lý do nghiệp vụ có ô Nhóm lý do nghiệp vụ (bắt buộc) khi Dùng cho Chi tiền và tích Là chi phí; `doi` tích Là chi phí, đổi tên, đổi Dùng cho thì lý do chưa có nhóm tự xếp nhóm, bỏ tích thì bỏ nhóm; `chiSua` thêm `nhomCp` để lý do có sẵn đổi được nhóm.
- Chưa nối báo cáo: S2c-HKD vẫn chia 6 mục bằng tỷ lệ mẫu (`MUC_CHI_PHI` ở `bao-cao/tt152.ts`), chưa cộng theo nhóm của lý do trên phiếu chi.

## Đã kiểm

- `npm run typecheck`, `npm run build`, `python tools/kiem_tra.py --nhanh`: không lỗi.
- Trình duyệt gói Free: tab Nhóm lý do nghiệp vụ có 6 nhóm, Số lý do 2, 2, 1, 11, 1, 7 (đủ 24), không có nút Thêm. Lý do nghiệp vụ: cột Nhóm lý do hiện nhóm của 24 lý do chi phí. Mở Chi tiền nộp thuế, tích Là chi phí thì hiện ô nhóm, tự chọn f. Không lưu.

## Dở dang, việc tiếp theo

- Nếu cần: S2c-HKD (và Sổ chi phí) cộng chi phí theo nhóm của lý do trên phiếu chi thay cho tỷ lệ mẫu.

## Bẫy, quyết định mới

- Không.
