# Báo cáo công nợ nhà cung cấp nhóm theo NCC, dưới là cửa hàng (T308)

- Ngày: 17/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code. Làm ở máy HAN-IPOS381
- Trạng thái cuối phiên: Xong

## Đã làm

- `bao-cao/cong-no.tsx`:
  - `soLieu` trả thêm `dauTheoCn` (nợ đầu kỳ từng cửa hàng); `soLieuCuaHang` lấy phần một cửa hàng trong số liệu tất cả cửa hàng, nên cộng các cửa hàng ra đúng dòng nhà cung cấp.
  - `rowsCongNoNhom` (mới, chỉ dùng cho báo cáo 4.2.3): xem tất cả cửa hàng thì mỗi NCC một dòng tổng in đậm (`_nhom`), dưới là từng cửa hàng có phát sinh (`_con`, `_i: 1` thụt vào cùng cột Nhà cung cấp), kể cả NCC chỉ có 1 cửa hàng. Đọc được ngay trong từng NCC mỗi cửa hàng nợ bao nhiêu (cột Nợ cuối kỳ). Xem một cửa hàng thì như cũ. Dòng con giữ tên NCC ở trường `ten` để bộ lọc Nhà cung cấp vẫn đúng.
  - Bản đầu có thêm cột Cửa hàng riêng, dinhlanphuongipacc thấy chưa đúng ý: cột thêm đẩy Nợ cuối kỳ ra ngoài màn 1366px. Đã bỏ, tên cửa hàng hiện thụt dưới tên NCC; ở 1366px cột Nợ cuối kỳ vừa màn.
  - Bấm tên cửa hàng ở dòng con mở Lịch sử công nợ phần cửa hàng đó (`TenCuaHang`, `LichSuCongNo` thêm `chiCn`). Nút Thanh toán ngay có ở cả dòng NCC và từng dòng cửa hàng còn nợ; dòng cửa hàng mở phiếu chi `&cn=<mã cửa hàng>` lập luôn cho cửa hàng đó (quỹ tiền mặt của cửa hàng), không hỏi chọn cửa hàng. Popup lịch sử phần cửa hàng cũng vậy.
  - `rowsCongNo` giữ nguyên (trang chủ, điện thoại dùng).
- `mua-hang/index.ts`: 4.2.3 dùng `rowsCongNoNhom`.
- `ChungTuForm.tsx` (một dòng): thêm mới có `?cn=<mã cửa hàng>` thì lập cho cửa hàng đó thay cho cửa hàng trên thanh trên.
- `mobile/MBaoCaoDong.tsx`: khuôn Tổng hợp theo đối tượng bỏ dòng `_con` để điện thoại không hiện trùng NCC.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- Xem trên `npm run dev` gói Free, tất cả cửa hàng, tháng 9: 7 NCC in đậm, mỗi NCC 3 dòng cửa hàng; cộng cửa hàng ra đúng dòng NCC (vd An Phú nợ đầu kỳ 16.986.000 + 14.090.000 + 5.313.000 = 36.389.000); dòng Tổng cộng không đổi. Bấm Phố Mây Lê Lợi dưới An Phú: lịch sử đầu kỳ 16.986.000, cuối kỳ 15.403.040, khớp dòng con.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.` `--dien-thoai`: 1 lỗi không thuộc việc này (Chứng từ chưa ghi sổ không bật sẵn chip Chưa ghi sổ), ghi thành T314.

## Dở dang, việc tiếp theo

- Không. Có thể làm sau: báo cáo nợ đầu kỳ tháng sau bằng nợ cuối kỳ tháng trước; thêm cửa hàng vào xuất Excel dòng con.

## Bẫy, quyết định mới

- Không.
