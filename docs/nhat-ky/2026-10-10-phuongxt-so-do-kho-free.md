# Vẽ lại sơ đồ Kho gói Free (T123)

- Ngày: 10/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `kho/quy-trinh.ts`: thêm `hoiTuFree` theo dạng hội tụ như Mua hàng, Bán hàng. Bốn làn:
  - Nhập kho: Phiếu mua hàng.
  - Xuất kho: Xuất bán POS.
  - Kiểm kê: Tồn hệ thống, mũi tên chữ "đối chiếu", Kiểm kê kho.
  - Điều chỉnh: Xuất điều chỉnh (hàng thiếu), Nhập điều chỉnh (hàng thừa).
- Các làn đổ về khối Báo cáo (Báo cáo xuất nhập tồn).
- Tồn hệ thống và hai ô điều chỉnh là ô chỉ để xem: gói Free không mở Tồn kho tức thời; phần thiếu, thừa do phiếu kiểm kê tự hạch toán. Các gói khác giữ sơ đồ cũ.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Xem trên trình duyệt gói Free, màn Kho, Quy trình: đủ bốn làn và khối Báo cáo.
- `python tools/xuat_bao_cao_he_thong.py` không chạy được trên máy này (thiếu `../Present/tools/build_present`), chưa làm mới file Excel.

## Dở dang, việc tiếp theo

- Không. Khi có màn Xuất, Nhập điều chỉnh riêng thì gắn đường dẫn vào hai ô điều chỉnh.

## Bẫy, quyết định mới

- Không.
