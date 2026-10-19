# Thêm hàng loạt ở phiếu mua hàng, kiểm kê; lọc cột kiểu chọn (T465, T466)

- Ngày: 19/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Theo mẫu hộp Thêm hàng loạt của iFaster PhuongXT gửi (sau khi xem bản thiết kế thử).
- `ui/generic/ThemHangLoat.tsx` mới: hộp (portal, `ds-hop` + `thl-hop`) có bảng ô tích, #, Hàng hoá (tên - mã), Đơn vị tính, Nhóm hàng hoá, Loại; hàng lọc từng cột dùng `OLoc`, `khopLoc` như hàng lọc bảng chi tiết (T383); phân trang 50, 100, 200; ô tích đầu bảng chọn tất cả hàng đang hiện; hàng đã có trong phiếu tích sẵn, mờ, ghi "Đã có trong phiếu"; nút Đóng, Xác nhận (kèm số đã chọn); Esc, bấm nền để đóng.
- `BangSua.tsx`: prop `coThemHangLoat` (ChungTuForm bật cho `nhom === 'mua'`), nút Thêm hàng loạt cạnh Thêm dòng; danh sách là danh mục hàng của phiếu (NVL) cộng hàng vừa thêm tại form; mỗi hàng thành dòng số lượng 1, giá, thuế suất theo danh mục, kho mặc định, như Thêm dòng.
- `BangKiemKe.tsx`: nút Thêm hàng loạt, danh sách NVL, mỗi hàng thành dòng như Thêm dòng (tồn hệ thống, thực tế 0, như hiện tại).
- CSS mục cuối `app.css` (T465).
- T466 (PhuongXT: bộ lọc phải có danh sách giá trị như iFaster, rà mọi màn): `LocCot.tsx` thêm `layLuaChon` (danh sách giá trị chỉ tính khi mở ô lọc hoặc đang lọc), `dsGiaTri` (giá trị khác nhau xếp theo chữ, ô trống hiện "(Trống)"), danh sách tích vẽ tối đa 300 giá trị, quá thì nhắc gõ Tìm kiếm. Cột chữ chuyển kiểu `chon`: `VoucherScreen.tsx` (cột có giá trị số vẫn `so`), `ChungTuBanHang.tsx` (danh sách đơn và bảng món), `PhieuSanXuat.tsx` (bỏ `COT_CHON`), `BangSua.tsx`, `BangKiemKe.tsx`, `ThemHangLoat.tsx`. Bản điện thoại có bộ lọc riêng, không đổi.

## Đã kiểm

- `npm run typecheck`, `npm run build`, `python tools/kiem_tra.py --nhanh`: không lỗi.
- Trình duyệt gói Plus 1640x900: Sửa phiếu mua MH2610-0022, Thêm hàng loạt ra 12 hàng, 3 hàng đã có; lọc Nhóm hàng hoá "Thịt" còn 4, chọn tất cả được 3, Xác nhận bảng từ 3 lên 6 dòng. Sửa phiếu kiểm kê đầu danh sách: tích 2 hàng, bảng từ 5 lên 7 dòng. Không lưu phiếu nào.
- T466 trên trình duyệt: danh sách Mua hàng, phễu cột Nhà cung cấp ra (Chọn Tất Cả) và các nhà cung cấp; bỏ tích Công ty Điện lực Sài Gòn thì không còn phiếu của bên đó. Hộp Thêm hàng loạt, phễu Nhóm hàng hoá ra 6 nhóm, hiện trên hộp.
- Bản điện thoại chưa làm.

## Dở dang, việc tiếp theo

- Phiếu kiểm kê: dòng thêm (cả Thêm dòng cũ) có Tồn hệ thống 0, chưa lấy tồn sổ của kho. Nếu cần thì tính tồn theo kho, ngày phiếu khi thêm dòng.
- Bản điện thoại: chưa có Thêm hàng loạt.

## Bẫy, quyết định mới

- Không.
