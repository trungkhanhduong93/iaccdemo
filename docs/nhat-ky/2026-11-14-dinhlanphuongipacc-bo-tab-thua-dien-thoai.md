# Điện thoại: bỏ tab thừa ở Xuất bán POS, mua hàng (T832)

- Ngày: 14/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MDsChungTuChuan.tsx`: `HangTabsBanHang` không hiện tab Báo cáo theo dõi ở Xuất bán POS (3.1.1 chứng từ FABi). Các màn bán hàng khác giữ tab này.
- `src/ui/mobile/MChungTu.tsx`: thanh tab mua hàng (gói trên Standard) bỏ tab Hoá đơn mua hàng, Trả lại hàng mua khỏi màn Chứng từ mua hàng, Chi phí mua hàng. Màn Hoá đơn mua hàng, Trả lại hàng mua chỉ còn tab của mình và Báo cáo theo dõi, giống Hàng bán trả lại ở T830.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `KIEM_TRA_URL=http://localhost:5183/ python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- `kiem_van.py` 2 file đã sửa: không có mục ĐỎ.
- Trình duyệt 375px, gói Plus: Xuất bán POS chỉ một tab; Bán hàng: Bán hàng, Báo cáo theo dõi; 4.1.1: Chứng từ mua hàng, Chi phí mua hàng, Báo cáo theo dõi; 4.1.2: Hoá đơn mua hàng, Báo cáo theo dõi; 4.1.4: Trả lại hàng mua, Báo cáo theo dõi.

## Dở dang, việc tiếp theo

- Không.
- Commit chỉ nằm trên máy, chưa push: người dùng dặn khi nào bảo mới push.
- `python tools/xuat_bao_cao_he_thong.py` vẫn lỗi `No module named 'build_present'`, chưa làm mới file Excel.

## Bẫy, quyết định mới

- Không.
