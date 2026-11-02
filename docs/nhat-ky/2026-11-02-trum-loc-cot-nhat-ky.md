# Hàng lọc theo cột ở Nhật ký thao tác (T713)

- Ngày: 02/11/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/tien-ich/TienIch.tsx`: bảng Nhật ký thao tác (web) thêm hàng `loc-hang` dưới hàng tiêu đề, dùng `OLoc` của `src/ui/LocCot.tsx` như `BangKiemKe.tsx`. Mảng `COT_LOC_NK` khai 9 cột: Ngày giờ thao tác, Ngày chứng từ lọc kiểu ngày; Chức vụ, Thao tác, Tên chứng từ, Cửa hàng chọn giá trị; Tài khoản, Số chứng từ, Thiết bị gõ chữ.
- Lọc cột cộng dồn với Bộ lọc nâng cao và ô tìm, chỉ áp trên kết quả sau khi bấm Lọc. Dòng đang mở khung chi tiết bị lọc mất thì khung đóng.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Playwright gói PR, 1440x900: hàng lọc có 9 ô; bấm Lọc ra 12 dòng, gõ "thu" ở cột Tài khoản còn 4 dòng.

## Dở dang, việc tiếp theo

- Không. Điện thoại không đổi.

## Bẫy, quyết định mới

- Không.
