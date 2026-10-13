# Giao diện điện thoại đợt 6, form danh mục (T183)

- Ngày: 13/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity (Anti A) viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- File mới `src/ui/mobile/MFormDm.tsx`: bọc `CatalogPanel` của bản máy tính, truyền cùng props như `CatalogScreen.tsx`.
- `MDanhMuc.tsx`:
  - Nút thêm mở form tạo mới. Bấm thẻ mở form sửa dòng đó.
  - Lưu báo "Đã lưu" rồi đóng form, riêng "Lưu và thêm" giữ form mở.
  - Trạng thái Đang sử dụng đổi trong form thì thẻ hiện theo, cùng cách `ttGhiDe` của T181.
  - `cauHinh`, `nhoms`, `cols0` tính như bản máy tính.
- CSS mục `Điện thoại đợt 6 (T183)` cuối `app.css`, mọi selector nằm dưới `.m-form-dm` hoặc `.m-app`:
  - Panel thành modal nổi từ đáy, cao 90% màn, bo 2 góc trên.
  - Đầu modal có nút x tròn bên trái, tiêu đề ở giữa.
  - Mỗi khối trường là một thẻ trắng.
  - Thanh Huỷ, Lưu và thêm, Lưu dính đáy. Thanh dưới bị ẩn khi form mở.
- `tools/kiem_tra.py`: thêm `kiem_tra_form_dm_dot_6()` chạy trong `--dien-thoai`, ở 390px, gói PL.
  - Thêm mới hàng hoá 1.2.
  - Sửa kho 1.8, đối tượng 1.5, phương thức thanh toán.
  - Mỗi lần kiểm: không lỗi console, không tràn ngang, nút Lưu không bị che.
- Clau sửa thêm: lớp `.row` của panel đè `display` về block nên chữ "Đang sử dụng" dính vào công tắc. Đổi selector thành `.m-form-dm label.pn-tich`.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: "Không có lỗi.", 183 lượt mở màn.
- `python tools/kiem_tra.py --dien-thoai`: "Không có lỗi.". Cả 4 màn đợt 6 báo lưu thành công.
- Chụp 390px form thêm hàng hoá (đầu, cuối) và form sửa đối tượng: không tràn ngang (`scrollWidth` 390), không lỗi trang.
- Chưa so ảnh từng điểm ảnh bản máy tính. CSS mới đều nằm dưới `.m-form-dm` hoặc `.m-app`, bản máy tính không có các lớp này.

## Dở dang, việc tiếp theo

- Quy đổi đơn vị tính chưa tách tấm con như ảnh IVT 10 khung 3. Bảng quy đổi đang cuộn ngang trong khối, dùng được ở 390px.
- Thêm hàng loạt (`cfg.hangLoat`) không làm theo kế hoạch.

## Bẫy, quyết định mới

- Không.
