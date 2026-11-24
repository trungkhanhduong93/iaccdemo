# Xuất kho định lượng: kho xuất, đảo nhóm cột, nguồn Xuất bán POS (T915)

- Ngày: 24/11/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/kho/XuatDinhLuong.tsx`: đầu phiếu bỏ ô Cửa hàng, chip cửa hàng góc trên phải vẫn giữ. Ô Nguồn đứng một dòng riêng.
- `src/modules/kho/XuatDinhLuong.tsx`: lưới chi tiết đưa nhóm Hàng hoá sang trái, nhóm Món bán sang phải. Ghi chú, Xử lý đứng riêng ở cuối, sau nhóm Món bán (Trum đổi lại sau lần push đầu). Nhãn Tổng cộng ghi ở cột Tên hàng hoá.
- `src/modules/kho/XuatDinhLuong.tsx`: thêm cột Kho xuất trong nhóm Hàng hoá. Gói Standard, Plus ghi một kho chính theo cửa hàng (vd Kho Thảo Điền). Gói Pro lấy kho bar của cửa hàng cho món đồ uống (dò theo tên món, biểu thức `DO_UONG`), món còn lại lấy kho bếp.
- Lần sửa 3: Kho xuất đứng riêng ở cột đầu bên trái, nhãn Tổng cộng ghi ở cột này. Cột Tên ghi "Tên - mã", mã màu xám (`.xdl-ma` cuối `app.css`), tên giữ màu đen. Trước đó lớp `dim` trên thẻ `small` không có tác dụng nên mã chưa nhạt.
- `src/modules/kho/xuat-dinh-luong.ts`: nguồn phiếu đổi từ FABi sang Xuất bán POS. Kiểu `nguon` chừa sẵn giá trị Xuất bán hàng cho phiếu bán hàng thủ công sau này.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: in "Không có lỗi."
- Chạy Playwright mở chi tiết phiếu 0 tới 11 ở gói Pro và Plus. Tiêu đề lưới ra đúng thứ tự Hàng hoá rồi Món bán. Gói Pro ra Kho bar Thảo Điền và Kho bếp Thảo Điền. Gói Plus ra Kho Thảo Điền. Không có lỗi trang.
- `python tools/kiem_van.py`: 0 ĐỎ. 3 VÀNG ở đường vẽ SVG nút In phiếu, có từ trước.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
