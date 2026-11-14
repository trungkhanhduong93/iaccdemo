# Điện thoại: bỏ tab thừa ở màn mua hàng (T832)

- Ngày: 14/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Xuất bán POS giữ tab Báo cáo theo dõi như màn mua hàng cho đồng nhất (người dùng đổi ý giữa chừng), `MDsChungTuChuan.tsx` không đổi.
- `src/ui/mobile/MChungTu.tsx`: thanh tab mua hàng (gói trên Standard) bỏ tab Hoá đơn mua hàng, Trả lại hàng mua khỏi màn Chứng từ mua hàng, Chi phí mua hàng. Màn Hoá đơn mua hàng, Trả lại hàng mua chỉ còn tab của mình và Báo cáo theo dõi, giống Hàng bán trả lại ở T830.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `KIEM_TRA_URL=http://localhost:5183/ python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- `kiem_van.py` 2 file đã sửa: không có mục ĐỎ.
- Trình duyệt 375px, gói Plus: Xuất bán POS: Xuất bán POS, Báo cáo theo dõi; Bán hàng: Bán hàng, Báo cáo theo dõi; 4.1.1: Chứng từ mua hàng, Chi phí mua hàng, Báo cáo theo dõi; 4.1.2: Hoá đơn mua hàng, Báo cáo theo dõi; 4.1.4: Trả lại hàng mua, Báo cáo theo dõi.

## Dở dang, việc tiếp theo

- Không.
- Commit chỉ nằm trên máy, chưa push: người dùng dặn khi nào bảo mới push.
- `python tools/xuat_bao_cao_he_thong.py` vẫn lỗi `No module named 'build_present'`, chưa làm mới file Excel.

## Bẫy, quyết định mới

- Không.
