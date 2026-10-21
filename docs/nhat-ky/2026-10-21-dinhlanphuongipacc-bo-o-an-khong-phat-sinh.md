# Bỏ ô lọc Ẩn dòng không phát sinh ở báo cáo (T578)

- Ngày: 21/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/generic/ReportScreen.tsx`: `ReportToolbar` bỏ ô `anKhongPS` khỏi danh sách ô lọc, nên thanh lọc, phễu Bộ lọc nâng cao, hộp "Điều kiện xem báo cáo" đều không còn ô này. Phễu thôi đếm ô này (hết huy hiệu "1" khi chưa lọc gì).
- `ReportPaper` ẩn dòng không phát sinh theo `cfg.anKhongPS` trong `CAU_HINH_BC`, không đọc lựa chọn người dùng. Dòng điều kiện lọc (`dsDongLoc`) bỏ chữ "Ẩn dòng không phát sinh".
- `src/ui/bao-cao/tuyChinhBC.ts`: bỏ trường `anKhongPS` khỏi `BanLoc`, `TrangThaiLoc` và hàm `datAnKhongPS`. Tuỳ chọn `anKhongPS` của `bienDoiBang` giữ nguyên.
- Điện thoại không có ô này: `MSoBaoCao.tsx` đã luôn ẩn theo `CAU_HINH_BC`, không sửa file điện thoại.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: "Không có lỗi."
- Chưa mở trình duyệt xem tận mắt hộp điều kiện (trang đòi đăng nhập mẫu).

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
