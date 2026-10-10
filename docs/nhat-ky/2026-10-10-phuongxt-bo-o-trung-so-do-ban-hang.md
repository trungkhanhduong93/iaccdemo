# Bỏ ô trùng ở sơ đồ Bán hàng gói Free (T121)

- Ngày: 10/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `ban-hang/quy-trinh.ts`: bỏ ô tĩnh Đơn POS từ FABi trong làn Bán hàng từ FABi của `hoiTuFree`; mũi tên chữ "đồng bộ" giờ đi từ nhãn làn sang Xuất bán POS.
- `modules/types.ts`: `LanQT` thêm `icon?` cho biểu tượng nhãn làn; `QuyTrinhScreen.tsx` dùng `l.icon ?? l.nut[0].icon`, nên nhãn làn vẫn giữ biểu tượng máy POS.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Xem trên trình duyệt gói Free: Bán hàng từ FABi, đồng bộ, Xuất bán POS, Báo cáo.
- `python tools/xuat_bao_cao_he_thong.py` không chạy được trên máy này (thiếu `../Present/tools/build_present`), chưa làm mới file Excel.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
