# Hàng hoá theo iFaster: thuế ngành nghề, thương hiệu, quy đổi ĐVT (T151)

- Ngày: 11/10/2026
- Người: Trum, agent: Claude Code điều phối, worker Claude (Antigravity hết quota) viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- `danh-muc/nganh-nghe.ts` (mới): 4 nhóm, 37 ngành nghề con kèm % GTGT, TNCN, chép từ iFaster (`apitax` `catalog/business`, 11/10/2026). Dòng 102-4 bị cụt chữ bên iFaster, đã sửa thành "bồi thường khác".
- Form hàng hoá: khối Thông tin thuế ở TT152, TT58 (ngành nghề con có tìm, tự điền nhóm ngành và 2 tỷ lệ; TT58 ghi Thuế TNDN). TT133, TT99 giữ thuế suất GTGT. Cột Thuế suất trên danh sách theo thông tư.
- Nhóm hàng hoá: ô ngành nghề con ở khối Thông tin chung (mọi gói, TT152, TT58). Hàng chọn nhóm thì tự điền ngành nghề khi ô đang trống.
- Danh mục Thương hiệu (`thuong-hieu`) sau Chi nhánh, nút Đồng bộ từ FABi, có trên sơ đồ làn 1. Hàng hoá chọn 1 thương hiệu, kho chọn nhiều.
- Hàng hoá: Kho theo dõi, Nhà cung cấp chọn nhiều (để trống là tất cả). Bảng quy đổi ĐVT trong form, hộp Thêm/Sửa quy đổi (`danh-muc/QuyDoiDvt.tsx`): đảo vị trí, xem trước, áp cho hàng này hoặc tất cả, báo lỗi trùng, tỷ lệ <= 0.
- `CatalogScreen.tsx`: kiểu ô `chonTim`, `ChonNhieu` có chữ gợi ý `goiY`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- `kiem_van.py` 6 file: 0 ĐỎ. Xem ảnh form TT152, TT133, hộp quy đổi: đúng bố cục.

## Dở dang, việc tiếp theo

- Tỷ lệ GTGT, TNCN theo ngành là số liệu iFaster đang dùng, chưa đối chiếu văn bản gốc: gộp vào T04.
- Quy đổi thêm trong form chỉ lưu trong form hàng hoá, chưa ghi ngược danh mục Quy đổi ĐVT (1.4).

## Bẫy, quyết định mới

- `docs/QUYET-DINH.md`: QD49.
