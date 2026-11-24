# Nhớ kỳ lọc khi đóng phiếu về danh sách (T924)

- Ngày: 24/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `useLocNhap` (`src/ui/LocNangCao.tsx`) nhận thêm khoá nhớ: có khoá thì giá trị lọc (đang áp dụng và nháp) giữ trong bộ nhớ theo phiên, danh sách mount lại sau khi đóng phiếu vẫn lấy lại.
- Gắn khoá: `VoucherScreen.tsx` (theo đường dẫn màn và ?thang, ?lyDo, ?nhom), `ChungTuBanHang.tsx`, `CongThuc.tsx`, `PhieuSanXuat.tsx`, `HoaDonDienTu.tsx`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: sạch.
- Trình duyệt, Thu chi: đổi sang Tháng trước, mở phiếu, đóng thì danh sách vẫn 01/09 đến 30/09/2026.
- Chưa thử tay Mua hàng, Kho, Bán hàng; chưa chạy `kiem_tra.py --nhanh`.

## Dở dang, việc tiếp theo

- Chưa nhớ trang đang đứng. Các danh sách ở `src/modules/*` còn lại (TonKhoBanDau, XuatDinhLuong, ToKhaiHKD, CatalogScreen...) chưa gắn khoá, muốn nhớ thì truyền khoá vào `useLocNhap`.

## Bẫy, quyết định mới

- Không.
