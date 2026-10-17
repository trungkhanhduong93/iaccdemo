# Chi tiết phương thức thanh toán chỉ xem (T328)

- Ngày: 17/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/types.ts`: `CatalogCfg` thêm `chiXem?: Goi[]`, gói chỉ xem chi tiết.
- `src/ui/generic/CatalogScreen.tsx`: `CatalogPanel` thêm `chiXem`. Bật thì khoá mọi ô (fieldset disabled), tiêu đề Chi tiết …, chân form chỉ còn nút Đóng; form toàn màn không có nút Sửa, Tiện ích, phím Ctrl+E.
- `src/modules/danh-muc/index.ts`: Phương thức thanh toán bật `chiXem: ['F', 'S']` (gói Free, Standard lấy phương thức từ FABi, đã không thêm mới từ T144).

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Gói Free trên localhost: mở một phương thức, tiêu đề Chi tiết Phương thức thanh toán, ô khoá, chỉ có nút Đóng. Danh mục Quỹ tiền vẫn Sửa, Lưu bình thường.
- Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: `tools/xuat_bao_cao_he_thong.py` cần thư mục `Present/tools` cạnh repo, máy này không có.

## Dở dang, việc tiếp theo

- Gói Plus, Pro vẫn sửa được phương thức (có thêm mới, tự hạch toán). Muốn khoá cả các gói này thì thêm `'PL', 'PR'` vào `chiXem`.

## Bẫy, quyết định mới

- Không.
