# Điện thoại: phiếu chi có thẻ chi phí không sửa, xoá kiểm khoá sổ (T475, phần điện thoại của T439)

- Ngày: 19/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- PhuongXT nhận làm phần điện thoại của T439 (dinhlanphuongipacc làm phần web, ghi chú ở dòng T439). Làm theo đúng luật web, dùng lại `theCuaPhieu`, `lyDoKhongXoaTheCuaPhieu`, `xoaTheCuaPhieu` (`ChungTuForm.tsx`), `lyDoKhongXoaThe` (`ccdc/the-phan-bo.tsx`).
- `ui/mobile/MXemPhieu.tsx`:
  - `moSua`: mọi chỗ bấm Sửa (nút chân màn, menu Sửa chứng từ) với phiếu còn thẻ thì mở hộp "Không sửa được", nút Mở thẻ đi `/app/ccdc/8-1-1?mo=<số thẻ>` kèm `state.veGoc` là phiếu.
  - Xoá chứng từ: thêm kiểm `lyDoKhongXoaTheCuaPhieu` (thẻ thuộc kỳ đã khoá sổ); xoá được thì gọi `xoaTheCuaPhieu` như web (T436).
- `ui/mobile/MCcdc.tsx`: Xoá thẻ này kiểm `lyDoKhongXoaThe`, xoá thì ghi `dm/8-1-1` (`xoaPhieu`) để phiếu gốc hết tham chiếu; mở từ phiếu (`state.veGoc`) thì xoá xong về phiếu `?sua=1`. Danh sách thẻ bỏ thẻ đã xoá (`laDaXoa`).
- `app.css` mục cuối (T475): trên điện thoại hộp `ds-hop` z-index 1100. Màn xem phiếu, xem thẻ (`m-pb-man`, z-index 1000, dùng cho xem phiếu từ T425) che mất hộp xác nhận z-index 500, cả hộp Xoá phiếu có sẵn.

## Đã kiểm

- `npm run typecheck`, `npm run build`, `python tools/kiem_tra.py --nhanh`: không lỗi.
- Trình duyệt 375px gói Free, PC2610-0250 (thẻ TPB2601-0001 phân bổ từ 01/2026): bấm Sửa phiếu hiện "Không sửa được PC2610-0250", hộp nổi trên cùng; Mở thẻ ra TPB2601-0001; Xoá thẻ này báo thẻ thuộc kỳ đã khoá sổ; Xoá chứng từ ở phiếu cũng báo vậy. PC2610-0255 (không thẻ) bấm Sửa vào thẳng form sửa.
- Chưa thử được đường xoá thẻ thành công rồi về phiếu: thẻ mẫu trên điện thoại đều phân bổ từ tháng đã khoá sổ (khoá đến 8/2026).

## Dở dang, việc tiếp theo

- Không. Phần còn lại của T439 (màn Khoá sổ 10.1.6, Lịch phân bổ điện thoại) vẫn ở nhật ký của dinhlanphuongipacc.

## Bẫy, quyết định mới

- Không.
