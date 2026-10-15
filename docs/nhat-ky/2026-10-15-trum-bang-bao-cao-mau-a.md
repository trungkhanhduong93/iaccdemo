# Bảng báo cáo điện thoại theo mẫu A (T258)

- Ngày: 15/10/2026
- Người: Trum, agent: Claude Code vẽ mẫu, điều phối và kiểm, Antigravity Windows (Anti A) code, chạy kiểm, xem ảnh
- Trạng thái cuối phiên: T258 Xong

## Đã làm

Claude vẽ 4 mẫu bảng báo cáo điện thoại trên canvas Design (https://claude.ai/artifact/6STCSHwynaQTBqeJJbVKkB). Trum chọn mẫu A, áp cho mọi báo cáo. Bản sao mẫu nằm ở `backup/mau-A-T258.html` trên máy Trum, không có trong repo.

- `src/ui/mobile/bangMauA.tsx` (mới):
  - `useBangMauA` đo bảng có rộng hơn thẻ không, để hiện dải "Vuốt ngang xem thêm cột".
  - Cột 1 hẹp (từ 96px trở xuống, hoặc tiêu đề #, STT, Ngày, Mã, Số CT) và bảng có từ 3 cột thì ghim thêm cột 2. Lề trái cột 2 lấy từ biến `--m-cot1-w`.
  - `cotMobile` đổi ô số bằng 0 hoặc rỗng thành `–`.
- `MSoBaoCao.tsx`: chip Bảng dùng khung mẫu A.
- `MToGiay.tsx`: 5.2.1, 5.2.3, 10.2.3 gói F có thêm chip Bảng cạnh Dòng. Nút Xem mẫu in vẫn giữ. Cột của 5.2.3 và 10.2.3 khai trong `COLS_523`, `COLS_1023`.
- `app.css`: mục `Bảng báo cáo điện thoại mẫu A (T258)`. Đã xoá luật bảng điện thoại cũ: ghim 2 cột tĩnh, nền `#F5F5F5`, `static !important` của T203, nền `tr.t`.
- `tools/kiem_tra.py`: thêm `kiem_tra_dot_21_b`, chạy trong `--dien-thoai`. Hàm này kiểm ô tiêu đề, cột ghim và dòng tổng có dính khi cuộn không. Sau khi cuộn ngang 200px, cột tên phải giữ nguyên vị trí và trang không cuộn ngang.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh` (cổng 5181): `Không có lỗi.`
- `--dien-thoai`: đợt 21B không lỗi. Còn 1 lỗi đã biết: màn Chi phí NVL chưa có bản điện thoại (T242).
- Anti A xem ảnh `tools/shots/m-21-*.png` trước và sau khi cuộn ngang:
  - 3.2.9 ghim cột # và cột Khách hàng.
  - 3.2.8 ghim cột Ngày và cột Số hoá đơn.
  - 5.2.3 ghim cột Mã và cột Tên hàng, tiêu đề 2 tầng không đè nhau.
  - 2.2.9 ghim một cột Chỉ tiêu.
- Claude chưa tự xem ảnh.

## Dở dang, việc tiếp theo

- Chưa thử trên điện thoại thật.
- 3.2.8 ghim cột Số hoá đơn, không ghim tên khách. Muốn ghim tên thì phải khai theo mã màn.

## Bẫy, quyết định mới

- Bản đầu chỉ ghim cột 1, nên 3.2.9 chỉ giữ cột # và tên khách trôi mất khi vuốt ngang. Cột 1 hẹp thì phải ghim thêm cột 2.
- Bảng web hiện ô 0 thành ô trống, dòng có cờ `_z` thì hiện 0. Bảng điện thoại luôn ghi `–`.
- Gộp xung đột cuối `app.css` khi hai bên cùng thêm mục `@media` ở cuối file: git tách cặp `  }` `}` chung ra ngoài vùng xung đột, nên giữ cả hai bên làm khối của bên trên mất ngoặc đóng và mục bên dưới lọt vào trong `@media` đó. `--dien-thoai` báo 32 lỗi `sticky`. Gộp xong thì đếm `{` và `}` trong `app.css`.
