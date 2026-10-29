# Kế hoạch đổi Hướng dẫn nhanh sang kiểu tour như Trang chủ (T681)

- Ngày: 29/10/2026
- Người: Trum, agent: Claude Code (phiên trên mây)
- Trạng thái cuối phiên: Dở dang

## Đã làm

- Trum dùng thử T680, góp ý 3 điều:
  - bấm vào vùng tối không được tắt hướng dẫn, chỉ nút Bỏ qua mới tắt;
  - form hỏi cửa hàng thì phải có bước chọn cửa hàng, Bước kế tự chọn cửa hàng đầu tiên, các bước phải đủ, mượt, không nửa vời;
  - Bỏ qua thì mọi thứ trở về như ban đầu.
- Trum đề nghị làm giống tour Trang chủ, rồi chốt 3 câu hỏi: kiểu tour như Trang chủ, máy tự bấm Lưu, Bỏ qua và Xong trả lại hết. Ghi `docs/QUYET-DINH.md` QD88, thêm việc T681 vào `docs/TIEN-DO.md`.
- Chưa sửa code. Phiên này đã quá 60 lần gọi công cụ nên dừng theo QD75.

## Đã kiểm

- Chỉ sửa tài liệu. `python tools/kiem_van.py` cho 3 file tài liệu đã sửa: không có mục ĐỎ.

## Dở dang, việc tiếp theo

Làm T681 theo QD88. Đọc trước: QD86, QD87, QD88 (`python tools/ban_do.py qd 88`), nhật ký `2026-10-29-trum-dai-buoc-vao-form.md`, `2026-10-29-trum-huong-dan-toi-tu-mo-form.md`.

Cách tour Trang chủ chạy (`src/modules/home/HuongDan.tsx`, T138 của PhuongXT, chỉ đọc, không sửa):

- Gắn vào `body` bằng portal. `.hdan` phủ cả màn, z-index 120, chặn bấm.
- `.hdan-lo` khoanh sáng bằng `box-shadow` 9999px. Không có chỗ khoanh thì `.hdan-toi` tối cả màn, bong bóng `.hdan-bong.giua` nằm giữa màn.
- `viTriBong(o, cao)` đặt bong bóng bên phải, bên trái, dưới hoặc trên chỗ khoanh, tránh tràn màn. `useCaoBong` đo chiều cao bong bóng.
- Bám chỗ khoanh mỗi khung hình bằng `requestAnimationFrame`. Hàm này không export: viết hàm riêng trong `HuongDanNhanh.tsx`, không import từ file của T138.
- Có thể dùng lại class CSS `.hdan-*` cho cùng kiểu nhìn. Class riêng thì thêm ở mục T681 cuối `app.css`.

Việc cần làm trong `src/ui/HuongDanNhanh.tsx`:

1. Thay dải `.hdn-dai`, lớp số cam `.hdn-cham`, khung đủ `.hdn-khung` bằng tour. Bong bóng đầu nằm giữa màn: `hd.muc`, nút Bắt đầu. Các bước: khoanh chỗ của khoá `o` (dùng lại `timCho`, `KHUON`, `KHUON_FORM`, `data-hd`), bong bóng có chữ bước, Bước n/N, Bỏ qua, Quay lại, Tiếp. Bong bóng cuối: `hd.luuY`, Đi tiếp gọn (`DiTiep gon`), nút Xong. Bước không tìm được chỗ thì bong bóng nằm giữa màn.
2. Bấm Tiếp làm thao tác của bước đang xem rồi mới sang bước sau:
   - Bước có `di` hoặc bước kế nằm trong form: mở form. Đã có `diMoForm`, `diToi` từ T680.
   - Form hiện `.chon-cn` (thanh trên đang xem Tất cả cửa hàng): chèn bước ảo "Chọn cửa hàng lập phiếu" khoanh `.chon-cn`, Tiếp thì bấm nút cửa hàng đầu tiên (`.chon-cn-ds button`).
   - Bước khoá `luu`: bấm nút `[data-hd="luu"]`. `ChungTuForm` đã tự đóng form khi `huongDanDangChay()` (T676). Thêm bước ảo "Phiếu vừa lưu hiện ở đầu danh sách" khoanh dòng của phiếu đó: tìm dòng có số phiếu trong `.main table.tbl`, không sửa `VoucherScreen.tsx`.
   - Bước ở màn danh sách mà form đang mở: `dongFormTren()` đóng không hỏi (T680).
3. Bỏ qua, Xong: trả lại như lúc bấm nút Hướng dẫn.
   - Lúc bắt đầu lưu đường dẫn, `s.cuaHang`.
   - Kết thúc thì đóng form (`dongFormTren`), xoá phiếu tour đã lưu, `set({ cuaHang })` như cũ, `nav` về đường dẫn cũ.
   - Xoá phiếu: `xoaPhieu(man, [{ id, so }], ai)` trong `src/ui/generic/daXoa.ts`. Muốn có id, số phiếu thì đổi `baoDaLuu()` trong `src/ui/huongDanForm.ts` nhận `{ man, id, so }` (ChungTuForm gọi ở `luu()`).
4. Bỏ phần không dùng nữa: dải trong form, `viTri` khung đủ, CSS mục T676 cho `.fsf > .hdn-dai`, `.hdn-khung` trong form, `.hdn-toi` T680 nếu thay bằng kiểu `.hdan-lo`. Giữ nút Hướng dẫn bóng đèn của T680 và icon `bong-den`.
5. `tools/kiem_tra.py`, hàm `kiem_tra_t676_huong_dan`:
   - Đổi sang bấm Tiếp qua hết các bước. Bước có khoá `o` thì chỗ khoanh phải trùng chỗ thật (so khung chữ nhật của chỗ khoanh với `timCho`). Bước ảo chọn cửa hàng, phiếu vừa lưu phải hiện.
   - Bấm vào vùng tối không tắt tour.
   - Bỏ qua giữa chừng và Xong ở bước cuối: đường dẫn về như lúc bắt đầu, không còn `.fsf`, cửa hàng trên thanh trên như cũ, số dòng danh sách như cũ.
   - In tên màn, số bước, khoá thiếu khi lỗi.
6. Ghi lại QD87 (phần dải không còn dùng), `docs/KIEN-TRUC.md`, `CHANGELOG.md`, chuyển T681 sang `docs/luu-tru/TIEN-DO-xong.md`.

## Bẫy, quyết định mới

- QD88. Không có bẫy mới.
