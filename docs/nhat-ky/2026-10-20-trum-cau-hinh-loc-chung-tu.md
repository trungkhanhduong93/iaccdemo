# Cấu hình tham số lọc danh sách chứng từ như IVT (T504)

- Ngày: 20/10/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/LocNangCao.tsx`, `BoLoc`: chế độ `chiNutPheu` (thanh Figma của T496) có lại mục Cấu hình tham số lọc. Ô bật ra ngoài xếp sau nút phễu, đúng thứ tự đã kéo. Prop mới `ngoaiRieng` cho màn truyền bản riêng của ô hiện ngoài. Lưới trong hộp lọc chỉ còn các ô chưa bật ra ngoài.
- `src/ui/generic/VoucherScreen.tsx`: ô tìm, ô khoảng ngày kiểu Figma chuyển vào `ngoaiRieng`, nên tắt được trong cấu hình như IVT. Mặc định chỉ Thời gian, Tìm kiếm ra ngoài, giữ nguyên thanh như trước.
- `src/styles/app.css`, mục cuối T504: ô lọc ngoài thanh Figma có nhãn nằm trong ô, cao 36px như ô tìm.

## Đã kiểm

- `npm run typecheck`, `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Chụp Playwright màn Thu chi 2.1.1: mặc định có ô tìm, không có ô Đối tượng ngoài. Hộp lọc có mục cấu hình với 6 ô. Bật Đối tượng thì ô hiện ngoài thanh, nhãn nằm trong ô.

## Dở dang, việc tiếp theo

- Máy nào đã lưu cấu hình ô ngoài từ trước T496 (vd Lý do, Đối tượng bật) thì thanh sẽ hiện lại các ô đó. Muốn về mặc định thì tắt trong Cấu hình tham số lọc.

## Bẫy, quyết định mới

- Không.
