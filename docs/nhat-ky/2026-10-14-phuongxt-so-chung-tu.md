# Bấm số chứng từ trên báo cáo mở chứng từ (T201)

- Ngày: 14/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Dở dang

## Đã làm

- File mới `src/ui/generic/SoChungTu.tsx`: `duongPhieu(so)` dò số chứng từ trong phiếu mẫu của mọi màn có `voucher` (cùng cách sinh với `useDongChungTu`: `phieuThem`, `rowsMau`, `gopLoai`, `chungTu`), ra `/app/<phân hệ>/<màn>/<id>`; thêm Xuất bán POS 3.1.1 (màn riêng) theo thứ tự danh sách khi đồng bộ tổng hợp theo kênh. Bảng số dựng một lần. `ganMoPhieu(cols)` gắn liên kết cho cột `so`, `soCt`, `soHieu`, `soHd`; dòng tổng, dòng nhóm giữ chữ.
- `ReportScreen.tsx`: mọi bảng báo cáo qua `ganMoPhieu` (tờ in và bảng dữ liệu). Bản xuất file vẫn là chữ.
- `bao-cao/cong-no.tsx`: popup Lịch sử công nợ cũng qua `ganMoPhieu`.
- Bấm Đóng ở phiếu quay lại báo cáo (`useDong` dùng `nav(-1)`), không phải sửa.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Đếm ô số chứng từ có liên kết ở mọi báo cáo (gói Free, Standard, Plus, Playwright): Chi tiết mua hàng 50/50, Bảng kê mua hàng theo hàng hoá 50/50, Chi tiết nhập kho 50/50, Chi tiết xuất kho 50/50, Chi tiết bán hàng 50/50.
- Bấm MH2609-0058 ở Bảng kê mở Phiếu mua hàng MH2609-0058, tổng 11.677.940 khớp; NVZ9Z3H3C8MU ở Chi tiết bán hàng mở Xuất bán POS 3-1-1/330 đúng số.

## Dở dang, việc tiếp theo

- Chưa bấm được ở các sổ tự sinh số riêng, không khớp phiếu nào: Sổ ngân hàng 2.2.3 (49 ô, số PT, PC đánh lại từ 0001 mỗi tháng trong `soChiTiet` ở `gen.ts`, còn phiếu thật đánh số nối tiếp, vd PC2610-0261), Sổ chi phí 10.4.3, bộ sổ TT58 (S1 đến S4d), TT152 (S1a đến S2e), popup Lịch sử công nợ (`cong-no.tsx`). Cần PhuongXT chọn: (1) cho các sổ này lấy dòng từ phiếu thật (số, tiền khớp phiếu; làm từng sổ, việc lớn), hoặc (2) chỉ thay số chứng từ của sổ bằng số phiếu thật cùng loại, cùng tháng (bấm mở được nhưng tiền trên sổ khác tiền phiếu).
- Xuất bán POS: liên kết theo thứ tự danh sách khi đồng bộ tổng hợp theo kênh (mặc định). Đơn vị chọn đồng bộ chi tiết theo hoá đơn thì thứ tự khác, liên kết mở phiếu đầu danh sách.

## Bẫy, quyết định mới

- Không.
