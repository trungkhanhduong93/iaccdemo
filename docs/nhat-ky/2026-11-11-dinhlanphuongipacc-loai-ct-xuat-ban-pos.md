# Loại chứng từ Xuất bán POS, giữ tab khi đóng phiếu, tách cột hoá đơn (T791)

- Ngày: 11/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/ban-hang/ChungTuBanHang.tsx`: dòng FABi có `tenLoaiCt: 'Xuất bán POS'`, cột Loại chứng từ không còn trống ở tab Tất cả, Xuất bán POS.
- Cùng file: tab đang đứng giữ trong `TAB_NHO` (Map theo đường dẫn màn, sống trong phiên), mở phiếu rồi đóng thì về đúng tab. Tải lại trang thì về Tất cả.
- Cùng file: cột Số hoá đơn tách thành `mauKhHd` (Mẫu số - Ký hiệu, vd 2C26TAA) và `hddt` (chỉ số hoá đơn, vd 00000124), chữ thường như ô khác.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Chưa mở trình duyệt xem bằng mắt.

## Dở dang, việc tiếp theo

- Không.
- Trang đang đứng (số trang) chưa giữ khi đóng phiếu, chỉ giữ tab.

## Bẫy, quyết định mới

- Không.
