# Lý do nghiệp vụ chỉ tích Là chi phí (T334)

- Ngày: 17/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/danh-muc/truong-dm.ts`: `CauHinhDM` thêm `chiSua?: string[]`, mở dòng có sẵn chỉ sửa được các ô này. Danh mục Lý do nghiệp vụ (1.16) đặt `chiSua: ['chiPhi']`: tạm thời lý do có sẵn không sửa Mã, Tên, Dùng cho, Đang sử dụng, chỉ tích Là chi phí hay không.
- `src/ui/generic/CatalogScreen.tsx`: ô ngoài `chiSua` bọc fieldset disabled khi đang sửa dòng có sẵn. Thêm mới không đổi.
- Danh mục này vốn không có nút Xoá, không thêm.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Gói Free trên localhost, Danh mục › Lý do nghiệp vụ, mở CHI01: Mã, Tên, Dùng cho, Đang sử dụng bị khoá, Là chi phí tích được.
- Chưa kiểm bản điện thoại.
- Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: `tools/xuat_bao_cao_he_thong.py` cần thư mục `Present/tools` cạnh repo, máy này không có.

## Dở dang, việc tiếp theo

- Commit chỉ nằm trên máy, chưa push: người dùng dặn khi nào bảo mới push.
- Mở lại sửa đầy đủ thì bỏ `chiSua` ở cấu hình 1.16.

## Bẫy, quyết định mới

- Không.
