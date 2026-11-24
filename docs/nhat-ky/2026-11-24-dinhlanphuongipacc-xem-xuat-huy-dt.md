# Xem phiếu Xuất huỷ trên điện thoại như phiếu mua (T927)

- Ngày: 24/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MXemPhieu.tsx`: Xuất huỷ (5.1.2-3) đi chung khuôn Nhập kho (`khoGonXem`). Tiêu đề Phiếu xuất huỷ + số, cửa hàng và nguồn ở đầu thẻ, Tổng tiền vốn, bỏ ô Cửa hàng, Nguồn chứng từ.
- Thông tin chung: Ngày, Kho xuất (phiếu mẫu lấy kho đầu của cửa hàng), Lý do huỷ (`_lyDo`, phiếu mẫu lấy lý do Xuất kho đầu), Người thực hiện, Ghi chú.
- Dòng hàng ghi Giá vốn, Tiền vốn. Khối Tổng cộng ghi Tổng số lượng, Tổng tiền vốn.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- Xem XH2610-0259, XH2610-0257 cỡ 375x812: đúng bố cục, tổng 126 và 14.224.000 đ khớp web.
- `kiem_van.py MXemPhieu.tsx`: sạch.
- Chưa chạy `kiem_tra.py --nhanh` sau lần sửa cuối: người dùng dừng giữa chừng và bảo push ngay. Lần chạy trước đó (chưa có khối Tổng cộng) báo một lỗi chờ bảng báo cáo `.bc-ban-du-lieu`, chưa rõ có dính hay không.
- Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: máy thiếu `Present/tools/build_present.py`.

## Dở dang, việc tiếp theo

- Chạy lại `python tools/kiem_tra.py --nhanh`, xem lỗi `.bc-ban-du-lieu` có phải lỗi cũ không.

## Bẫy, quyết định mới

- Không.
