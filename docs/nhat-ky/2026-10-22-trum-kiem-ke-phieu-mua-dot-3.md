# Báo cáo kiểm kê bỏ tiền, phiếu mua sửa quỹ, lịch sử, chiết khấu, sheet nhà cung cấp (T615, T616)

- Ngày: 22/10/2026
- Người: Trum, agent: Claude Code điều phối 4 Antigravity (spec `backup/spec-T615-T616.md`)
- Trạng thái cuối phiên: Xong

## Đã làm

- T615: `MBaoCaoKiemKe.tsx` bỏ đơn giá, giá trị thừa thiếu. Thẻ hiện số lượng lệch kèm ĐVT (`+3 kg`, `−2 kg`, `Khớp`). Khối tổng hiện `N mặt hàng lệch`, dòng phụ đếm số mặt hàng Thừa, Thiếu, Khớp.
- T615: `MTongHopBanHang.tsx` khối tổng ghi "Tổng doanh thu thuần", bỏ dòng "SL · Doanh thu". Số bên phải giữ nguyên.
- T616: `MThanhToanNgay.tsx` (màn xem) và `MLapPhieu.tsx` (màn sửa): chọn quỹ tiền mặt chỉ hiện quỹ của cửa hàng lập phiếu, quỹ tiền mặt sinh từ `CUA_HANG`, bỏ quỹ văn phòng. Quỹ ngân hàng giữ hiện tất cả như web.
- T616: lịch sử trong `.m-pb-noi-dung` (màn xem, sửa mọi phiếu) bỏ lề 16px của `.m-ls-khung`, thẳng mép như phiếu thu chi. Sửa bằng CSS cuối `app.css`, không đụng `MXemPhieu.tsx` (T436).
- T616: `MLapPhieu.tsx` ô chiết khấu áp chung rộng 120px; sheet Chọn nhà cung cấp còn 1 icon tải lại (xoá CSS `.m-t601-btn-ib-reload` vẽ chồng icon thứ hai); sheet Thêm nhà cung cấp dùng nút X `m-tam-dong-btn` thay ký tự `‹`.

## Đã kiểm

- `npm run typecheck`: 0 lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh` với `KIEM_TRA_URL=http://localhost:5191/` (dev server của bản này; cổng 5180 đang chạy bản của phiên khác): "Không có lỗi."
- `python tools/kiem_van.py` các file sửa: 0 ĐỎ.
- Chưa mở trình duyệt xem bằng mắt các màn trên điện thoại.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
