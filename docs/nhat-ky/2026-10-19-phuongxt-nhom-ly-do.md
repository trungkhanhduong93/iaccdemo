# Danh mục Nhóm lý do nghiệp vụ; ô chọn lựa chọn dài (T473, T474)

- Ngày: 19/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `data/mock.ts`: `NHOM_LY_DO` 6 nhóm mã NLD01 đến NLD06 (PhuongXT bảo bỏ mã a, b, c, tự đặt mã), tên đúng 6 mục a đến f chi phí hợp lý của Sổ S2c-HKD (TT152) PhuongXT chụp gửi; `nhomLyTuDong(ten)` xếp lý do theo tên, trả tên nhóm: lãi vay vào NLD05; lương, tiền công, bảo hiểm vào NLD02; tài sản cố định, khấu hao, chờ phân bổ vào NLD03; điện, nước, internet, vận chuyển, thuê, sửa chữa, bảo dưỡng, giặt, an ninh, tư vấn, in ấn vào NLD04; nguyên liệu, vật liệu, nhiên liệu, năng lượng, công cụ, hàng hoá vào NLD01; còn lại vào NLD06. `LY_DO` thêm `nhomCp` (lưu tên nhóm, nên cột, ô chọn, Bộ lọc của Lý do nghiệp vụ đều hiện tên) cho 24 lý do là chi phí.
- `danh-muc/index.ts`: màn `nhom-ly-do` Danh mục nhóm lý do nghiệp vụ ngay sau Lý do nghiệp vụ, mọi gói, chỉ xem, không thêm (nhóm cố định theo thông tư); cột Mã, Tên nhóm, Số lý do. Lý do nghiệp vụ thêm cột Nhóm lý do (tên dài cắt "...", rê chuột xem đủ).
- `danh-muc/truong-dm.ts`: form Lý do nghiệp vụ có ô Nhóm lý do nghiệp vụ (bắt buộc) khi Dùng cho Chi tiền và tích Là chi phí; `doi` tích Là chi phí, đổi tên, đổi Dùng cho thì lý do chưa có nhóm tự xếp nhóm, bỏ tích thì bỏ nhóm; `chiSua` thêm `nhomCp` để lý do có sẵn đổi được nhóm.
- Sau đó PhuongXT: nhóm không được sửa, xoá kể cả ở Lý do nghiệp vụ; thêm loại nhóm dành cho thu, chi, hiện ở danh sách. `NHOM_LY_DO` thêm `dung` (6 nhóm là Chi tiền), màn nhóm có cột Dùng cho, `nhomLoc: 'dung'`. Ô Nhóm lý do nghiệp vụ trong form Lý do có lúc để chỉ đọc, sau PhuongXT bảo cho chọn lại: ô chọn (chỉ nhóm Chi tiền), trong `chiSua`, chú thích "Tự xếp theo tên lý do, chọn lại được". Chưa có nhóm nào cho thu (chờ PhuongXT chốt nhóm thu nếu cần).
- T474 (PhuongXT: bộ lọc ô Nhóm lý do giãn hết màn, làm theo form chung): `Dropdown.tsx` `Popover` vai trò listbox đặt `maxWidth` bằng ô (ít nhất 320px); CSS mục cuối `app.css` (T474): lựa chọn trong `.pop-sel` xuống dòng, khoảng cách, đường kẻ ngăn. Áp cho mọi ô chọn dùng chung.
- Chưa nối báo cáo: S2c-HKD vẫn chia 6 mục bằng tỷ lệ mẫu (`MUC_CHI_PHI` ở `bao-cao/tt152.ts`), chưa cộng theo nhóm của lý do trên phiếu chi.

## Đã kiểm

- `npm run typecheck`, `npm run build`, `python tools/kiem_tra.py --nhanh`: không lỗi.
- Trình duyệt gói Free: tab Nhóm lý do nghiệp vụ có 6 nhóm, mã NLD01 đến NLD06, Số lý do 2, 2, 1, 11, 1, 7 (đủ 24), không có nút Thêm. Lý do nghiệp vụ: cột Nhóm lý do hiện nhóm của 24 lý do chi phí. Mở Chi tiền nộp thuế, tích Là chi phí thì hiện ô nhóm, tự chọn Các khoản chi khác. Bộ lọc Lý do nghiệp vụ có ô Nhóm lý do, danh sách là 6 tên nhóm, khung rộng 264px theo ô (trước giãn hết màn). Danh mục nhóm không có ô tích, nút Thêm, Sửa, Xoá; Sửa Thanh toán tiền điện thì chọn lại được nhóm. Không lưu.

## Dở dang, việc tiếp theo

- Nếu cần: S2c-HKD (và Sổ chi phí) cộng chi phí theo nhóm của lý do trên phiếu chi thay cho tỷ lệ mẫu.

## Bẫy, quyết định mới

- Không.
