# Tiện ích đồng bộ thu chi FABi ở màn Thu chi (T691)

- Ngày: 30/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/tien/DongBoThuChiFabi.tsx` (mới): dải trên bảng Thu chi báo "Còn N phiếu thu, chi từ FABi chưa đồng bộ", giờ đồng bộ lần cuối, nút Xem lý do, nút Đồng bộ thu chi từ FABi. Hết phiếu chờ thì dải xám "Đã đồng bộ hết". Đơn vị vừa Kết nối FABi mà phiếu còn đổ về thì dải báo đang đồng bộ x / y như Trang chủ (T687).
- Xem lý do: hộp một bảng các phiếu chờ, cột Lý do ("Chưa map quỹ", "Kỳ đã khoá sổ") kèm link Map quỹ, Mở khoá sổ.
- Đồng bộ thu chi từ FABi: dùng `HopDongBo` chọn kỳ, cửa hàng (chọn sẵn cửa hàng bật tự động đồng bộ), ô Đồng bộ lại phiếu đã có; xong báo số phiếu vào sổ, số còn chờ trong kỳ và cửa hàng đã chọn.
- `src/modules/tien/dong-bo-fabi.ts`: `phieuThuChiFabi` trả thêm `khoa` (phiếu thuộc kỳ đã khoá sổ của cửa hàng), mỗi phiếu chờ có ngày, giờ, thu hay chi, lý do. `cho` vẫn chỉ là PTTT chưa map để Danh mục Cửa hàng giữ nguyên. Thêm 4 phiếu mẫu: 3 phiếu cuối tháng 8 (đã khoá sổ), 1 phiếu App giao đồ ăn chưa map.
- `src/ui/generic/VoucherScreen.tsx`: truyền `extra` cho màn 2-1-1 phân hệ tien (Trum giữ file ở T496, chỉ sửa chỗ gọi `VoucherList`).
- Cuối `src/styles/app.css`: mục T691.

- Góp ý sau push đầu: chuyển tiện ích từ dải dưới tab lên bên phải thanh tab phân hệ Thu chi (`src/app/ModuleTabs.tsx`), vì để dưới tab dễ hiểu là chỉ đồng bộ tiền mặt hoặc ngân hàng; bỏ `extra` ở `VoucherScreen.tsx`. Nhãn "N phiếu thu chi chưa đồng bộ", nút chỉ chữ "Đồng bộ".

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py` hai file tien: Sạch.
- `python tools/xuat_bao_cao_he_thong.py`: không chạy được, thiếu `build_present.py` ở `../Present/tools` (ngoài repo) trên máy PhuongXT. Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`.
- Mở thử trên máy: dải, hộp lý do, hộp đồng bộ, thông báo kết quả hiện đúng. Dải xám lúc hết phiếu chờ chưa xem tận mắt vì dữ liệu mẫu luôn còn phiếu chờ.

## Dở dang, việc tiếp theo

- Không. Điện thoại chưa có tiện ích này, chưa ghi việc vì PhuongXT chưa yêu cầu.

## Bẫy, quyết định mới

- Không. PhuongXT chốt chỉ 2 lý do (PTTT chưa map quỹ, kỳ đã khoá sổ), lý do để dạng cột.
