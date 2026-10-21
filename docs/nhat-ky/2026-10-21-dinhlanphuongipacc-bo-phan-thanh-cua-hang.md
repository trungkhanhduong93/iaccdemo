# Mẫu in, báo cáo: Bộ phận thành Cửa hàng (T596)

- Ngày: 21/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/bao-cao/InChungTu.tsx`: dòng đầu trang phiếu kho "Bộ phận:" thành "Cửa hàng:".
- `src/ui/bao-cao/duLieuIn.ts`: giá trị mặc định khi phiếu không có cửa hàng đổi từ "Bộ phận kinh doanh" thành "Cửa hàng 1", giống trường `cn`.
- `src/modules/tien-ich/ThietKeMauIn.tsx`: nút bật tắt "In dòng bộ phận dưới tên đơn vị" thành "In dòng cửa hàng dưới tên đơn vị".
- `src/app/mau-in.ts`: ô "Bộ phận (phòng, ban)" của Bảng kê mua hàng thành "Cửa hàng"; "Địa chỉ (bộ phận)" của phiếu xuất kho thành "Địa chỉ (cửa hàng)"; gợi ý người ký phiếu nhập kho "(hoặc cửa hàng có nhu cầu nhập)".
- `src/modules/bao-cao/so-bo-sung.ts`: sổ 7.2.4, dòng nhóm "Bộ phận sử dụng:" thành "Cửa hàng sử dụng:".
- Giữ nguyên: diễn giải "nhân viên bộ phận bếp" trong dữ liệu giả, trường "Bộ phận" của hồ sơ người dùng ở Hệ thống, cột "Bộ phận / Cửa hàng" ở danh mục CCDC.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py` các file đã sửa: không có mục ĐỎ.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
