# Điện thoại đợt 12: lập phiếu kho, xuất bán POS, công thức, số dư ban đầu (T209, T186, T188, T189)

- Ngày: 14/10/2026
- Người: Trum, agent: Claude Code điều phối và kiểm; Anti B (Antigravity WSL) làm T209; Anti A (Antigravity Windows) làm T186, T188, T189
- Trạng thái cuối phiên: Xong

## Đã làm

- T209 `MLapPhieuKho.tsx` (mới), `MLapPhieu.tsx`, `MChungTu.tsx`: lập và sửa phiếu kiểm kê, điều chỉnh (xuất, nhập), sản xuất, điều chuyển trên điện thoại theo các bước có sẵn. Kiểm kê tự tính chênh lệch thừa, thiếu. Sản xuất kéo nguyên vật liệu theo công thức. Điều chuyển từ chối kho nhận trùng kho xuất ngay ở tấm chọn.
- T186 `MXuatBanPos.tsx` (mới): chip ngày, chi nhánh, kênh bán, danh sách đơn dạng thẻ, tổng doanh thu, tấm chi tiết đơn, nút Đồng bộ theo POS.
- T188 `MCongThuc.tsx` (mới): Công thức sơ chế 5.1.5, chế biến 9.1.3: thẻ công thức, ô tìm, công tắc hoạt động, tấm xem định lượng, thêm, sửa từ đáy.
- T189 `MSoDuBanDau.tsx` (mới): Số dư ban đầu 10.1.3 theo tab (tài khoản, tiền, công nợ khách hàng, nhà cung cấp, tồn kho) và `tien/so-du-ban-dau` của gói Free; tổng cuối tab, tấm sửa số dư.
- File máy tính chỉ thêm `export`: `ChungTuBanHang.tsx`, `CongThuc.tsx`, `SoDuBanDau.tsx`.
- `tools/kiem_tra.py`: `kiem_tra_dot_12_a`, `kiem_tra_dot_12_b`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `kiem_tra.py --nhanh`, `--dien-thoai` (cổng 5181): Không có lỗi.
- Lập thành công trên 390px: KK2610-0261, XDC2610-0261, XCB2610-0261, CK2610-0261, mỗi phiếu hiện lại trong danh sách.
- Xem 9 ảnh 390px của đợt 12.
- Chưa thử trên điện thoại thật.

## Dở dang, việc tiếp theo

- Đợt 13: T208 chỉnh giao diện đang có (Anti B), T192 tiện ích bổ sung (Anti A).
- Chip "Kho/CN" ở Xuất bán POS và tab "Công nợ" ở Số dư ban đầu bị cắt chữ ở mép phải, hàng chip cuộn ngang được. Xem lại ở T208.

## Bẫy, quyết định mới

- `MChon` có chế độ `apDung`: chạm dòng chỉ đánh dấu, phải bấm "Áp dụng" mới chọn. Bước kiểm bấm dòng mà không bấm Áp dụng thì giá trị không đổi.
- Tấm chọn loại phiếu nằm trên các tab cùng tên ("Xuất điều chỉnh"). Bộ chọn chung kiểu `[role="button"]` bắt nhầm tab bị lớp phủ che, click treo 30 giây. Dùng `.m-tam-ds .m-tam-dong`.
