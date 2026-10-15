# Nhãn gói thay biểu tượng khoá (T260)

- Ngày: 15/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity (Gemini 3.8 Flash High) viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- Chỗ khoá vì ngoài gói, cả web lẫn điện thoại, không còn ổ khoá. Thay vào đó là nhãn `Pk` của gói thấp nhất mở được, ví dụ Plus, Pro.
- Web: tab màn (`ModuleTabs.tsx`), sidebar phân hệ (`Shell.tsx`), menu bay sidebar (`SidebarFlyout.tsx`), trang màn khoá (`Screen.tsx`), Bàn làm việc, Tổng quan (`home/`), sơ đồ quy trình (`QuyTrinhScreen.tsx`).
- Điện thoại: dòng màn ở Nghiệp vụ, Khác; ô phân hệ ở Nghiệp vụ; ô Thao tác nhanh trang chủ.
- Gói của phân hệ khoá tính bằng `minGoiPhanHe`: gói đầu tiên trong `GOIS` mà `phanHeKhoa` trả về false. Hàm này nằm riêng trong `Shell.tsx`, `MNghiepVu.tsx`, vì việc không sửa `registry.ts`.
- Giữ ổ khoá ở chỗ mang nghĩa khoá sổ, khoá kỳ: `ChiPhiNvl.tsx`, `CuoiKy.tsx`, `MTacVu.tsx`. Giữ ở `TuyChinhBC.tsx` (cột mẫu thông tư), `DsCot.tsx` (cột bắt buộc).
- Gói Free trên điện thoại vẫn ẩn hẳn mục khoá (T257).
- `app.css`: mục T260 cuối file.
- Sửa sau (Trum báo nhãn chìm): sidebar, menu bay nền tối dùng nhãn nền đặc (bỏ kiểu viền `o`). Dòng khoá chỉ làm mờ biểu tượng và chữ, không làm mờ nhãn. CSS ở mục "Nhãn gói rõ trên sidebar, menu bay nền tối (T260)" cuối `app.css`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- `kiem_van.py` cho các file có chữ giao diện: 0 ĐỎ, 0 VÀNG (anti báo).
- Ảnh trong `tools/shots/t260-*.png`. Ở gói Standard, sidebar web hiện Giá thành kèm nhãn Plus, ô Chi phí, giá thành ở Nghiệp vụ điện thoại cũng có nhãn Plus. Ở gói Free, điện thoại không hiện mục khoá.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
