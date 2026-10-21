# Đồng nhất tên Thu ngân hàng, Chi ngân hàng (T591)

- Ngày: 21/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/app/thaoTacNhanh.ts`: thao tác nhanh (trang chủ điện thoại, sidebar web) đổi "Báo có" thành "Thu ngân hàng", "Uỷ nhiệm chi" thành "Chi ngân hàng". Giữ nguyên id `bao-co`, `unc` để không mất tuỳ chỉnh đã lưu của người dùng.
- `src/app/SidebarFlyout.tsx`: menu Thu, chi tiền đổi "Thu tiền gửi ngân hàng", "Chi tiền gửi ngân hàng (UNC)" thành "Thu ngân hàng", "Chi ngân hàng".
- `src/ui/mobile/MDtThuChiXem.tsx`: tên loại phiếu khi phiếu không có `tenLoai` đổi "Uỷ nhiệm chi" thành "Chi ngân hàng".
- `src/ui/generic/nhom.ts`: nhãn số phiếu chi ngân hàng đổi "Số uỷ nhiệm chi" thành "Số chứng từ", giống phiếu thu ngân hàng.
- `src/app/CommandPalette.tsx`: từ khoá tìm màn 2.1.1 thêm "thu ngân hàng chi ngân hàng", giữ từ cũ để gõ "báo có", "uỷ nhiệm chi" vẫn ra.
- Giữ tên mẫu in "Giấy báo có", "Uỷ nhiệm chi" vì đó là tên mẫu chứng từ.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py` các file đã sửa: không có mục ĐỎ.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không. Làm theo QD24 (tên loại phiếu 2.1.1).
