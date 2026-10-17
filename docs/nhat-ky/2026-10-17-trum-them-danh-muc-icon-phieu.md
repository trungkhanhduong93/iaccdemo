# Thêm nhanh danh mục tại form chứng từ, icon nét và nút dính đáy điện thoại (T344, T347)

- Ngày: 17/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- T344 (điện thoại): đổi icon trong màn lập phiếu và xem phiếu (`MLapPhieu.tsx`, `MLapPhieuKho.tsx`, `MXemPhieu.tsx`) sang dạng nét với thuộc tính `kieu="net"`.
- T344 (điện thoại): bảng chọn `MChon.tsx`, bảng chọn mặt hàng trong phiếu, bộ lọc `MLoc` chỉnh thanh nút Huỷ, Áp dụng, Xong cố định ở đáy bảng bằng CSS flexbox và `safe-area-inset-bottom`.
- T347 (web và điện thoại): thêm kho lưu trữ danh mục dùng chung `danhMucStore.ts` giữa `CatalogScreen`, `ChonDanhMuc` và `MChon`, `MFormDm`.
- T347: form thêm mới từ ô chọn danh mục mở đủ form `CatalogPanel`; ô mã trống tự sinh mã kế tiếp theo tiền tố; mã trùng hiển thị thông báo lỗi tại ô; lưu xong tự chọn mục mới vào ô và đồng bộ sang danh mục trong phiên. Ô chọn Quỹ tiền không có nút Thêm mới (theo T326).
- Gộp CSS từ `src/ui/mobile/_tam-T344.css` và `src/ui/_tam-T347.css` vào cuối `src/styles/app.css`, xoá 2 dòng import và xoá 2 file tạm.

## Đã kiểm

- Playwright kiểm tra tự động 4 mục a, b, c, d đạt:
  + Mục 1a (web gói PL): Thêm mới đối tượng ở 1-5, hàng hoá ở 1-2, quỹ tiền ở 1-12 đều tìm thấy đúng 1 dòng; sửa dòng có sẵn không sinh dòng mới.
  + Mục 1b (web gói PL): Phiếu chi tiền mặt mới ô Đối tượng mở form đủ trường; nhập mã trùng KH001 báo lỗi; mã trống tự sinh; lưu xong ô hiện mục mới; danh mục đối tượng 1-5 có đúng 1 dòng.
  + Mục 1c (điện thoại gói PL): Phiếu thu tiền mặt mới ô Đối tượng mở form đủ trường, bắt mã trùng, tự sinh mã; bảng Chọn quỹ không có nút Thêm; icon màn phiếu là dạng nét; nút Áp dụng dính đáy; danh mục đối tượng có đúng 1 dòng.
  + Mục 1d: Không có lỗi console ở các bước.
- `npm run typecheck`: không lỗi.
- `npm run build`: hoàn thành trong 1.6s, không lỗi.
- `python tools/kiem_tra.py --nhanh`: in "Không có lỗi." (204 lượt mở màn gói PL).

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
