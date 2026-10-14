# Bấm số chứng từ trên báo cáo mở chứng từ (T201)

- Ngày: 14/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- File mới `src/ui/generic/SoChungTu.tsx`: `duongPhieu(so)` dò số chứng từ trong phiếu mẫu của mọi màn có `voucher` (cùng cách sinh với `useDongChungTu`: `phieuThem`, `rowsMau`, `gopLoai`, `chungTu`), ra `/app/<phân hệ>/<màn>/<id>`; thêm Xuất bán POS 3.1.1 (màn riêng) theo thứ tự danh sách khi đồng bộ tổng hợp theo kênh. Bảng số dựng một lần. `ganMoPhieu(cols)` gắn liên kết cho cột `so`, `soCt`, `soHieu`, `soHd`; dòng tổng, dòng nhóm giữ chữ.
- `ReportScreen.tsx`: mọi bảng báo cáo qua `ganMoPhieu` (tờ in và bảng dữ liệu). Bản xuất file vẫn là chữ.
- `bao-cao/cong-no.tsx`: popup Lịch sử công nợ cũng qua `ganMoPhieu`.
- Bấm Đóng ở phiếu quay lại báo cáo (`useDong` dùng `nav(-1)`), không phải sửa.
- PhuongXT chọn cách 2 cho sổ tự đánh số: `phieuTheoSo` không thấy số trong phiếu mẫu thì lấy phiếu thật cùng tiền tố, cùng tháng theo thứ tự (đuôi số là thứ tự, đuôi chữ hoặc không đuôi lấy theo mã ký tự), ô hiện số phiếu thật. Đọc được các dạng PT2609-0002, BH2609-01, PC2609-L, BH2609, PT000001/9/2026 (bộ sổ TT152); tiền tố không có màn riêng đổi qua `TIEN_TO_KHAC` (PN sang NK, NM sang MH, PX sang XK, XB, BH sang BH, HDB); mã hoá đơn FABi 12 ký tự lấy một phiếu Xuất bán POS. KH (khấu hao), KC (kết chuyển) không có phiếu, giữ chữ.
- `cong-no.tsx`: phiếu mua của nhà cung cấp trong lịch sử công nợ đổi tiền tố NK thành MH để mở phiếu mua hàng.
- `TrungTam.tsx`: chip "Gói đang dùng mở x/y báo cáo" không đếm báo cáo chỉ mở từ báo cáo khác (Chi tiết mua hàng, T200); trước ghi 29/29 trong khi danh sách có 28.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Đếm ô số chứng từ có liên kết ở mọi báo cáo (gói Free, Standard, Plus, Playwright): Chi tiết mua hàng 50/50, Bảng kê mua hàng theo hàng hoá 50/50, Chi tiết nhập kho 50/50, Chi tiết xuất kho 50/50, Chi tiết bán hàng 50/50.
- Sau cách 2 (gói Standard TT58, Plus; hộ kinh doanh Góc Nhỏ nhóm 3): Sổ ngân hàng 49/49, Sổ chi phí 13/13, S1 7/7, S2d 8/8, S4a 8/8, S2c-DNSN 4/4, S2b-DNSN 7/8 (KH khấu hao), S4d 1/2 (KC kết chuyển), S2e-HKD đủ, S2b-HKD 46/46, S2c-HKD 34/35 (KH), S2d-HKD 7/7; popup lịch sử công nợ đủ.
- Bấm MH2609-0058 ở Bảng kê mở Phiếu mua hàng MH2609-0058, tổng 11.677.940 khớp; NVZ9Z3H3C8MU ở Chi tiết bán hàng mở Xuất bán POS 3-1-1/330 đúng số.

## Dở dang, việc tiếp theo

- Sổ nhiều dòng mà tháng có ít phiếu cùng loại (vd S2e-HKD, phiếu thu tháng 9 chỉ vài phiếu) thì nhiều dòng sổ trỏ cùng một phiếu, số lặp lại; tiền trên sổ khác tiền phiếu (cách 2). Muốn khớp hẳn thì cho từng sổ lấy dòng từ phiếu thật.
- Bản xuất Excel, PDF vẫn ghi số chứng từ của sổ, chưa đổi sang số phiếu thật.
- Xuất bán POS: liên kết theo thứ tự danh sách khi đồng bộ tổng hợp theo kênh (mặc định). Đơn vị chọn đồng bộ chi tiết theo hoá đơn thì thứ tự khác, liên kết mở phiếu đầu danh sách.

## Bẫy, quyết định mới

- Không.
