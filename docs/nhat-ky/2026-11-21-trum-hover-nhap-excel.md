# Hover nút tải, ô chọn chung ở hộp Nhập Excel (T894)

- Ngày: 21/11/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `HopNhapExcel.tsx`: ô chọn phạm vi tải đổi từ thẻ select của trình duyệt sang `Select` chung trong `src/ui/Dropdown.tsx`, lớp `inp nxh-chon`.
- `app.css` mục T892: nút `.nxh-b` có hiệu ứng rê chuột (nút trắng sang nền xanh nhạt, chữ xanh; nút xanh đậm hơn), ấn xuống có bóng trong.
- `app.css`: `body:has(.nxh-nen) .pop` nâng z-index lên 1001 để danh sách của ô chọn nổi trên nền hộp (nền hộp 1000, danh sách mặc định 80).

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Playwright: rê chuột nút Tải file mẫu ra nền rgb(230, 239, 247), chữ xanh; mở ô chọn, danh sách nằm trên cùng, chọn "34 hàng hoá theo bộ lọc" được, hộp vẫn mở.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.