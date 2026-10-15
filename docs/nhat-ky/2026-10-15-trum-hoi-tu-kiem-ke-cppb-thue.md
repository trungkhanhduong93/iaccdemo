# Sơ đồ hội tụ gói Free cho Kiểm kê, Chi phí phân bổ, Kê khai thuế (T267)

- Ngày: 15/10/2026
- Người: Trum, agent: Claude Code khảo sát, điều phối và kiểm, Antigravity Windows (Anti A) code, chạy kiểm, xem ảnh
- Trạng thái cuối phiên: T267 Xong

## Đã làm

Ở gói Free, 3 phân hệ dưới đây đổi từ sơ đồ luồng (`luongFree` + `baoCaoFree`) sang sơ đồ hội tụ (`hoiTuFree`). Kiểu vẽ giống Thu chi, Mua hàng, Bán hàng: các làn nghiệp vụ đổ về khối Sổ sách, báo cáo. Gói khác giữ nguyên.

- `kho/quy-trinh.ts` (Kiểm kê):
  - Làn Nhập hàng: Mua hàng.
  - Làn Xuất hàng: Bán hàng.
  - Làn Kiểm kê: Tồn hệ thống, Kiểm kê kho, Xuất điều chỉnh, Nhập điều chỉnh.
  - Khối ra: 6 báo cáo, giữ thứ tự cũ (5.2.3, 5.2.15, 5.2.11, 5.2.12, 5.2.9, 5.2.10).
- `ccdc/quy-trinh.ts` (Chi phí phân bổ):
  - Làn Chi tiền: Chi tiền mặt, Chi ngân hàng.
  - Làn Thẻ chi phí phân bổ: Thẻ chi phí phân bổ, Thẻ CPPB dư đầu kỳ.
  - Khối ra: Bảng chi tiết phân bổ chi phí.
- `thue/quy-trinh.ts` (Kê khai thuế):
  - Làn Lập tờ khai: 4 bước của T261, đường dẫn `thue/to-khai?buoc=1..4` giữ nguyên.
  - Khối ra: 5 sổ TT152 cũ.
- `QuyTrinhScreen.tsx`: khoá React của ô đổi thành `di-tên-thứ tự`. Lý do: một làn có 2 ô cùng đường dẫn `ccdc/8-1-1`.
- `MQuyTrinh.tsx`: bản điện thoại đọc sơ đồ hội tụ gói Free, và thay khối báo cáo bằng `raFree` như bản web.
- `tools/kiem_tra.py`:
  - Thêm `kiem_tra_dot_22_a` (web) và `kiem_tra_dot_22_b` (điện thoại).
  - Hàm kiểm cũ của T123, T262, T261 chuyển sang kiểm sơ đồ mới, vẫn kiểm đủ đường dẫn cũ.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh` (cổng 5181): `Không có lỗi.`
- `--dien-thoai`: đợt 22B không lỗi. Còn 1 lỗi đã biết: màn Chi phí NVL chưa có bản điện thoại (T242).
- Anti A xem ảnh `tools/shots/qt-22-*.png`, `m-22-*.png`, so với sơ đồ Thu chi gói Free. Claude chưa tự xem ảnh.

## Dở dang, việc tiếp theo

- PhuongXT cần xem lại sơ đồ Kê khai thuế và Kiểm kê gói Free. Hai sơ đồ này đổi so với bản PhuongXT làm ở T261, T262.
- Sơ đồ luồng cũ của Kiểm kê có chữ trên mũi tên: tổng hợp, so sánh, thiếu, thừa. Sơ đồ hội tụ chỉ còn chữ "so sánh".

## Bẫy, quyết định mới

- Sơ đồ hội tụ dùng `di` làm khoá React. Hai ô cùng đường dẫn thì React báo trùng khoá, nên khoá giờ ghép thêm tên và thứ tự.
