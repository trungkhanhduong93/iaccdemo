# T715: Lịch sử phiếu theo bản E (web và app)

Trum duyệt ngày 02/11/2026. Việc này thay giao diện T714 (thanh lọc dọc bên trái) bằng bản E.

## Bản thiết kế

- Web: `docs/thiet-ke/T715-lich-su-web.dc.html`
- App: `docs/thiet-ke/T715-lich-su-app.dc.html`
- Bản gốc trên canvas của Trum: https://claude.ai/artifact/QaPYiYTEUF9CUvWEAvTsiB, khung "E. Kiểu B1 bỏ cột trái…" và "E. Bản app điện thoại". Link chỉ Trum mở được.

Hai file `.dc.html` là HTML tĩnh viết bằng inline style. Lấy bố cục, cỡ chữ, khoảng cách, màu từ đó. Khi viết code, đổi mã màu sang biến `:root` trong `src/styles/app.css`: `--red-t`, `--green-t`, `--amber-t`, `--amber`, `--red`, `--green`, `--blue`, `--tint`, `--line`, `--line-2`, `--muted`, `--body`.

## Trum đã chốt

1. Bỏ cột trái của T714, bỏ luôn bộ lọc theo thao tác và người làm. Trên dòng thời gian chỉ giữ một dòng tóm tắt "N thao tác, M người · sửa gần nhất dd/MM HH:mm". Phiếu chưa có lần sửa thì bỏ vế "sửa gần nhất".
2. Mỗi thao tác là một thẻ, trong thẻ ghi theo cặp nhãn và giá trị:
   - Thao tác (tên thao tác, chữ đậm)
   - Người làm
   - Thời điểm, đủ dd/MM/yyyy HH:mm
   - Nội dung: câu đầy đủ, nêu số phiếu, đối tượng, hoá đơn, kho, số dòng hàng, tổng tiền và ảnh hưởng tới sổ. Không ghi cụt kiểu "Vào sổ quỹ."
3. Thao tác sửa, xoá, huỷ có thêm hai phần:
   - Bảng Trước và Sau.
     - Web: 3 cột Chỗ sửa | Trước khi sửa (nền đỏ nhạt, chữ gạch ngang) | Sau khi sửa (nền xanh lá nhạt, chữ đậm).
     - App: mỗi chỗ sửa một khối, tên chỗ sửa in đậm, dưới là dải Trước đỏ nhạt rồi dải Sau xanh lá nhạt.
     - Dòng hàng bị xoá: ô Sau hiện nhãn đỏ "Đã xoá dòng".
     - Phiếu đổi tổng tiền: cuối bảng có hàng Tổng tiền, ghi số cũ gạch ngang, số mới và số chênh (+ xanh lá, − đỏ).
   - Khối "Lý do sửa" (hoặc "Lý do xoá", "Lý do huỷ") nền vàng nhạt, nằm cuối thẻ. Không có lý do thì không hiện khối này.
4. Đợt này chỉ làm giao diện và dữ liệu mẫu. Hộp bắt nhập lý do khi sửa, xoá, huỷ để thành việc riêng, làm sau.

## Việc phải làm

### Dữ liệu (`src/ui/mobile/MLichSu.tsx`)

- Kiểu `DongLichSu` thêm `noiDung?: string`, `lyDo?: string`, `tongCu?: number`, `tongMoi?: number`.
- `TruongDoi` thêm `xoa?: boolean` để đánh dấu dòng hàng bị xoá.
- Bỏ `ghiChu` hoặc đổi tên thành `noiDung`. Phải sửa mọi nơi đang truyền `mau` cho `MLichSu` (tra `python tools/ban_do.py tim "mau="`; thẻ chi phí phân bổ T590 đang dùng).
- Lịch sử mẫu trong `useDongLichSu` điền đủ như bản thiết kế:
  - Tạo: nội dung từ đồng bộ FABi.
  - Sửa: 3 chỗ sửa (diễn giải, số lượng dòng 3, xoá dòng 7), tổng cũ 4.748.550 đ, tổng mới 4.778.550 đ, có lý do.
  - Lưu: nội dung đầy đủ.
- Câu Lưu, Ghi sổ đổi theo `kieuGhiSo(goi)` như hiện tại.
- Nhật ký thật trong phiên (`useNhatKy`) vẫn chỉ có một câu `viec`: đặt `noiDung` bằng câu đó. Riêng câu "Sửa chứng từ: …" vẫn tách trường cũ, mới bằng `tachDoi` như hiện nay.

### Web (`src/ui/generic/ChungTuForm.tsx`, hàm `LichSu`)

- Viết lại phần vẽ theo bản E web. Giữ nguyên props và hai chỗ gọi (`ChungTuForm.tsx` tab Lịch sử, `CatalogScreen.tsx:1196`).
- Bỏ state lọc, bỏ `vietTatTen` nếu không còn ai dùng.
- CSS: trong mục T714 cuối `app.css`, sửa hoặc xoá các class `ls-b-*` không còn dùng. Thêm một mục mới `/* ── Lịch sử phiếu bản E (T715) ── */`.

### App (`src/ui/mobile/MLichSu.tsx`)

- Vẽ lại theo bản E app. Giữ tab Chi tiết | Lịch sử và đầu màn của màn gọi `MLichSu`.
- CSS lớp `m-ls-*`: sửa trong mục CSS cũ của `MLichSu` hoặc thêm mục T715, không đụng mục của việc khác.

## Nghiệm thu

- `npm run typecheck`, `npm run build` không lỗi.
- `npm run dev`, rồi `python tools/kiem_tra.py --nhanh` in "Không có lỗi."
- Playwright, gói S, phiếu chi `#/app/tien/2-1-1/chi-3`:
  - Web 1440x900, tab Lịch sử: 3 thẻ, thẻ Sửa có bảng 3 cột, 4 hàng (3 chỗ sửa và Tổng tiền), có khối Lý do sửa.
  - App 390x844: thẻ Sửa có 3 khối Trước/Sau và khối Lý do sửa.
- Thêm mới rồi sửa một phiếu trong phiên: thẻ nhật ký thật hiện đúng câu đã ghi, không lỗi trang.
- `python tools/kiem_van.py` cho các file có chữ giao diện: không mục ĐỎ.
