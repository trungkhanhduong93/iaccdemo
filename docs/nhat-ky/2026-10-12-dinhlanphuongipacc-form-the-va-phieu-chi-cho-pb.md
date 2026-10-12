# Gọn form thẻ chi phí; phiếu chi chờ phân bổ có thẻ chi phí (T165, T168)

- Ngày: 12/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

T165, form và danh sách thẻ chi phí:

- `ccdc/the-phan-bo.tsx`: khối Thông tin chung `anDau: true` (không thanh tiêu đề). Thẻ ghi tăng không có nút xoá dòng, Thêm dòng, Xoá hết; thẻ dư đầu kỳ giữ cả ba. Sửa thẻ ghi tăng có sẵn: Ngày ghi tăng, Số tiền, Đơn giá (CCDC) chỉ đọc; CCDC sửa số lượng thì đơn giá = số tiền / số lượng.
- `ccdc/the-phan-bo.tsx`: ngừng phân bổ gói Free, Standard chọn tháng (ô `OThang`: gõ mm/yyyy hoặc bảng 12 tháng kiểu `kn-*`, lưu ngày cuối tháng); Plus, Pro chọn ngày. Đổi từ T159 (trước là Standard, Plus).
- `ccdc/index.ts`: danh sách thẻ bỏ cột Số kỳ phân bổ.
- `danh-muc/truong-dm.ts`: `KhoiDM.anDau`; `TruongDM.chiDoc` nhận hàm theo giá trị form.
- `ui/generic/CatalogScreen.tsx`: vẽ khối `anDau`; chế độ xem ẩn cột `_xoa` và nút dưới lưới (`chan`); danh sách `dsChungTu` không có cột Trạng thái; `chiDoc` dạng hàm.

T168, Thu chi:

- `tien/index.ts`: phiếu chi mẫu PC2610-0261 (Chi phí chờ phân bổ, Tiền nhà 6 tháng, 72.000.000, Lê Lợi) qua `phieuThem`, có `_theCp: ['TPB2610-0011']`.
- `types.ts`, `VoucherScreen.tsx`: `VoucherCfg.phieuThem` thêm phiếu mẫu cố định lên đầu danh sách. Cột Lý do thu, chi đổi tên thành Lý do.
- `ccdc/index.ts`: thẻ mẫu TPB2610-0011 trỏ về PC2610-0261, cùng chi nhánh với phiếu.
- `ChungTuForm.tsx`: phiếu chi có dòng Chi phí chờ phân bổ và `_theCp` thì có dòng tham chiếu "Thẻ chi phí:" dưới đầu phiếu (kiểu `ct-tham-chieu`), bấm mở thẻ. Phiếu Thu, chi tiền (2.1.1) bỏ ô Mã số thuế. Đầu phiếu thu chi (trừ chuyển quỹ) gọn 3 hàng: Ghi chú lên cột giữa dưới Địa chỉ.
- `CatalogScreen.tsx`: `?mo=<số>` mở thẳng một dòng có sẵn.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py --loai giao-dien` các file đã sửa: không ĐỎ (`ChungTuForm.tsx` 1 VÀNG có sẵn).
- Thử tay: form thẻ ở 1366x607 thấy đủ 3 dòng; thẻ dư đầu kỳ có nút xoá dòng, Thêm dòng, Xoá hết, thẻ ghi tăng không có; Free chọn Thg 12 lưu 31/12/2026, tab Đã phân bổ ngừng từ kỳ đó; sửa thẻ ghi tăng thì Ngày ghi tăng, Số tiền chỉ đọc; phiếu PC2610-0261 hiện Thẻ chi phí, bấm mở TPB2610-0011, từ thẻ bấm PC2610-0261 mở lại phiếu; phiếu chuyển quỹ giữ bố cục cũ.
- Chưa thử: chế độ xem của thẻ dư đầu kỳ đã lưu (mẫu không có thẻ dư đầu kỳ, thẻ mới không lưu lại); phiếu mua, bán (nhánh code không đổi).
- `python tools/xuat_bao_cao_he_thong.py`: không chạy được trên máy này (thiếu `build_present` ở thư mục `Present/tools` ngoài repo), file Excel chưa làm mới.

## Dở dang, việc tiếp theo

- Ô Thẻ chi phí chỉ có ở phiếu mẫu PC2610-0261: thẻ tạo từ phiếu mới chưa lưu lại được nên chưa tra ngược về phiếu.
- Lỗi có sẵn ghi thành T169: gõ đổi địa chỉ từ phiếu này sang phiếu khác thì form giữ số phiếu, đối tượng của phiếu cũ.
- Trum cần xem: đầu phiếu thu chi bỏ Mã số thuế, Ghi chú lên cột giữa (khác bố cục T77, T78 ở `docs/QUYET-DINH.md`).

## Bẫy, quyết định mới

- Không.
