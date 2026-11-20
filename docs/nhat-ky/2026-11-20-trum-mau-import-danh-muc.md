# Mẫu import danh mục gói Standard (T890)

- Ngày: 20/11/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Dở dang

## Đã làm

- Nhận việc T890 trong `docs/TIEN-DO.md`, commit `76b83e7`, đã push.
- Viết spec `backup/spec-T890.md`. Thư mục `backup/` không lên git, spec chỉ có trên máy Trum.
- Trum chốt 3 điều: làm hộp nhập kèm file mẫu, có 6 danh mục, cột mẫu lấy theo form Thêm mới. 6 danh mục gồm Hàng hoá, Nhóm hàng hoá, Đối tượng, Nhóm đối tượng, Quỹ tiền, Lý do nghiệp vụ. Không làm Cửa hàng.

## Đã kiểm

- `python tools/kiem_van.py backup/spec-T890.md`: 0 ĐỎ, 1 VÀNG. Mục VÀNG là dòng liệt kê cột dài, giữ nguyên.
- Chưa sửa code nên chưa chạy typecheck, build.

## Dở dang, việc tiếp theo

- Trum đọc spec, góp ý. Trum gõ "giao anti" thì giao anti code theo `backup/spec-T890.md`.
- File sẽ sửa: `src/ui/generic/CatalogScreen.tsx` (chỗ `NutExcel` khoảng dòng 582), tạo `src/ui/generic/mauNhapDm.ts`, `src/ui/generic/HopNhapExcel.tsx`, mục T890 cuối `src/styles/app.css`.
- Nghiệm thu theo mục 7 của spec.

## Bẫy, quyết định mới

- Không.
