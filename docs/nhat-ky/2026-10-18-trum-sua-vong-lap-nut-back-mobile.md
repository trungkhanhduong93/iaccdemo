# Sửa vòng lặp nút quay lại trên điện thoại (T431)

- Ngày: 18/10/2026
- Người: Trum, agent: Antigravity
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MobileShell.tsx`: Thêm hàm `manGocCuaTab(pathname)` xác định màn gốc của 4 tab chính (`/app/trang-chu/tong-quan`, `/app/nghiep-vu`, `/app/bao-cao/tat-ca`, `/app/khac`). Nút quay lại tổng `quayLai` lùi lịch sử khi có lịch sử trong app (`window.history.state?.idx > 0`); khi mở link trực tiếp (idx = 0) thì về màn gốc của tab tương ứng bằng `replace: true`. Cập nhật `laManGoc` cho `/app/bao-cao/tat-ca` khi có tham số `nhom=`.
- `src/ui/mobile/MXemPhieu.tsx`: Nút quay lại `.m-pb-btn-back` gọi `quayLai` lùi lịch sử hoặc `nav(path, { replace: true })`, không đẩy thêm entry danh sách vào lịch sử gây lặp qua lại. Xoá chứng từ dùng `replace: true`.
- `src/ui/mobile/MBaoCao.tsx`: Nút "Tất cả nhóm" `.m-bc-nhom-back` dùng `nav(-1)` hoặc `replace: true` về `/app/bao-cao/tat-ca` thay vì push entry mới.
- `src/ui/mobile/MLapPhieu.tsx`: Lưu chứng từ sau khi sửa (`dangSua`) lùi lịch sử `nav(-1)` để gỡ URL form sửa khỏi history. Màn thành công sau khi tạo mới phiếu: nút Đóng, Trang danh sách và Xem phiếu đều dùng `{ replace: true }`.
- `src/ui/mobile/MLapPhieuKho.tsx`: Đồng bộ xử lý lưu khi `dangSua`, phiếu kiểm kê `laKk` và các nút màn thành công với `{ replace: true }`.
- `src/ui/mobile/MCcdc.tsx`: Điều hướng về phiếu gốc `tuPhieu._goc` sau khi lưu hoặc huỷ tạo thẻ CCDC dùng `{ replace: true }`.
- `src/ui/generic/CatalogScreen.tsx`: Đóng form tạo thẻ CCDC mở từ phiếu chi (`veGoc`) dùng `nav(g, { replace: true })`.
- `backup/test_t431.py` & `backup/T431-khao-sat.md`: Bộ kiểm Playwright 5 kịch bản tự động tái hiện và nghiệm thu hết 100% hiện tượng lặp.

## Đã kiểm

- `python backup/test_t431.py`: 5/5 luồng đều PASS (Flow 1: Xem phiếu -> Back -> Back; Flow 2: Báo cáo nhóm -> Tất cả nhóm -> Back; Flow 3: Sửa phiếu -> Lưu -> Back; Flow 4: Nghiệp vụ -> Danh sách -> Back dừng đúng màn gốc; Flow 5: Lập phiếu mới -> Đóng -> Back không lặp).
- `npm run typecheck`: tsc --noEmit không báo lỗi.
- `npm run build`: vite build thành công (2.63s).
- `python tools/kiem_tra.py --nhanh`: Đã kiểm 208 lượt mở màn, Không có lỗi.
- `python tools/kiem_van.py` các file đã sửa: 7/7 file sạch (0 ĐỎ, 0 VÀNG).

## Dở dang, việc tiếp theo

- Không. Tiếp tục T432 (Báo cáo S1a-HKD mobile) theo kế hoạch bàn giao.

## Bẫy, quyết định mới

- Không.
