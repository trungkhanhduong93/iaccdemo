# Phiếu trả lại hàng mua, Tiện ích Trả hàng (T727)

- Ngày: 04/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/mua-hang/index.ts`: 4.1.4 đổi `them` thành "Thêm phiếu trả lại hàng mua", tiêu đề form thành Phiếu trả lại hàng mua.
- `src/ui/generic/ChungTuForm.tsx`:
  - Trả lại hàng mua: dải đáy chỉ còn Tổng tiền; ô tích đổi thành Xuất kèm hoá đơn.
  - Phiếu mua có dòng hàng (4.1.1, 4.1.2, 4.1.3) thêm mục Trả hàng ở Tiện ích. Bấm thì mở Thêm phiếu trả lại hàng mua, truyền `traTu` qua `state`: cửa hàng, nhà cung cấp, mã số thuế, địa chỉ, kho, dòng hàng.
  - Lưu phiếu trả: phiếu trả giữ `_thamChieu`, `_thamChieuDi`, `_traTuMua`; phiếu mua thêm `{ id, so }` vào `_dsTra`. Dòng Tham chiếu hai phiếu trỏ về nhau.
- `src/ui/generic/daXoa.ts`: `dsTraCon`, `MAN_TRA_MUA`. `ttThamChieu` tính cả phiếu trả, nên phiếu mua còn phiếu trả thì không xoá được.
- `src/ui/generic/VoucherScreen.tsx`: cột Tham chiếu ở danh sách phiếu mua hiện mã phiếu trả.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Trình duyệt, gói Plus: mở MH2610-0022, Tiện ích, Trả hàng, lưu được TLN2610-0261. Tham chiếu hai chiều đúng, danh sách phiếu mua hiện mã phiếu trả.

## Dở dang, việc tiếp theo

- Điện thoại chưa đổi theo (ô Nhận kèm hoá đơn, Tiện ích Trả hàng): `MLapPhieu.tsx`, `MXemPhieu.tsx` đang trong việc của Trum.
- Thuế suất KCT của phiếu mua sang phiếu trả hiện 0%, do ô thuế suất form trả lại không có KCT.

## Bẫy, quyết định mới

- Không.
