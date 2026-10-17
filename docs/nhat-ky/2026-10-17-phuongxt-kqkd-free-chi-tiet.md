# Báo cáo kết quả kinh doanh gói Free dạng chi tiết (T318)

- Ngày: 17/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/tong-hop/BaoCaoTaiChinh.tsx`: báo cáo 10.2.3 gói Free (TT152) thêm dòng con thụt lề dưới ba dòng tổng. Doanh thu bán hàng: mỗi kênh bán một dòng (Tại quán, Mang về, App giao đồ ăn), cộng từ hoá đơn FABi `theoDon` như danh sách Xuất bán POS, giảm trừ chia theo tỷ trọng kênh. Chi phí trong tháng: mỗi lý do chi một dòng. Chi phí phân bổ hàng tháng: Chi phí trả trước, Công cụ dụng cụ, Tài sản cố định. Dòng con bấm mở Xuất bán POS, Thu chi, thẻ chi phí phân bổ.
- Cột kỳ trước ghép theo khoá dòng (`_k`), không theo thứ tự dòng. Dòng con ẩn khi cả kỳ đang xem lẫn kỳ trước đều không phát sinh, để hai cột vẫn cộng khớp dòng tổng.
- `src/data/mock.ts`: hàm mới `chiPhiTheoLyDo` (chia chi phí hoạt động trừ phân bổ của `kqkd()` theo lý do chi trong danh mục 1.16, Chi phí khác nhận phần còn lại) và `phanBoTheoLoai` (CCDC chia 60% trả trước, 40% công cụ dụng cụ; khấu hao là TSCĐ).
- `src/styles/app.css`: mục cuối T318, class `.kqkd-con` thụt lề dòng con.
- Dòng tổng giữ công thức cũ, nên số trên trang chủ (thẻ lãi lỗ, Chi phí trong tháng) và Khoá sổ không đổi.

## Đã kiểm

- Xem trên máy gói Free, tháng 9/2026: 3 kênh cộng 2.776.634.000 bằng Doanh thu bán hàng; 17 lý do chi cộng 1.322.250.000 bằng Chi phí trong tháng; 3 loại phân bổ cộng 49.850.000. Bấm dòng Chi phí trả trước mở `#/app/ccdc/8-1-1`. Xem xong trả phiên về gói PL.
- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: in `Không có lỗi.` (204 lượt mở màn).
- `python tools/kiem_van.py` cho `BaoCaoTaiChinh.tsx`, `mock.ts`, `TIEN-DO.md`: sạch.
- `python tools/xuat_bao_cao_he_thong.py` không chạy được trên máy này (thiếu thư mục Present/tools ngoài repo), nên `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx` chưa làm mới.

## Dở dang, việc tiếp theo

- Không. Có thể làm thêm: màn Chi phí trong tháng ở trang chủ (`home/ChiPhiThang.tsx`, `ui/mobile/MChiPhiThang.tsx`) vẫn gộp 3 dòng, có thể dùng `chiPhiTheoLyDo` cho khớp từng dòng với báo cáo (tổng đã khớp khi xem tất cả cửa hàng).

## Bẫy, quyết định mới

- Không ghi vào `docs/BAY.md`. Lưu ý: `RptTable` thụt lề `_i` ở cột thứ hai, báo cáo không có cột Mã số thì dòng con phải tự thụt bằng `r` của cột Chỉ tiêu; bảng mang class `tbl`, không phải `rpt`.
