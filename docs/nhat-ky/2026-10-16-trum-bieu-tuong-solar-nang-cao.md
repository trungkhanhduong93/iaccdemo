# Bộ biểu tượng Solar nâng cao (T275)

- Ngày: 16/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- `tools/xuat_bieu_tuong.py`: bỏ iFaster. Tải Solar Bold Duotone cho icon khối, Solar Linear cho icon nét. Sinh thêm bảng `NHOM` gồm 8 nhóm màu. Lớp phụ đổi thành `class="l2"`.
- `src/ui/icon-dac.ts`: sinh lại, có 3 bảng `DAC` (68 icon khối), `NET`, `NHOM`.
- `src/ui/Icon.tsx`: thêm prop `kieu` (khoi, net, hai) và component `ONen` (ô nhạt hoặc ô màu đặc). plus, x, check giữ nét tự vẽ, vì bản Solar có vòng tròn nhìn rối ở cỡ nhỏ.
- `src/styles/app.css`: thêm mục T275 cuối file gồm biến `--k-*`, ô `.o-nen`, thanh bên hai trạng thái.
- Chuyển chỗ gọi sang `ONen`: thẻ số liệu `TongQuan`, bảng nổi và màn Thao tác nhanh, menu Khác, Ctrl K, sơ đồ quy trình, Trung tâm báo cáo, tab Nghiệp vụ và trang chủ điện thoại.
- Thanh bên `Shell.tsx`: mục thường hiện nét, mục đang chọn hoặc rê chuột hiện khối.
- Sửa sau khi push: 6 mục thanh bên (Tài sản cố định, Chi phí phân bổ, Giá thành, Báo cáo, Tiện ích, Thao tác nhanh) mất icon ở trạng thái thường vì bảng `NET` chỉ có 9 phân hệ gốc. Script giờ sinh bản nét cho mọi icon khối (87 icon nét). `Icon` kiểu `hai` thiếu bản nét thì dùng bản khối.
- Theo Trum: bảng nổi Thao tác nhanh (`SidebarFlyout.tsx`) bỏ ô nền, dùng icon hai trạng thái như thanh bên.

## Đã kiểm

- `npm run typecheck`, `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh` chạy với vite cổng 5181 (cổng 5180 đang có phiên T274 dùng): in `Không có lỗi.`
- Ảnh web và điện thoại do Antigravity chụp, tự so với mẫu. Claude chưa xem ảnh.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Ghi QD63 trong `docs/QUYET-DINH.md`, thay QD23 phần biểu tượng.
- Iconify trả một số tên Solar dưới dạng alias (vd `magnifer-linear` trỏ tới `magnifier-linear`). Script phải tra bảng `aliases`.
