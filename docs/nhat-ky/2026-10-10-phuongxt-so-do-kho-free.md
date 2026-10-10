# Vẽ lại sơ đồ Kho gói Free (T123)

- Ngày: 10/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Ý của PhuongXT: mua hàng, bán hàng làm hệ thống tổng hợp được tồn hệ thống; kiểm kê kho so sánh với tồn hệ thống mới ra chênh lệch, thiếu thì xuất điều chỉnh, thừa thì nhập điều chỉnh. Bản đầu vẽ kiểu làn hội tụ không đúng ý này nên bỏ.
- `modules/types.ts`: thêm `CotQT` và `QuyTrinhDef.luongFree` (sơ đồ luồng theo cột cho gói Free); `NutQT.tone` thêm `'kq'` cho ô kết quả hệ thống tự tổng hợp.
- `QuyTrinhScreen.tsx`: thành phần `SoDoLuong`. Ô cột trước nối tới mọi ô cột sau bằng đường gấp khúc qua một trục đứng, nên gộp (2 vào 1) và tách nhánh (1 ra 2) đều vẽ được. Chữ trên mũi tên lấy `noi` của ô, thiếu thì lấy `noi` của cột. Khung Báo cáo bên phải giữ như sơ đồ thường.
- `kho/quy-trinh.ts`: `luongFree` bốn cột:
  - Mua hàng, Bán hàng.
  - "tổng hợp", Tồn hệ thống (ô kết quả, không bấm được).
  - "so sánh", Kiểm kê kho.
  - "thiếu" Xuất điều chỉnh, "thừa" Nhập điều chỉnh (chữ trên mũi tên đã nói thiếu, thừa nên tên ô không ghi lại); hai ô chỉ để xem vì phiếu kiểm kê tự hạch toán chênh lệch.
- Dòng mô tả dưới tiêu đề sơ đồ ở gói Free (`QuyTrinhDef.moTaFree`): "Gói Free theo dõi tồn kho với hàng bán thẳng: mua về bán ra nguyên đơn vị, không qua chế biến."
- Đã thử thêm khối Báo cáo vào cuối sơ đồ, rồi xoay dọc sơ đồ; PhuongXT xem xong chọn quay về bản ngang này, khung Báo cáo riêng bên phải.
- `app.css`: mục cuối "Sơ đồ luồng theo cột, quy trình Kho gói Free (T123)"; ô kết quả nền nhạt, viền nét đứt.
- Các gói khác giữ sơ đồ Kho cũ.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Xem trên trình duyệt gói Free, màn Kho, Quy trình: đường gộp, tách và chữ trên mũi tên đúng chỗ.
- `python tools/xuat_bao_cao_he_thong.py` không chạy được trên máy này (thiếu `../Present/tools/build_present`), chưa làm mới file Excel.

## Dở dang, việc tiếp theo

- Không. Khi có màn Xuất, Nhập điều chỉnh riêng thì gắn đường dẫn vào hai ô điều chỉnh.

## Bẫy, quyết định mới

- Không.
