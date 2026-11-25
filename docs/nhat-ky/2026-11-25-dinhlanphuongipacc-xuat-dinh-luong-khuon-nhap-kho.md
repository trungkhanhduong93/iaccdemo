# Xuất kho định lượng, xem phiếu và danh sách theo khuôn Nhập kho (web, điện thoại)

- Ngày: 25/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Web, `XuatDinhLuong.tsx` (chi tiết phiếu): thông tin chung ô viền chỉ xem như Nhập kho, bỏ dải ghi chú, nút phễu lọc (hàng lọc ẩn mặc định), Tổng tiền ở dải trên thanh nút, chân phiếu có Chứng từ trước/sau, Tiện ích, In phiếu.
- Điện thoại, `MXemPhieu.tsx`: phiếu XDL vào khuôn xem phiếu kho. Thẻ đầu, Thông tin chung (có Tham chiếu sang phiếu bán hàng), mỗi món bán một thẻ chứa các NVL xuất, mục "Món chưa xuất được" cho món lỗi, chỉ xem.
- Điện thoại, `MChungTu.tsx`, `MDsChungTuChuan.tsx`: danh sách XDL đọc đúng danh sách phiếu XDL (`rowTuPhieuXdl` trong `xuat-dinh-luong.ts`), tiêu đề và tab "Xuất kho định lượng", bỏ nhãn số hàng hoá, dải cảnh báo món chưa tạo kèm cửa sổ lý do, nút xử lý.
- `san-xuat.ts`: thêm công thức mẫu CTCB009 (PHO02), CTCB010 (BUN01) để có phiếu xuất đủ.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- Xem tay trên cổng 5186, khung 400px và web. Chưa chạy `kiem_tra.py --nhanh`, `kiem_van.py`, `xuat_bao_cao_he_thong.py`.

## Dở dang, việc tiếp theo

- Điện thoại chưa có nhãn kho bar, bếp cho gói Pro, chưa có nút Tạo xuất kho định lượng (xuất bổ sung, tạo lại).
- Class `.xdl-tt*` trong `app.css` không còn dùng.

## Bẫy, quyết định mới

- Danh sách và xem phiếu trên điện thoại phải đọc `useDsPhieuXdl`, không dùng dữ liệu chứng từ chung của màn 5.1.2.
