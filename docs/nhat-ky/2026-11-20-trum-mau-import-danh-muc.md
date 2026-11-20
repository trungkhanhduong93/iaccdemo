# Mẫu import danh mục gói Standard (T890)

- Ngày: 20/11/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Nhận việc T890 trong `docs/TIEN-DO.md`, commit `76b83e7`, đã push.
- Viết spec `backup/spec-T890.md`. Thư mục `backup/` không lên git, spec chỉ có trên máy Trum.
- Trum chốt 3 điều: làm hộp nhập kèm file mẫu, có 6 danh mục, cột mẫu lấy theo form Thêm mới. 6 danh mục gồm Hàng hoá, Nhóm hàng hoá, Đối tượng, Nhóm đối tượng, Quỹ tiền, Lý do nghiệp vụ. Không làm Cửa hàng.
- Phiên 2: Anti viết code theo spec. Sau 40 phút Trum bảo dừng Anti, Claude kiểm và sửa tiếp.
- Tạo `src/ui/generic/mauNhapDm.ts` (chọn cột, sinh file mẫu, đọc file, kiểm dòng, nhập dòng đạt) và `src/ui/generic/HopNhapExcel.tsx` (hộp 3 bước dựng trên `ThongBao`).
- `CatalogScreen.tsx`: gói Standard và 6 danh mục thì Nhập Excel mở hộp, còn lại giữ toast.
- `ThongBao.tsx`: nút chính có thêm `tat` để khoá nút. Hộp nhập dùng để khoá nút Nhập khi 0 dòng đạt.
- Sửa sau khi kiểm code Anti: bỏ trường `chiDoc` dạng hàm khỏi mẫu, chạy `doi` của danh mục cho từng dòng nhập, gộp patch `phien.luu` gọn lại, bỏ mẹo khoá nút bằng `document.querySelector`, bỏ CSS xoá lề thân hộp.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- `python tools/kiem_van.py` cho 2 file mới: sạch.
- Script `backup/review-T890/test_t890.py` (không commit), gói Standard TT152 và TT58: 6 danh mục tải được file mẫu. Hàng hoá 3 dòng báo "Đạt 2 dòng, lỗi 1 dòng", nhập xong danh sách từ 34 lên 36 dòng. Quỹ tiền số dư 5.000.000 hiện đúng trên danh sách. Giữ 2 dòng ví dụ thì báo trùng mã, nút Nhập bị khoá. Gói Plus vẫn chỉ toast.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Cột mẫu khác danh sách dự kiến trong spec: Hàng hoá không có Thương hiệu và Theo dõi tồn kho. Hai trường này `chiDoc` ở gói Standard (chỉ xem, tự đặt), nên không đưa vào mẫu. Hàng hoá có Giảm thuế theo quy định vì đơn vị mẫu đang bật giảm thuế.
- Dữ liệu mẫu Hàng hoá dùng nhóm `Món nước` không có trong danh mục Nhóm hàng hoá. Dòng ví dụ trong file mẫu vì thế báo thêm lỗi Nhóm hàng hoá. Ghi thành việc T891.
