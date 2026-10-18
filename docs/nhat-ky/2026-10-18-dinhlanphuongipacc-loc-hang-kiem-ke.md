# Lọc Hàng hoá, Nhóm hàng hoá ở Kiểm kê (T387)

- Ngày: 18/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `VoucherScreen.tsx`: phiếu kiểm kê, xuất, nhập điều chỉnh lấy mã hàng trên dòng (`_maHang`) như mua, bán.
- Thêm ô lọc Hàng hoá (dùng lại `dsHangLoc`) và ô mới Nhóm hàng hoá (`nhomHang`, nhóm lấy từ trường `nhom` của danh mục hàng hoá, nguyên vật liệu, chỉ các nhóm có trên phiếu). Phiếu khớp khi có ít nhất một dòng thuộc hàng, nhóm đã chọn.
- Thanh lọc tối đa 4 ô ngoài: mặc định Thời gian, Tìm kiếm, Kho, Hàng hoá; Nhóm hàng hoá nằm trong Bộ lọc nâng cao, người dùng bật ra ngoài được.

## Đã kiểm

- `npm run typecheck`, `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Mở thử gói Pro: Kiểm kê có ô Hàng hoá, lọc nhóm "Thịt, cá" còn 4 trên 6 phiếu; Xuất điều chỉnh có ô Hàng hoá; console không lỗi.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
