# Đầu phiếu Xuất bán POS giữ đủ nhãn khi khách lẻ, không lấy hoá đơn (T620)

- Ngày: 22/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/ban-hang/ChungTuBanHang.tsx`, đầu phiếu `.pos-dau3`: đơn không có khách vẫn hiện Địa chỉ, Mã số thuế, Người mua hàng, ô trống ghi `—`.
- Cùng file, cụm Hoá đơn khi không có hoá đơn: hiện đủ Số hoá đơn, Ký hiệu, Ngày hoá đơn, Ngày chứng từ, Mã tra cứu; ô trống ghi `—`, không có nút sao chép. Bỏ dòng chữ nghiêng "Khách không lấy hoá đơn GTGT", thay bằng nhãn tròn "Không lấy hoá đơn GTGT" bên phải tiêu đề HOÁ ĐƠN.
- `src/styles/app.css`: mục mới cuối file (T620), chữ `—` màu `var(--muted)`, đậm vừa. Không sửa mục T613. Class `.pd-trong` của T613 giờ không còn dùng.
- Theo phương án A trên canvas tư vấn, dùng `—` như ô trống ở `BangSua.tsx`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py` cho `ChungTuBanHang.tsx`: 0 ĐỎ.
- Mở `#/app/ban-hang/3-1-1/0` (đơn RHXV4ZMY6SQL): đủ nhãn, ô trống `—`, nhãn tròn nằm gọn trong cụm Hoá đơn. Đơn có khách, có hoá đơn giữ nguyên nhánh code cũ.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
